const express = require("express");
const axios = require("axios");
const {join} = require("node:path");
const app = express();
const port = process.env.PORT || 3001;
const dotenv = require('dotenv').config();
// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
// Serve static files from the 'public' directory
app.use(express.static(join('images', 'public')));
app.use('/images', express.static('images'));


app.get("/", (req, res) => res.type('html').send(html));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
// To Handle form submission
app.post('/submit', async (req, res) => {
    const data = req.body;
    //use the data to put in the url and make call to api
    console.log(data);
    //query for the city from the data
    const {city, state, country} = req.body; // Destructuring for cleaner access
    console.log(city, state, country);
    try {
        //API key
        const apiKey = process.env.IQAIR_API_TOKEN
        //make a call to the api with the data
        const response = await axios.get(`https://api.airvisual.com/v2/city?city=${city}&state=${state}&country=${country}&key=${apiKey}`);
        //make a call to the api with the data
        const airQualityData = response.data.data;
        // Extract necessary details
        const { current: { pollution, weather } } = airQualityData;
        const pollutionInfo = `AQI (US): ${pollution.aqius}, Main Pollutant (US): ${pollution.mainus}, AQI (CN): ${pollution.aqicn}, Main Pollutant (CN): ${pollution.maincn}`;
        const weatherInfo = `Temperature: ${weather.tp}°C, Pressure: ${weather.pr} hPa, Humidity: ${weather.hu}%, Wind Speed: ${weather.ws} m/s, Wind Direction: ${weather.wd}°, Icon: ${weather.ic}`;

        // Construct HTML string
        const htmlContent = `
      <h1 id="detailsContainer" style="text-align: center; margin-top: 50vh; transform: translateY(-50%);">
        Air Quality Data for ${city}, ${state}, ${country}
      </h1>
      <p style="text-align: center;">Pollution Info: ${pollutionInfo}</p>
      <p style="text-align: center;">Weather Info: ${weatherInfo}</p>
    `;

        // Send the HTML string in the response
        res.send(htmlContent);

    } catch (error) {
        console.log(error);
    }
});
let city;
let state;
let country;
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Weatherly</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.7.2/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);

      axios.get("")
       .then(response => {

       }).catch(function(error){
              console.log("Error", error);
       })
       .finally(function(){
            // always executed
            console.log("Always executed");
       });
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
      }
      body {
        background: white;
        font-family: neo-sans;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
      #IQAirCard {
          position: relative; /* Ensure the card is the positioning context for absolute elements */
          color: #1F348B;
          background: rgba(255, 255, 255, 0.1); /* Semi-transparent background for the glass effect */
          backdrop-filter: blur(10px); /* Adjust blur effect as needed */
          -webkit-backdrop-filter: blur(10px); /* Safari support */
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          overflow: hidden;
      }
      #IQAirCard::before {
          content: "";
          background-image: url('/images/smallWeather.svg'); /* Ensure the path is correct */
          background-repeat: no-repeat;
          background-size: cover; /* Adjust size as needed */
          position: absolute;
          top: 0;
          right: 0; /* Align image to the right */
          width: 50%; /* Adjust width to cover 50% of the card */
          height: 100%;
          z-index: -1; /* Keep the background behind the content */
      }
      .card-body {
          position: relative;
          z-index: 1; /* Ensure text and content are above the background */
      }
      .card-body .btnWeather {
          position: absolute;
          bottom: 220px; /* Adjust as needed */
          right: 5px; /* Adjust as needed */
          z-index: 2; /* Ensure the button is above the image */
      }
    </style>
  </head>
  <body>
       <!-- Jumbotron (Hero Unit) -->
    <div class="container-fluid">
        <div class="p-0 text-center bg-light rounded-3 my-4">
            <h1 class="display-4">Urban Air</h1>
            <p class="lead">"Transforming Air Quality Data into Actionable Insights for Healthier Cities."</p>
        </div>
    </div>

    <!-- Cards Section -->
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-6 mb-4">
                <div id="IQAirCard" class="card">
                    <div class="card-header bg-body-tertiary">
                        <h5 class="card-title">Air Quality Visual Charts and Data</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text w-50">Leveraging the robust IQAir API, our web application empowers users to effortlessly request and access detailed air quality information. Visualize air quality data through intuitive charts and graphs, to make informed decisions and act on the environmental conditions in your city. Whether you're a health-conscious individual, a researcher, or a policy-maker, this service provides the insights you need to breathe easier and make informed decisions for a healthier tomorrow.</p>
                        <!-- Button to Show Data Input Modal -->
                        <button id="showModalButton" type="button" class="btn btn-primary btnWeather" data-bs-toggle="modal" data-bs-target="#dataModal">
                            Request Air Quality Data
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Card Title 2</h5>
                        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        <a href="#" class="btn btn-primary">Go somewhere</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal for Data Input -->
    <div class="modal fade" id="dataModal" tabindex="-1" aria-labelledby="dataModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
             <h5 class="modal-title" id="dataModalLabel">Fill Out The Form To Request Air Quality Data</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form action="/submit" method="post">
              <div class="mb-3">
                  <label class="form-label" for="city">City:</label>
                  <input class="form-control" type="text" id="city" name="city" placeholder="Enter City" required>
              </div>
              <div class="mb-3">
                  <label class="form-label" for="state">State:</label>
                  <input class="form-control" type="text" id="state" name="state" placeholder="Enter Your State" required>
              </div>
              <div class="mb-3">
                  <label class="form-label" for="country">Country:</label>
                  <input class="form-control" type="text" id="country" name="country" placeholder="Enter Your Country" required>
              </div>
              <button type="submit" class="btn btn-primary">Get Air Quality Data</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Error -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="errorModalLabel">Error</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="errorContainer">
            <!-- Error message will be inserted here -->
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`
