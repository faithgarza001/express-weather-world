//this file will contain the UI logic for the weather application calling from fetch.js
import { getWeatherEmoji, getDayName } from '../common/utils.js'; // adjust path if needed
export function renderWeatherUI(data) {
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
