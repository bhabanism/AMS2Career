const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const driverDir = path.join(__dirname, '../../fs/data/csv');
const driverFile = path.join(driverDir, 'drivers.csv');
const locationsFile = path.join(__dirname, '../../fs/data/csv/Location Data Table.csv');

async function getLocations() {
    const locations = [];
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(locationsFile)
                .pipe(csvParser())
                .on('data', (row) => locations.push({ country: row.country, location: row.location, coords: row.coods }))
                .on('end', resolve)
                .on('error', reject);
        });
        return locations;
    } catch (error) {
        console.error(`Error reading Location Data Table.csv: ${error.message}`);
        throw error;
    }
}

async function saveDriver(driver) {
    try {
        await fsPromises.mkdir(driverDir, { recursive: true });
        const csvWriter = createCsvWriter({
            path: driverFile,
            header: [
                { id: 'name', title: 'Name' },
                { id: 'location', title: 'Location' },
                { id: 'car', title: 'Car' },
                { id: 'bucks', title: 'Bucks' },
                { id: 'license', title: 'License' },
                { id: 'points', title: 'Points' }
            ]
        });
        await csvWriter.writeRecords([driver]);
    } catch (error) {
        console.error(`Error writing to drivers.csv: ${error.message}`);
        throw error;
    }
}

async function getDriver() {
    try {
        // Check if drivers.csv exists
        await fsPromises.access(driverFile, fsPromises.constants.F_OK);
        
        const drivers = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(driverFile)
                .pipe(csvParser())
                .on('data', (row) => drivers.push({
                    name: row.Name,
                    location: row.Location,
                    car: row.Car,
                    bucks: parseInt(row.Bucks, 10),
                    license: row.License,
                    points: parseInt(row.Points, 10)
                }))
                .on('end', resolve)
                .on('error', reject);
        });
        return drivers[0] || null;
    } catch (error) {
        console.error(`Error reading drivers.csv: ${error.message}`);
        return null;
    }
}

async function updateDriverBucks(driverId, newBucks) {
    try {
        // Check if drivers.csv exists
        await fsPromises.access(driverFile, fsPromises.constants.F_OK);
        
        const drivers = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(driverFile)
                .pipe(csvParser())
                .on('data', (row) => drivers.push(row))
                .on('end', resolve)
                .on('error', reject);
        });

        const driver = drivers.find(d => d.Name === driverId);
        if (!driver) {
            throw new Error('Driver not found');
        }

        driver.Bucks = newBucks;
        const csvWriter = createCsvWriter({
            path: driverFile,
            header: [
                { id: 'Name', title: 'Name' },
                { id: 'Location', title: 'Location' },
                { id: 'Car', title: 'Car' },
                { id: 'Bucks', title: 'Bucks' },
                { id: 'License', title: 'License' },
                { id: 'Points', title: 'Points' }
            ]
        });
        await csvWriter.writeRecords(drivers);
    } catch (error) {
        console.error(`Error updating drivers.csv: ${error.message}`);
        throw error;
    }
}

module.exports = {
    getLocations,
    saveDriver,
    getDriver,
    updateDriverBucks
};