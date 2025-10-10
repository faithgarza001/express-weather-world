// public/scripts/common/geolocation.js
console.log("Geolocation.js loaded");

function getAndStoreLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude.toFixed(4);
                const lon = pos.coords.longitude.toFixed(4);

                console.log("Latitude:", lat);
                console.log("Longitude:", lon);

                // Send to backend using fetch (POST request with JSON body)
                fetch('/api/location', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ latitude: lat, longitude: lon })
                })
                .then(response => response.json())
                .then(data => {
                    console.log("🌤️ Location stored on backend:", data);
                })
                .catch(error => {
                    console.error("❌ Error storing location on backend:", error);
                });
            },
            (err) => {
                console.error("❌ Geolocation Error:", err.message);
                alert("Geolocation permission denied. Please enable location services.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

document.addEventListener('DOMContentLoaded', getAndStoreLocation);
