const { POINTS_SYSTEM } = require('../utils/constants');
const fs = require('fs');
const csvParser = require('csv-parser');
const path = require('path');

// Load CSVs (run once at startup or cache)
const carsData = [];
fs.createReadStream(path.join(__dirname, '../../fs/data/csv/Car Data Table.csv'))
  .pipe(csvParser())
  .on('data', (row) => carsData.push(row))
  .on('end', () => console.log('Car Data Table.csv loaded'))
  .on('error', (error) => console.error('Error loading Car Data Table.csv:', error));

const tracksData = [];
fs.createReadStream(path.join(__dirname, '../../fs/data/csv/Track Data Table.csv'))
  .pipe(csvParser())
  .on('data', (row) => tracksData.push(row))
  .on('end', () => console.log('Track Data Table.csv loaded'))
  .on('error', (error) => console.error('Error loading Track Data Table.csv:', error));

function calculateDriverPoints(raceResults) {
    const driverPoints = {};

    raceResults.forEach(race => {
        race.Drivers.forEach(driver => {
            const points = POINTS_SYSTEM[driver.Position - 1] || 0;
            if (!driverPoints[driver.DriverName]) {
                driverPoints[driver.DriverName] = 0;
            }
            driverPoints[driver.DriverName] += points;
        });
    });

    return Object.entries(driverPoints)
        .map(([driverName, points]) => ({ driverName, points }))
        .sort((a, b) => b.points - a.points);
}

function calculateDriverPointsTable(raceResults) {
    const driverData = {};
    const trackLayouts = raceResults.map(race => race.TrackLayout);

    // Log available TrackLayout values for debugging
    console.log('TrackLayouts from race results:', trackLayouts);

    // Initialize driver data
    raceResults.forEach(race => {
        race.Drivers.forEach(driver => {
            if (!driverData[driver.DriverName]) {
                driverData[driver.DriverName] = {
                    driverName: driver.DriverName,
                    racePoints: {},
                    totalPoints: 0,
                    carImage: ''
                };
            }
        });
    });

    // Assign points and car images for each race
    raceResults.forEach(race => {
        race.Drivers.forEach(driver => {
            const points = POINTS_SYSTEM[driver.Position - 1] || 0;
            driverData[driver.DriverName].racePoints[race.TrackLayout] = points;
            driverData[driver.DriverName].totalPoints += points;

            // Add car image from CSV (match by Car Game Internal Name)
            const carMatch = carsData.find(c => c['Car Game Internal Name'] === driver.CarName);
            if (carMatch && carMatch['Image File Name'] && carMatch['Car Class Game Internal Name']) {
                const carImagePath = `/images/cars/${carMatch['Car Class Game Internal Name']}/${carMatch['Image File Name']}`;
                driverData[driver.DriverName].carImage = carImagePath;
                // Log for debugging
                try {
                    fs.accessSync(path.join(__dirname, '../../fs', carImagePath));
                    console.log(`Car image found: ${carImagePath}`);
                } catch (error) {
                    console.warn(`Car image not found: ${carImagePath}`);
                }
            } else {
                console.warn(`No car image found for CarName: ${driver.CarName}`);
            }
        });
    });

    // Add track images to trackLayouts
    const enrichedTrackLayouts = trackLayouts.map(track => {
        const trackMatch = tracksData.find(t => t['Layout Name in Game'] === track);
        const imagePath = trackMatch && trackMatch['Image Name'] ? `/images/tracks/${trackMatch['Image Name']}` : '';
        // Log for debugging
        if (imagePath) {
            try {
                fs.accessSync(path.join(__dirname, '../../fs', imagePath));
                console.log(`Track image found: ${imagePath}`);
            } catch (error) {
                console.warn(`Track image not found: ${imagePath}`);
            }
        } else {
            console.warn(`No track image found for TrackLayout: ${track}`);
        }
        return {
            name: track,
            image: imagePath
        };
    });

    return {
        trackLayouts: enrichedTrackLayouts,
        drivers: Object.values(driverData).sort((a, b) => b.totalPoints - a.totalPoints)
    };
}

module.exports = {
    calculateDriverPoints,
    calculateDriverPointsTable
};