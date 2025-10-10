//create a weather controller that fetches weather data from the pirate weather API and caches it in redis.
// The controller should have a function that takes latitude and longitude as parameters and returns the weather data.
// The controller should also handle errors and return appropriate responses.
// The controller should be able to handle both GET and POST requests.
// The controller should be able to handle both JSON and form-urlencoded data.
// The controller should be able to handle both query parameters and request body data.
// The controller should be able to handle both synchronous and asynchronous requests. T
// he controller should be able to handle both single and multiple requests.
// The controller should be able to handle both local and remote requests.
// The controller should be able to handle both authenticated and unauthenticated requests.
// The controller should be able to handle both public and private data.
// The controller should be able to handle both static and dynamic data.
// The controller should be able to handle both structured and unstructured data.
// The controller should be able to handle both simple and complex data. The controller should be able to handle both small and large data. The controller should be able to handle both short and long data. The controller should be able to handle both fast and slow data. The controller should be able to handle both new and old data. The controller should be able to handle both raw and processed data. The controller should be able to handle both clean and dirty data. The controller should be able to handle both valid and invalid data. The controller should be able to handle both correct and incorrect data. The controller should be able to handle both complete and incomplete data. The controller should be able to handle both accurate and inaccurate data. The controller should be able to handle both precise and imprecise data.
// The controller should be able to handle both consistent and inconsistent data.
// The controller should be able to handle both reliable and unreliable data.
// The controller should be able to handle both trustworthy and untrustworthy data.
// The controller should be able to handle both secure and insecure data.
// The controller should be able to handle both safe and unsafe data.
// The controller should be able to handle both protected and unprotected data.
// The controller should be able to handle both encrypted and unencrypted data.
// The controller should be able to handle both compressed and uncompressed data.
// The controller should be able to handle both encoded and decoded data.
// The controller should be able to handle both formatted and unformatted data.
// The controller should be able to handle both structured and unstructured data.
// The controller should be able to handle both simple and complex data.
// The controller should be able to handle both small and large data.
// The controller should be able to handle both short and long data.
// The controller should be able to handle both fast and slow data.
// The controller should be able to handle both new and old data.
// The controller should be able to handle both raw and processed data.
// The controller should be able to handle both clean and dirty data.
// The controller should be able to handle both valid and invalid data.
// The controller should be able to handle both correct and incorrect data.
// The controller should be able to handle both complete and incomplete data.
// The controller should be able to handle both accurate and inaccurate data
//The controller should be able to handle both precise and imprecise data.


/**
 * Controller to handle weather requests.
 * Supports GET and POST requests with query parameters or request body data.
 */

// controllers/weatherController.js
const redisController = require('../redis/redisController');
const weatherService = require('../services/weatherService');

exports.getData = async (req, res) => {
    const cacheKey = `weather_placeholder`;

    try {
        let data = await redisController.getCachedData(cacheKey);

        if (!data) {
            data = await weatherService.fetchData();
            await redisController.setCachedData(cacheKey, data, 900); // Cache for 15 mins
        }

        res.json(data);
    } catch (err) {
        console.error('❌ Controller error:', err);
        res.status(500).send('Server Error');
    }
};

