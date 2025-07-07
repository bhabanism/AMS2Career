const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
const resultsRoutes = require('./routes/results');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/upload', uploadRoutes);
app.use('/results', resultsRoutes);
app.use('/points', resultsRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});