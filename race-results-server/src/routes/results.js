const express = require('express');
const router = express.Router();
const fileService = require('../services/fileService');
const pointsService = require('../services/pointsService');

router.get('/', async (req, res) => {
    try {
        const results = await fileService.getAllRaceResults();
        res.status(200).json(results);
    } catch (error) {
        console.error(`Error reading results: ${error.message}`);
        res.status(500).json({ message: `Error reading results: ${error.message}` });
    }
});

router.get('/drivers', async (req, res) => {
    try {
        const raceResults = await fileService.getAllRaceResults();
        const driverPoints = pointsService.calculateDriverPoints(raceResults);
        res.status(200).json(driverPoints);
    } catch (error) {
        console.error(`Error calculating driver points: ${error.message}`);
        res.status(500).json({ message: `Error calculating driver points: ${error.message}` });
    }
});

router.get('/table', async (req, res) => {
    try {
        const raceResults = await fileService.getAllRaceResults();
        const tableData = pointsService.calculateDriverPointsTable(raceResults);
        res.status(200).json(tableData);
    } catch (error) {
        console.error(`Error generating points table: ${error.message}`);
        res.status(500).json({ message: `Error generating points table: ${error.message}` });
    }
});

module.exports = router;