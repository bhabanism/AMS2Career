const fs = require('fs'); // For createReadStream
const fsPromises = require('fs').promises; // For async file operations
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
        throw error; // Rethrow to let route handle
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
        throw error; // Rethrow to let route handle
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
        return drivers[0] || null; // Return first driver or null if empty
    } catch (error) {
        console.error(`Error reading drivers.csv: ${error.message}`);
        return null; // Return null for any error to prevent crash
    }
}

module.exports = {
    getLocations,
    saveDriver,
    getDriver
};