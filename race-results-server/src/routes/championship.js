const express = require('express');
const router = express.Router();
const championshipService = require('../services/championshipService');

router.get('/available', async (req, res) => {
    try {
        const driverId = 'Shylock'; // Hardcoded for single driver
        const championships = await championshipService.getAvailableChampionships(driverId);
        res.status(200).json(championships);
    } catch (error) {
        console.error(`Error fetching available championships: ${error.message}`);
        res.status(500).json({ message: `Error fetching available championships: ${error.message}` });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { driverId, championshipId } = req.body;
        await championshipService.registerForChampionship(driverId, championshipId);
        res.status(200).json({ message: 'Successfully registered for championship' });
    } catch (error) {
        console.error(`Error registering for championship: ${error.message}`);
        res.status(400).json({ message: `Error registering for championship: ${error.message}` });
    }
});

router.get('/registered', async (req, res) => {
    try {
        const driverId = 'Shylock'; // Hardcoded for single driver
        const championships = await championshipService.getRegisteredChampionships(driverId);
        res.status(200).json(championships);
    } catch (error) {
        console.error(`Error fetching registered championships: ${error.message}`);
        res.status(500).json({ message: `Error fetching registered championships: ${error.message}` });
    }
});

module.exports = router;