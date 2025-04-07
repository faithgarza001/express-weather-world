const axios = require('axios');

/**
 * Fetch weather data from Pirate Weather API and cache it in Redis.
 * @param {string} latitude - Latitude of the location.
 * @param {string} longitude - Longitude of the location.
 * @returns {Promise<Object>} - Weather data.
 */

// services/weatherService.js
exports.fetchData = async (latitude, longitude) => {
    // Validate latitude and longitude
    if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
    }
    console.log('Fetching weather data for:', latitude, longitude);
    // Pirate Weather API URL


    const url = `https://api.pirateweather.net/forecast/Ss2uvudqJQMHtfzSsgUOHnUhGhU8NZYS/${latitude},${longitude}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        console.error('❌ Error in weatherService:', err.message);
        throw err;
    }
};



