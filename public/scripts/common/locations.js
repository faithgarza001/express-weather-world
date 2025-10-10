
    document.addEventListener('DOMContentLoaded', () => {
    // List of cities for AQI data
    var cities = ["london", "newyork", "seoul", "guangzhou", "tokyo", "shanghai", "paris", "hongkong"];

    // Configuring the AQI widget
    var aqiWidgetConfig = [];
    cities.forEach(function(city) {
    aqiWidgetConfig.push({
    city: city,
    callback: displayCity // Define the callback to handle AQI data
});
});

    // Call the API with the widget configuration
    _aqiFeed(aqiWidgetConfig);

    // Callback function to display AQI data for each city
    function displayCity(aqi) {
    const cityName = aqi.cityName; // The city name from the API response
    const cityAQI = aqi.aqiValue; // The AQI value from the API response
    const date = new Date(aqi.timestamp).toLocaleDateString(); // The date when the data was retrieved

    // Append AQI information to the container
    const aqiCard = `
            <div class="col-md-4">
                <div class="card p-3 text-center shadow-sm">
                    <h5 class="fw-bold">${cityName}</h5>
                    <p class="fs-2">${cityAQI}</p>
                    <p class="text-muted"><small>${date}</small></p>
                </div>
            </div>
        `;
    document.getElementById('mutiple-city-aqi').innerHTML += aqiCard; // Append to the container
}
});

    // Sample AQI Feed function (This should interact with your backend or external service)
    function _aqiFeed(config) {
    // Simulate fetching AQI data for each city (in a real scenario, you would use an API here)
    config.forEach((item, index) => {
        const aqiData = {
            cityName: item.city.charAt(0).toUpperCase() + item.city.slice(1), // Capitalize city name
            aqiValue: Math.floor(Math.random() * 300) + 1, // Simulate an AQI value
            timestamp: Date.now() // Current timestamp
        };
        item.callback(aqiData); // Call the displayCity function with the simulated AQI data
    });
}

