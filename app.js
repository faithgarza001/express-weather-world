// app.js
const express = require('express');
const app = express();
const { join } = require("node:path");
const { fetchData } = require("./services/weatherService");
const redisController = require('./redis/redisController');

require('dotenv').config();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'views', 'index.html'));
});

app.post('/api/location', async (req, res) => {
    const { latitude, longitude } = req.body;
    try {
        await redisController.setCachedData('location', { latitude, longitude }, 3600); // Cache for 1 hour
        res.json({ message: 'Location stored successfully' });
    } catch (err) {
        console.error('❌ Error storing location:', err);
        res.status(500).json({ error: 'Failed to store location' });
    }
});

app.get('/api/weather', async (req, res) => {
    try {
        const location = await redisController.getCachedData('location');
        console.log('Location from Redis:', location); // Debug log
        if (!location) {
            return res.status(400).json({ error: 'Location not found' });
        }
        const { latitude, longitude } = location;
        const weatherData = await fetchData(latitude, longitude);
        res.json(weatherData);
    } catch (err) {
        console.error('❌ Error in /api/weather:', err.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌍 Server running at http://localhost:${PORT}`);
});
