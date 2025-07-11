const express = require('express');
const router = express.Router();
const driverService = require('../services/driverService');
const fs = require('fs').promises;
const path = require('path');

// GET /driver/locations - Fetch locations from Location Data Table.csv
router.get('/locations', async (req, res) => {
    try {
        const locations = await driverService.getLocations();
        res.status(200).json(locations);
    } catch (error) {
        console.error(`Error fetching locations: ${error.message}`);
        res.status(500).json({ message: `Error fetching locations: ${error.message}` });
    }
});

// POST /driver - Create a new driver
router.post('/', async (req, res) => {
    try {
        const { name, location } = req.body;
        console.log(`Entered driver name: ${name}`); // Log entered name
        const driver = {
            name: 'Shylock', // Hardcoded to Shylock
            location,
            car: 'Mitsubishi Lancer R',
            bucks: 5000,
            license: 'Bronze',
            points: 0
        };
        await driverService.saveDriver(driver);
        res.status(200).json({ message: 'Driver created successfully', driver });
    } catch (error) {
        console.error(`Error creating driver: ${error.message}`);
        res.status(500).json({ message: `Error creating driver: ${error.message}` });
    }
});

// GET /driver - Fetch driver data
router.get('/', async (req, res) => {
    try {
        const driver = await driverService.getDriver();
        res.status(200).json(driver);
    } catch (error) {
        console.error(`Error fetching driver: ${error.message}`);
        res.status(500).json({ message: `Error fetching driver: ${error.message}` });
    }
});

module.exports = router;