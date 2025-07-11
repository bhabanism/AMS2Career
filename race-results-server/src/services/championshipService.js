const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const csvParser = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const driverService = require('./driverService');

const carDataFile = path.join(__dirname, '../../fs/data/csv/Car Data Table.csv');
const carClassDataFile = path.join(__dirname, '../../fs/data/csv/Car Class Data Table.csv');
const suitableTracksFile = path.join(__dirname, '../../fs/data/json/tracks_for_class.json');
const championshipsFile = path.join(__dirname, '../../fs/data/json/available_championships.json');
const driverChampionshipsFile = path.join(__dirname, '../../fs/data/json/driver_championships.json');
const driverFile = path.join(__dirname, '../../fs/data/csv/drivers.csv');

// Cache car class data to avoid repeated reads
let carClassDataCache = null;

async function loadCarClassData() {
    if (carClassDataCache) return carClassDataCache;
    const carClassData = [];
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(carClassDataFile)
                .pipe(csvParser())
                .on('data', (row) => carClassData.push(row))
                .on('end', resolve)
                .on('error', reject);
        });
        carClassDataCache = carClassData;
        console.log('Loaded Car Class Data Table.csv:', carClassData);
        return carClassData;
    } catch (error) {
        console.error(`Error reading Car Class Data Table.csv: ${error.message}`);
        return [];
    }
}

async function getDriverCarClasses(driverId) {
    const drivers = [];
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(driverFile)
                .pipe(csvParser())
                .on('data', (row) => drivers.push(row))
                .on('end', resolve)
                .on('error', reject);
        });
    } catch (error) {
        console.error(`Error reading drivers.csv: ${error.message}`);
        return [];
    }

    const driver = drivers.find(d => d.Name === driverId);
    if (!driver) {
        console.warn(`No driver found for ID: ${driverId}`);
        return [];
    }

    const carsData = [];
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(carDataFile)
                .pipe(csvParser())
                .on('data', (row) => carsData.push(row))
                .on('end', resolve)
                .on('error', reject);
        });
    } catch (error) {
        console.error(`Error reading Car Data Table.csv: ${error.message}`);
        return [];
    }

    const carClassData = await loadCarClassData();
    const carMatch = carsData.find(c => c['Car Game Internal Name'] === driver.Car);
    if (!carMatch) {
        console.warn(`No car match found for Car: ${driver.Car}`);
        return [];
    }

    const carClassMatch = carClassData.find(cc => cc['Car Class Game Internal Name'] === carMatch['Car Class Game Internal Name']);
    if (!carClassMatch) {
        console.warn(`No car class match found for ${carMatch['Car Class Game Internal Name']}`);
        return [];
    }
    return [carClassMatch['Car Class Display Name']];
}

async function getCarClassFee(carClassDisplayName) {
    const carClassData = await loadCarClassData();
    const carClassMatch = carClassData.find(cc => cc['Car Class Display Name'] === carClassDisplayName);
    if (!carClassMatch) {
        console.warn(`No car class found for ${carClassDisplayName}`);
        return 0;
    }
    const rewards = parseInt(carClassMatch['1st Place Season Rewards'], 10);
    if (isNaN(rewards)) {
        console.warn(`Invalid 1st Place Season Rewards for ${carClassDisplayName}: ${carClassMatch['1st Place Season Rewards']}`);
        return 0;
    }
    const fee = Math.floor(rewards * 0.1);
    console.log(`Calculated fee for ${carClassDisplayName}: ${fee} (10% of ${rewards})`);
    return fee;
}

async function getSuitableTracks(carClassDisplayName) {
    try {
        const suitableTracks = JSON.parse(await fsPromises.readFile(suitableTracksFile, 'utf8'));
        console.log('Loaded tracks_for_class.json:', suitableTracks);
        if (!suitableTracks || typeof suitableTracks !== 'object') {
            console.error('tracks_for_class.json is not a valid object');
            return [];
        }
        const tracks = suitableTracks[carClassDisplayName] || [];
        if (!Array.isArray(tracks)) {
            console.error(`Tracks for car class ${carClassDisplayName} is not an array`);
            return [];
        }
        console.log(`Tracks for ${carClassDisplayName}:`, tracks);
        return tracks;
    } catch (error) {
        console.error(`Error reading tracks_for_class.json: ${error.message}`);
        return [];
    }
}

async function getAvailableChampionships(driverId) {
    const carClasses = await getDriverCarClasses(driverId);
    console.log(`Car classes for driver ${driverId}:`, carClasses);
    let championships = [];
    let driverChampionships = [];

    try {
        driverChampionships = JSON.parse(await fsPromises.readFile(driverChampionshipsFile, 'utf8'));
        if (!Array.isArray(driverChampionships)) {
            console.error('driver_championships.json is not an array');
            driverChampionships = [];
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error reading driver_championships.json: ${error.message}`);
        }
    }

    const driverEntry = driverChampionships.find(dc => dc.driverId === driverId);
    const registeredIds = driverEntry ? driverEntry.championshipIds : [];

    try {
        championships = JSON.parse(await fsPromises.readFile(championshipsFile, 'utf8'));
        if (!Array.isArray(championships)) {
            console.error('available_championships.json is not an array');
            championships = [];
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error reading available_championships.json: ${error.message}`);
        }
        championships = [];
    }

    // Generate championships if none exist for the driver's car classes
    const existingClasses = championships.map(c => c.carClass);
    const newClasses = carClasses.filter(cc => !existingClasses.includes(cc));

    for (const carClass of newClasses) {
        const tracks = await getSuitableTracks(carClass);
        const fee = await getCarClassFee(carClass);
        const selectedTracks = tracks.length >= 5 ? tracks.slice(0, 5) : tracks;
        if (selectedTracks.length > 0) {
            championships.push({
                id: uuidv4(),
                carClass,
                tracks: selectedTracks,
                registrationFee: fee,
                isRegistered: false
            });
        }
    }

    // Update isRegistered based on driver_championships.json
    championships.forEach(champ => {
        champ.isRegistered = registeredIds.includes(champ.id);
    });

    // Save updated championships
    try {
        await fsPromises.writeFile(championshipsFile, JSON.stringify(championships, null, 2));
        console.log('Saved available_championships.json:', championships);
    } catch (error) {
        console.error(`Error writing available_championships.json: ${error.message}`);
    }

    // Filter championships for driver's car classes
    return championships.filter(c => carClasses.includes(c.carClass));
}

async function registerForChampionship(driverId, championshipId) {
    let driverChampionships = [];
    try {
        driverChampionships = JSON.parse(await fsPromises.readFile(driverChampionshipsFile, 'utf8'));
        if (!Array.isArray(driverChampionships)) {
            console.error('driver_championships.json is not an array');
            driverChampionships = [];
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error reading driver_championships.json: ${error.message}`);
        }
    }

    // Check driver bucks and deduct registration fee
    const driver = await driverService.getDriver();
    if (!driver) {
        throw new Error('Driver not found');
    }

    const championships = JSON.parse(await fsPromises.readFile(championshipsFile, 'utf8'));
    const championship = championships.find(c => c.id === championshipId);
    if (!championship) {
        throw new Error('Championship not found');
    }

    const fee = championship.registrationFee || 0;
    if (driver.bucks < fee) {
        throw new Error('Insufficient bucks to register');
    }

    // Deduct fee and update driver
    await driverService.updateDriverBucks(driverId, driver.bucks - fee);

    // Add or update driver-championship mapping
    const existing = driverChampionships.find(dc => dc.driverId === driverId);
    if (existing) {
        if (!existing.championshipIds.includes(championshipId)) {
            existing.championshipIds.push(championshipId);
        }
    } else {
        driverChampionships.push({
            driverId,
            championshipIds: [championshipId]
        });
    }

    try {
        await fsPromises.writeFile(driverChampionshipsFile, JSON.stringify(driverChampionships, null, 2));
        console.log(`Registered driver ${driverId} for championship ${championshipId}`);
    } catch (error) {
        console.error(`Error writing driver_championships.json: ${error.message}`);
        throw error;
    }
}

async function getRegisteredChampionships(driverId) {
    let driverChampionships = [];
    try {
        driverChampionships = JSON.parse(await fsPromises.readFile(driverChampionshipsFile, 'utf8'));
        if (!Array.isArray(driverChampionships)) {
            console.error('driver_championships.json is not an array');
            driverChampionships = [];
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error reading driver_championships.json: ${error.message}`);
        }
    }

    const driverEntry = driverChampionships.find(dc => dc.driverId === driverId);
    if (!driverEntry) {
        return [];
    }

    const championships = JSON.parse(await fsPromises.readFile(championshipsFile, 'utf8'));
    return championships.filter(c => driverEntry.championshipIds.includes(c.id));
}

module.exports = {
    getAvailableChampionships,
    registerForChampionship,
    getRegisteredChampionships
};