const redis = require('redis');

// Use a specific Redis host and port if necessary (for local use, this works fine)
// const client = redis.createClient({
//   host: 'localhost',
//   port: 6379,
// });

const client = redis.createClient();  // Default to localhost:6379

client.connect().catch((err) => {
    console.error('Error connecting to Redis:', err);
});

module.exports = client;
