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
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve index.html when accessing the /index URL
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve locations.html when accessing the /locations URL
app.get('/locations', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'locations.html'));
});

// Serve maps.html when accessing the /maps URL
app.get('/maps', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'maps.html'));
});

// Serve reports.html when accessing the /reports URL
app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reports.html'));
});

// Serve analytics.html when accessing the /analytics URL
app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'analytics.html'));
});

// Serve settings.html when accessing the /settings URL
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'settings.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
