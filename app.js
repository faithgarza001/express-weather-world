require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.PIRATE_WEATHER_API;
const IQ_API = process.env.IQAIR_API_TOKEN
app.use(express.json()); // Enable JSON body parsing

app.use(express.static(path.join(__dirname, 'public', 'views')));
app.use(express.static(path.join(__dirname,'public',  'scripts')));  // Serve static files in 'scripts' folder
app.use(express.static('public'));

console.log('API_KEY:', process.env.PIRATE_WEATHER_API);
console.log('IQ_API:', process.env.IQAIR_API_TOKEN);
console.log(`Server running on http://localhost:${PORT}`);


// Test end point: JSONPlaceholder API (simulated data)
const url = 'https://jsonplaceholder.typicode.com/posts/1';

// Simple GET request using Axios
axios.get(url)
    .then(response => {
        // Log the response data to ensure the request works
        console.log('Response data:', response.data);
    })
    .catch(error => {
        // Log any errors that occur
        console.error('Error making the request:', error.message);
    });



async function fetchWeatherData() {
    const IQAirUrl = `https://api.airvisual.com/v2/nearest_city?lat=40.7128&lon=-74.0060&key=${IQ_API}`;

    try {
        const iqAirResponse = await axios.get(IQAirUrl);
        console.log('IQAir Weather Response data:', iqAirResponse.data);
        console.log('City:', iqAirResponse.data.data.city);
        console.log('State:', iqAirResponse.data.data.state);
        console.log('Country:', iqAirResponse.data.data.country);
        console.log('Pollution:', iqAirResponse.data.data.current.pollution);
        console.log('Weather:', iqAirResponse.data.data.current.weather);
    } catch (error) {
        console.error('Error making the Air Quality request:', error.message);
    }

    const pirateWeatherUrl = `https://api.pirateweather.net/forecast/${API_KEY}/40.7128,-74.0060`;

    try {
        const pirateWeatherResponse = await axios.get(pirateWeatherUrl);
        console.log('Pirate Weather Response data:', pirateWeatherResponse.data);
        if (pirateWeatherResponse.data && pirateWeatherResponse.data.currently) {
            console.log('Current Temperature:', pirateWeatherResponse.data.currently.temperature);
            console.log('Current Summary:', pirateWeatherResponse.data.currently.summary);
        }
    } catch (error) {
        console.error('Error making the Weather request:', error.message);
    }
}

module.exports = fetchWeatherData;

//Expose the fetchWeatherData function via endpoint
app.get('/fetch-weather', async (req, res) => {
    try {
        await fetchWeatherData();
        res.status(200).json({ message: 'Weather data fetched successfully' });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});


// Route to fetch weather based on user's location
app.post('/weather', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }

        const cacheKey = `weather:${latitude}:${longitude}`;


        // Fetch Air Quality Data
        const iqAir = `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${IQ_API}`;
        const airQuality = await axios.get(iqAir);

        // Fetch Weather Data
        const url = `https://api.pirateweather.net/forecast/${API_KEY}/${latitude},${longitude}`;
        const response = await axios.get(url);

        if (!response.data || !response.data.daily || !response.data.daily.data) {
            return res.status(500).json({ error: "Invalid weather data received" });
        }

        const dailyForecast = response.data.daily.data.map(entry => ({
            date: new Date(entry.time * 1000).toLocaleDateString(),
            summary: entry.summary,
            temperatureHigh: `${entry.temperatureHigh}°F`,
            temperatureLow: `${entry.temperatureLow}°C`,
            humidity: `${(entry.humidity * 100).toFixed(1)}%`,
            windSpeed: `${entry.windSpeed} km/h`,
            windGust: `${entry.windGust} km/h`,
            windDirection: `${entry.windBearing}°`,
            cloudCover: `${(entry.cloudCover * 100).toFixed(1)}%`,
            precipitationProbability: `${(entry.precipProbability * 100).toFixed(1)}%`,
            uvIndex: entry.uvIndex,
            visibility: `${entry.visibility} km`,
            sunriseTime: new Date(entry.sunriseTime * 1000).toLocaleTimeString(),
            sunsetTime: new Date(entry.sunsetTime * 1000).toLocaleTimeString(),
            icon: entry.icon
        }));

        const result = {
            coordinates: { latitude, longitude },
            weather: {
                location: response.data.timezone || "Unknown Location",
                current: {
                    temperature: `${response.data.currently.temperature}°F`,
                    summary: response.data.currently.summary,
                    humidity: `${(response.data.currently.humidity * 100).toFixed(1)}%`,
                    windSpeed: `${response.data.currently.windSpeed} km/h`,
                    cloudCover: `${(response.data.currently.cloudCover * 100).toFixed(1)}%`,
                    uvIndex: response.data.currently.uvIndex,
                    visibility: `${response.data.currently.visibility} km`
                },
                daily: dailyForecast
            },
            airQuality: {
                state: airQuality.data.data.state,
                city: airQuality.data.data.city
            },
            alerts: response.data.alerts || []
        };


        res.json(result);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// Serve index.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Serve index.html when accessing the /index URL
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Serve locations.html when accessing the /locations URL
app.get('/locations', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'locations.html'));
});

// Serve maps.html when accessing the /maps URL
app.get('/maps', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'maps.html'));
});

// Serve reports.html when accessing the /reports URL
app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'reports.html'));
});

// Serve analytics.html when accessing the /analytics URL
app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'analytics.html'));
});

// Serve settings.html when accessing the /settings URL
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'settings.html'));
});


// ---------------- Analytics Data Endpoint ----------------
const cache = new Map(); // simple in-memory cache
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(lat, lon, units, days){
    return `${Number(lat).toFixed(3)}:${Number(lon).toFixed(3)}:${units || 'us'}:${days || 7}`;
}

function uvBand(u){
    if (u == null || isNaN(u)) return 'Unknown';
    if (u <= 2) return 'Low';
    if (u <= 5) return 'Moderate';
    if (u <= 7) return 'High';
    if (u <= 10) return 'Very High';
    return 'Extreme';
}

function sectorFromBearing(b){
    if (b == null || isNaN(b)) return 'N';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const idx = Math.floor(((b % 360) / 22.5) + 0.5) % 16;
    return dirs[idx];
}

app.post('/analytics-data', async (req, res) => {
    try {
        const { latitude, longitude, units = 'us', days = 7 } = req.body || {};
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'latitude and longitude are required' });
        }
        const key = getCacheKey(latitude, longitude, units, days);
        const now = Date.now();
        const cached = cache.get(key);
        if (cached && (now - cached.ts) < CACHE_TTL_MS){
            return res.json(cached.data);
        }

        // Fetch sources
        const iqAirUrl = `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${IQ_API}`;
        const pirateUrl = `https://api.pirateweather.net/forecast/${API_KEY}/${latitude},${longitude}?units=${units}`;

        const [airResp, wxResp] = await Promise.all([
            axios.get(iqAirUrl),
            axios.get(pirateUrl)
        ]);

        const wx = wxResp.data || {};
        const daily = (wx.daily && Array.isArray(wx.daily.data)) ? wx.daily.data.slice(0, days) : [];

        if (!daily.length){
            return res.status(502).json({ error: 'No daily data available from weather API' });
        }

        // Labels (weekday short)
        const labels = daily.map(d => new Date(d.time * 1000).toLocaleDateString(undefined, { weekday: 'short' }));

        // Temperature
        const highs = daily.map(d => d.temperatureHigh ?? d.apparentTemperatureHigh ?? null);
        const lows = daily.map(d => d.temperatureLow ?? d.apparentTemperatureLow ?? null);
        const validHighs = highs.filter(v => typeof v === 'number');
        const tempSummary = {
            minHigh: validHighs.length ? Math.min(...validHighs) : null,
            maxHigh: validHighs.length ? Math.max(...validHighs) : null,
            avgHigh: validHighs.length ? Number((validHighs.reduce((a,b)=>a+b,0)/validHighs.length).toFixed(1)) : null
        };

        // Humidity (0..1)
        const humidityVals = daily.map(d => (typeof d.humidity === 'number' ? Number((d.humidity * 100).toFixed(1)) : null));
        const validHum = humidityVals.filter(v => typeof v === 'number');
        const humiditySummary = { avg: validHum.length ? Number((validHum.reduce((a,b)=>a+b,0)/validHum.length).toFixed(1)) : null };

        // UV
        const uvMax = daily.map(d => d.uvIndex ?? null);
        const countsByBand = uvMax.reduce((acc, u)=>{ const band = uvBand(u); acc[band]=(acc[band]||0)+1; return acc; }, {});

        // Wind
        const windSpeed = daily.map(d => d.windSpeed ?? null);
        const windGust = daily.map(d => d.windGust ?? null);
        const sectors = {};
        daily.forEach(d => { const s = sectorFromBearing(d.windBearing); sectors[s] = (sectors[s]||0)+1; });

        // Cloud vs Precip
        const cloudPrecipPoints = daily.map((d, idx) => ({
            cloud: typeof d.cloudCover === 'number' ? Number((d.cloudCover * 100).toFixed(1)) : null,
            precip: typeof d.precipProbability === 'number' ? Number((d.precipProbability * 100).toFixed(1)) : null,
            label: labels[idx]
        })).filter(p => p.cloud != null && p.precip != null);

        // Air Quality snapshot
        const aqiData = airResp.data?.data;
        const pollution = aqiData?.current?.pollution;
        const aqiUS = pollution?.aqius ?? null;
        let aqiCategory = 'Unknown';
        if (typeof aqiUS === 'number'){
            if (aqiUS <= 50) aqiCategory = 'Good';
            else if (aqiUS <= 100) aqiCategory = 'Moderate';
            else if (aqiUS <= 150) aqiCategory = 'USG';
            else if (aqiUS <= 200) aqiCategory = 'Unhealthy';
            else if (aqiUS <= 300) aqiCategory = 'Very Unhealthy';
            else aqiCategory = 'Hazardous';
        }

        // Alerts summary
        const alerts = Array.isArray(wx.alerts) ? wx.alerts : [];
        const bySeverity = alerts.reduce((acc, a) => {
            const title = (a.title || '').toLowerCase();
            let sev = 'advisory';
            if (title.includes('warning')) sev = 'warning';
            else if (title.includes('watch')) sev = 'watch';
            acc[sev] = (acc[sev]||0)+1; return acc;
        }, {});

        const data = {
            meta: {
                coords: { lat: Number(latitude), lon: Number(longitude) },
                timezone: wx.timezone || 'Unknown',
                days: daily.length,
                units
            },
            temperature: { labels, highs, lows, summary: tempSummary },
            humidity: { labels, values: humidityVals, summary: humiditySummary },
            uv: { labels, max: uvMax, riskBands: Object.keys(countsByBand), countsByBand },
            wind: { labels, speed: windSpeed, gust: windGust, dirSectors: sectors },
            cloudVsPrecip: { points: cloudPrecipPoints },
            airQuality: {
                city: aqiData?.city || null,
                state: aqiData?.state || null,
                aqiUS,
                category: aqiCategory,
                primaryPollutant: pollution?.mainus || null
            },
            alerts: { count: alerts.length, bySeverity },
            sourceAttribution: { weather: 'Pirate Weather', air: 'IQAir' }
        };

        cache.set(key, { ts: now, data });
        return res.json(data);

    } catch (err) {
        console.error('Error in /analytics-data:', err?.response?.data || err.message || err);
        return res.status(500).json({ error: 'Failed to compute analytics' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
