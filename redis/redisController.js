const client = require('./redisClient');  // Import the Redis client

/* Function to get cached data
async function getCachedData(key) {
    try {
        const data = await client.get(key);
        if (data) {
            return JSON.parse(data);  // Assuming cached data is JSON
        }
        return null;  // Return null if there's no cached data
    } catch (err) {
        console.error('Error retrieving cached data:', err);
        throw err;
    }
}

// Function to set cached data with an expiration time (in seconds)
async function setCachedData(key, value, expiration = 900) {  // Default expiration is 15 minutes (900 seconds)
    try {
        await client.setEx(key, expiration, JSON.stringify(value));  // Store the data as a JSON string
    } catch (err) {
        console.error('Error setting cached data:', err);
        throw err;
    }
}

module.exports = {
    getCachedData,
    setCachedData,
};*/

// redis/redisController.js
const cache = {};

exports.getCachedData = async (key) => {
    return cache[key] || null;
};

exports.setCachedData = async (key, data, ttl) => {
    cache[key] = data;
    setTimeout(() => delete cache[key], ttl * 1000); // TTL in seconds
};
