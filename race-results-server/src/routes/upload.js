const express = require('express');
const router = express.Router();
const fileService = require('../services/fileService');

router.post('/', async (req, res) => {
    try {
        console.log('Received JSON data:', JSON.stringify(req.body, null, 2));
        const filename = await fileService.saveRaceResult(req.body);
        console.log(`Saved JSON data to ${filename}`);
        res.status(200).json({ message: 'Data received and saved successfully' });
    } catch (error) {
        console.error(`Error saving JSON data to file: ${error.message}`);
        res.status(500).json({ message: `Error saving data: ${error.message}` });
    }
});

module.exports = router;