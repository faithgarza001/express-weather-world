// testRedis.js
const { getCachedData, setCachedData } = require('redis/redisController');

async function testRedis() {
    const key = 'testKey';
    const value = 'Hello, Redis!';
    await setCachedData(key, value, 60); // Cache for 60 seconds
    const cachedValue = await getCachedData(key);
    console.log('Cached Value:', cachedValue); // Should print: Hello, Redis!
}

testRedis().catch(console.error);
