// a client-side JavaScript file that will make HTTP requests to a weather API and handle the response data, possibly to display weather information on a web page
//fetch the data from the weather post method and display it on the page
console.log("Fetch.js loaded");

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
// fetch.js

// Function to display weather data on the dashboard
function displayWeather(data) {
    // Geolocation and Location
    document.getElementById('geolocation').innerText = `📍 Geolocation: ${data.latitude}, ${data.longitude}`;
    document.getElementById('location').innerText = `🌍 Location: ${data.timezone}`;

    // Main Weather Icon
    const mainIcon = document.getElementById('mainIcon');
    mainIcon.innerText = getWeatherIcon(data.currently.icon); // Use a helper function to map weather icons

    // Weather Details
    document.getElementById('rain').innerText = `${data.currently.humidity * 100}%`;
    document.getElementById('uv').innerText = `${data.currently.uvIndex}`;
    document.getElementById('windFactor').innerText = `${data.currently.windSpeed} mph`;

    // Sunrise and Sunset
    const sunriseTime = new Date(data.daily.data[0].sunriseTime * 1000).toLocaleTimeString();
    const sunsetTime = new Date(data.daily.data[0].sunsetTime * 1000).toLocaleTimeString();
    const dayLength = calculateDayLength(data.daily.data[0].sunriseTime, data.daily.data[0].sunsetTime);

    document.getElementById('sunrise').innerText = `🌅 Sunrise: ${sunriseTime}`;
    document.getElementById('sunset').innerText = `🌇 Sunset: ${sunsetTime}`;
    document.getElementById('length').innerText = `⏳ Length of Day: ${dayLength}`;

    // 7-Day Forecast
    const dailyForecast = document.getElementById('dailyForecast');
    dailyForecast.innerHTML = ''; // Clear any existing forecast data
    data.daily.data.forEach((day, index) => {
        if (index === 0) return; // Skip today since it's already displayed
        const forecastDate = new Date(day.time * 1000).toLocaleDateString();
        const forecastHTML = `
            <div class="col-md-4 text-center">
                <p>${forecastDate}</p>
                <p>${getWeatherIcon(day.icon)}</p>
                <p>${day.temperatureHigh}°F / ${day.temperatureLow}°F</p>
            </div>
        `;
        dailyForecast.innerHTML += forecastHTML;
    });

    // Other Cities (Placeholder for now)
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.innerHTML = '<p>Other cities feature coming soon...</p>';
}

// Helper function to map weather icons
function getWeatherIcon(icon) {
    const iconMap = {
        'clear-day': '☀️',
        'clear-night': '🌙',
        'rain': '🌧️',
        'snow': '❄️',
        'sleet': '🌨️',
        'wind': '💨',
        'fog': '🌫️',
        'cloudy': '☁️',
        'partly-cloudy-day': '⛅',
        'partly-cloudy-night': '🌥️',
    };
    return iconMap[icon] || '❓'; // Default to a question mark if the icon is unknown
}

// Helper function to calculate day length
function calculateDayLength(sunriseTime, sunsetTime) {
    const diffInSeconds = sunsetTime - sunriseTime;
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}
// Fetch weather data when the page loads
window.onload = fetchWeather;

/*// main.js (Cleaned up version with 30-minute cache and no duplicate DOMContentLoaded)

document.addEventListener('DOMContentLoaded', () => {
    const calendarInput = document.getElementById('calendarInput');
    const calendarIcon = document.getElementById('calendarIcon');
    const mainIcon = document.getElementById('mainIcon');
    const loadingMessage = document.getElementById('loadingMessage');
    const alertsIcon = document.getElementById('alertsIcon');
    const alertsDropdown = document.getElementById('alertsDropdown');

    const TTL = 30 * 60 * 1000; // 30 minutes

    function setLocalStorageWithExpiry(key, value, ttl = TTL) {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    function getLocalStorageWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    }

    function showLoadingMessage() {
        loadingMessage.style.display = 'block';
    }

    function hideLoadingMessage() {
        loadingMessage.style.display = 'none';
    }

    function updateIconBasedOnTime() {
        const currentHour = new Date().getHours();
        if (currentHour >= 19) {
            mainIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">...</svg>`; // Your SVG here
        }
    }

    function getDayName(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    function getWeatherEmoji(summary) {
        if (summary.includes("Clear")) return "☀️";
        if (summary.includes("Cloudy")) return "☁️";
        if (summary.includes("Rain")) return "🌧️";
        if (summary.includes("Snow")) return "❄️";
        return "🌤️";
    }

    async function fetchWeatherData(lat, lon) {
        const cacheKey = `weather:${lat}:${lon}`;
        const cached = getLocalStorageWithExpiry(cacheKey);
        if (cached) return cached;

        const response = await fetch('/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lon })
        });
        const data = await response.json();
        setLocalStorageWithExpiry(cacheKey, data);
        return data;
    }

    async function displayWeather(lat, lon) {
        try {
            showLoadingMessage();
            const data = await fetchWeatherData(lat, lon);

            document.getElementById('location').innerHTML = `
                <h2>${data.airQuality.state}, ${data.airQuality.city}</h2>
                <h4>${new Date().toLocaleDateString()}</h4>
                <h1 class="display-2">${data.weather.current.temperature}</h1>
                <p class="text-muted">High: ${data.weather.daily[0].temperatureHigh} | Low: ${data.weather.daily[0].temperatureLow}</p>
                <p>${data.weather.current.summary}, Feels Like ${data.weather.current.temperature}</p>`;

            document.getElementById('windFactor').innerText = `${data.weather.current.windSpeed} mph`;
            document.getElementById('uv').innerText = `${data.weather.current.uvIndex}%`;
            document.getElementById('rain').innerText = `${data.weather.current.humidity}`;

            const dailyForecastContainer = document.getElementById('dailyForecast');
            dailyForecastContainer.innerHTML = "";

            data.weather.daily.forEach(day => {
                const forecastCard = `
                    <div class="col-md-3">
                        <div class="card p-3 text-center shadow-sm">
                            <h5 class="fw-bold">${getDayName(day.date)}</h5>
                            <p class="fs-2">${getWeatherEmoji(day.summary)}</p>
                            <p class="fw-bold">${day.temperatureHigh} / ${day.temperatureLow}</p>
                            <p class="text-muted">${day.summary}</p>
                        </div>
                    </div>`;
                dailyForecastContainer.innerHTML += forecastCard;
            });

            alertsIcon.addEventListener('click', () => {
                if (data.alerts.length === 0) {
                    alertsDropdown.innerHTML = `<div class="alert alert-info"><h4>No Alerts</h4><p>No current weather alerts.</p></div>`;
                } else {
                    alertsDropdown.innerHTML = data.alerts.map(alert => `
                        <div class="alert alert-warning">
                            <h4>${alert.title}</h4>
                            <p>${alert.description}</p>
                            <p>Severity: ${alert.severity}</p>
                            <p>Regions: ${alert.regions.join(', ')}</p>
                            <p>Expires: ${new Date(alert.expires * 1000).toLocaleString()}</p>
                            <a href="${alert.uri}" target="_blank">More Info</a>
                        </div>`).join('');
                }
                alertsDropdown.style.display = 'block';
            });

            document.addEventListener('click', (event) => {
                if (!alertsIcon.contains(event.target) && !alertsDropdown.contains(event.target)) {
                    alertsDropdown.style.display = 'none';
                }
            });

        } catch (err) {
            console.error("Weather Display Error:", err);
        } finally {
            hideLoadingMessage();
        }
    }

    function setupCalendar(lat, lon) {
        flatpickr(calendarInput, {
            onChange: function(selectedDates, dateStr) {
                console.log("Selected date:", dateStr);
                alert(`You clicked on ${dateStr}`);
                // Optional: Add fetch for historical data
            },
            onDayCreate: function(_, __, ___, dayElem) {
                dayElem.addEventListener('click', () => {
                    console.log("Day clicked:", dayElem.getAttribute('data-date'));
                });
            }
        });

        calendarIcon.addEventListener('click', () => {
            calendarInput.style.display = 'block';
            calendarInput._flatpickr.open();
        });

        calendarInput._flatpickr.config.onClose.push(() => {
            calendarInput.style.display = 'none';
        });
    }

    updateIconBasedOnTime();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                displayWeather(lat, lon);
                setupCalendar(lat, lon);
            },
            (err) => {
                console.error("Geolocation Error:", err);
                alert("Geolocation permission denied. Please enable location services.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }

    document.getElementById('locationSearch').addEventListener('keypress', async function (e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (!query) return;

            showLoadingMessage();

            try {
                // Step 1: Get lat/lon using OpenStreetMap's Nominatim API
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
                const geoData = await geoResponse.json();

                if (!geoData || geoData.length === 0) {
                    alert('Location not found.');
                    hideLoadingMessage();
                    return;
                }

                const latitude = geoData[0].lat;
                const longitude = geoData[0].lon;

                // Step 2: Fetch weather data for that location
                const response = await fetch('/weather', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ latitude, longitude })
                });

                const data = await response.json();
                console.log("Search Result Weather Data:", data);

                // Step 3: Update UI
                document.getElementById('location').innerHTML = `
                <h2>${data.airQuality.state}, ${data.airQuality.city}</h2>
                <h4>${new Date().toLocaleDateString()}</h4>
                <h1 class="display-2">${data.weather.current.temperature}</h1>
                <p class="text-muted">High: ${data.weather.daily[0].temperatureHigh} | Low: ${data.weather.daily[0].temperatureLow}</p>
                <p>${data.weather.current.summary}, Feels Like ${data.weather.current.temperature}</p>`;

                document.getElementById('windFactor').innerText = `${data.weather.current.windSpeed} mph`;
                document.getElementById('uv').innerText = `${data.weather.current.uvIndex}%`;
                document.getElementById('rain').innerText = `${data.weather.current.humidity}`;

                // Optionally update 7-day forecast
                const dailyForecastContainer = document.getElementById('dailyForecast');
                dailyForecastContainer.innerHTML = "";
                data.weather.daily.forEach(day => {
                    const dayName = getDayName(day.date);
                    dailyForecastContainer.innerHTML += `
                    <div class="col-md-3">
                        <div class="card p-3 text-center shadow-sm">
                            <h5 class="fw-bold">${dayName}</h5>
                            <p class="fs-2">${getWeatherEmoji(day.summary)}</p>
                            <p class="fw-bold">${day.temperatureHigh} / ${day.temperatureLow}</p>
                            <p class="text-muted">${day.summary}</p>
                        </div>
                    </div>
                `;
                });

            } catch (error) {
                console.error('Search Error:', error);
                alert('Failed to fetch weather for this location.');
            } finally {
                hideLoadingMessage();
            }
        }
    });

});

*/
