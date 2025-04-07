// a client-side JavaScript file that will make HTTP requests to a weather API and handle the response data, possibly to display weather information on a web page
//fetch the data from the weather post method and display it on the page
// public/scripts/weather/fetch.js
console.log("Fetch.js loaded");
// fetch.js

// Function to fetch weather data from the backend
async function fetchWeather() {
    try {
        const response = await fetch('/api/weather'); // Fetch weather data from the backend
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const weatherData = await response.json(); // Parse the JSON response
        displayWeather(weatherData); // Pass the data to the display function
    } catch (error) {
        console.error('❌ Error fetching weather data:', error.message);
        document.getElementById('weather').innerText = 'Failed to load weather data.';
    }
}

// Function to display weather data on the page
function displayWeather(data) {
    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = `
        <h2>Weather Information</h2>
        <p>Temperature: ${data.currently.temperature}°F</p>
        <p>Summary: ${data.currently.summary}</p>
        <p>Humidity: ${data.currently.humidity}</p>
    `;
}

// Fetch weather data when the page loads
window.onload = fetchWeather;


