

// Map Setup
const map = L.map('map').setView([51.5074, -0.1278], 10);  // Default location (London)

// Add OpenStreetMap tiles to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const API_KEY = ''; // Replace with your actual API key
const AQI_API_URL = `https://api.waqi.info/feed/here/?token=${API_KEY}`;

// Fetch AQI data from AQICN API
async function fetchAQIData() {
    try {
        const response = await fetch(AQI_API_URL);
        const data = await response.json();
        console.log(data);
        if (data.status === 'ok') {
            const aqi = data.data.aqi;  // Air Quality Index (AQI) value
            const cityName = data.data.city.name;

            // Create a custom marker to represent the AQI value
            const marker = L.marker([data.data.city.geo[0], data.data.city.geo[1]])
                .addTo(map)
                .bindPopup(`<b>${cityName}</b><br>Air Quality: ${aqi}`)
                .openPopup();
        } else {
            console.error('Failed to fetch AQI data');
        }
    } catch (error) {
        console.error('Error fetching AQI data:', error);
    }
}

// Call function to fetch AQI data and display it on the map
fetchAQIData();
