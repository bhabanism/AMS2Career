const fs = require('fs').promises;
const path = require('path');

const dataDir = 'server_data';

async function saveRaceResult(data) {
    await fs.mkdir(dataDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').replace('.', '');
    const filename = `results_${timestamp}.json`;
    const filepath = path.join(dataDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    return filename;
}

async function getAllRaceResults() {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const results = await Promise.all(jsonFiles.map(async file => {
        const filepath = path.join(dataDir, file);
        const content = await fs.readFile(filepath, 'utf8');
        return JSON.parse(content);
    }));
    return results;
}

module.exports = {
    saveRaceResult,
    getAllRaceResults
};