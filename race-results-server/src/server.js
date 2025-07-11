const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadRoutes = require('./routes/upload');
const resultsRoutes = require('./routes/results');
const driverRoutes = require('./routes/driver');

const app = express();
const port = 3000;

// Log the resolved static path for debugging
const imagesPath = path.join(__dirname, '../fs/images');
console.log(`Serving images from: ${imagesPath}`);

app.use(cors());
app.use(express.json());

app.use('/upload', uploadRoutes);
app.use('/results', resultsRoutes);
app.use('/points', resultsRoutes);
app.use('/driver', driverRoutes);

// Serve static images with request logging
app.use('/images', (req, res, next) => {
    console.log(`Image request: ${req.originalUrl}`);
    express.static(imagesPath)(req, res, next);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});