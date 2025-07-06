const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000; // Match config.properties

app.use(cors()); // Enable CORS for Angular
app.use(express.json()); // Parse JSON bodies

// POST /upload to receive and save JSON data
app.post('/upload', async (req, res) => {
    try {
        console.log('Received JSON data:', JSON.stringify(req.body, null, 2));
        const dataDir = 'server_data';
        await fs.mkdir(dataDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').replace('.', '');
        const filename = `results_${timestamp}.json`;
        const filepath = path.join(dataDir, filename);
        await fs.writeFile(filepath, JSON.stringify(req.body, null, 2));
        console.log(`Saved JSON data to ${filepath}`);
        res.status(200).json({ message: 'Data received and saved successfully' });
    } catch (error) {
        console.error(`Error saving JSON data to file: ${error.message}`);
        res.status(500).json({ message: `Error saving data: ${error.message}` });
    }
});

// GET /results to list all JSON files and their contents
app.get('/results', async (req, res) => {
    try {
        const dataDir = 'server_data';
        const files = await fs.readdir(dataDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        const results = await Promise.all(jsonFiles.map(async file => {
            const filepath = path.join(dataDir, file);
            const content = await fs.readFile(filepath, 'utf8');
            return JSON.parse(content);
        }));
        res.status(200).json(results);
    } catch (error) {
        console.error(`Error reading results: ${error.message}`);
        res.status(500).json({ message: `Error reading results: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});