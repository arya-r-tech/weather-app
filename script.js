const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const locationButton = document.getElementById("locationButton");

searchButton.addEventListener("click", getWeather);
locationButton.addEventListener("click", () => {
    getMyLocation();
});

async function getWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        weatherResult.textContent = "Please enter a city name.";
        return;
    }

    weatherResult.textContent = "Loading weather...";

    try {
        // Find the city
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json&countryCode=IN`
        );

        const locationData = await locationResponse.json();

        if (!locationData.results || locationData.results.length === 0) {
            weatherResult.textContent = "City not found. Please try again.";
            return;
        }

        const location = locationData.results[0];

        // Get current weather + 5-day forecast
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        // Current weather
        const weatherCode = weatherData.current.weather_code;

        let weatherDescription;
        let weatherEmoji;

        if (weatherCode === 0) {
            weatherDescription = "Clear Sky";
            weatherEmoji = "☀️";
        } else if (weatherCode === 1) {
            weatherDescription = "Mainly Clear";
            weatherEmoji = "🌤️";
        } else if (weatherCode === 2) {
            weatherDescription = "Partly Cloudy";
            weatherEmoji = "⛅";
        } else if (weatherCode === 3) {
            weatherDescription = "Cloudy";
            weatherEmoji = "☁️";
        } else if (weatherCode >= 51 && weatherCode <= 67) {
            weatherDescription = "Rain";
            weatherEmoji = "🌧️";
        } else if (weatherCode >= 71 && weatherCode <= 77) {
            weatherDescription = "Snow";
            weatherEmoji = "❄️";
        } else if (weatherCode >= 80 && weatherCode <= 82) {
            weatherDescription = "Rain Showers";
            weatherEmoji = "🌦️";
        } else if (weatherCode >= 95) {
            weatherDescription = "Thunderstorm";
            weatherEmoji = "⛈️";
        } else {
            weatherDescription = "Unknown";
            weatherEmoji = "🌡️";
        }

        // Create 5-day forecast
        const forecast = weatherData.daily;

        let forecastHTML = "";

        for (let i = 0; i < 5; i++) {
            const date = new Date(forecast.time[i]);

            const dayName = date.toLocaleDateString("en-US", {
                weekday: "short"
            });

            let forecastEmoji = "🌡️";

            if (forecast.weather_code[i] === 0) {
                forecastEmoji = "☀️";
            } else if (forecast.weather_code[i] === 1) {
                forecastEmoji = "🌤️";
            } else if (forecast.weather_code[i] === 2) {
                forecastEmoji = "⛅";
            } else if (forecast.weather_code[i] === 3) {
                forecastEmoji = "☁️";
            } else if (forecast.weather_code[i] >= 51 && forecast.weather_code[i] <= 67) {
                forecastEmoji = "🌧️";
            } else if (forecast.weather_code[i] >= 80 && forecast.weather_code[i] <= 82) {
                forecastEmoji = "🌦️";
            } else if (forecast.weather_code[i] >= 95) {
                forecastEmoji = "⛈️";
            }

            forecastHTML += `
                <div class="forecast-day">
                    <h4>${dayName}</h4>
                    <div class="forecast-icon">${forecastEmoji}</div>
                    <p>${forecast.temperature_2m_max[i]}°C</p>
                    <small>${forecast.temperature_2m_min[i]}°C</small>
                </div>
            `;
        }

        // Display everything
        weatherResult.innerHTML = `
            <h2>${location.name}, ${location.country}</h2>

            <div class="weather-icon">${weatherEmoji}</div>

            <h3>${weatherData.current.temperature_2m}°C</h3>

            <p>${weatherDescription}</p>

            <p>💧 Humidity: ${weatherData.current.relative_humidity_2m}%</p>

            <p>💨 Wind Speed: ${weatherData.current.wind_speed_10m} km/h</p>

            <hr>

            <h2>5-Day Forecast</h2>

            <div class="forecast-container">
                ${forecastHTML}
            </div>
        `;

    } catch (error) {
        console.error(error);
        weatherResult.textContent = "Something went wrong. Please try again.";
    }
}
function getMyLocation() {
    if (!navigator.geolocation) {
        weatherResult.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    weatherResult.textContent = "Getting your location...";

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);
            console.log("Accuracy:", position.coords.accuracy, "meters");

            getWeatherByCoordinates(latitude, longitude);
        },
        function () {
            weatherResult.textContent =
                "Unable to get your location. Please allow location access.";
        }
    );
}

async function getWeatherByCoordinates(latitude, longitude) {
    weatherResult.textContent = "Loading weather...";

    try {
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&hourly=precipitation_probability` 
        );
        const weatherData = await weatherResponse.json();
       const locationResponse = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
);

const locationData = await locationResponse.json();

console.log("Location data:", locationData);

const cityName =
    locationData.city ||
    locationData.locality ||
    "Your Location";

const countryName =
    locationData.countryName || "India";  


        weatherResult.innerHTML = `
            <h2>${cityName}, ${countryName} 📍</h2>
            <div class="weather-icon">🌤️</div>
            <h3>${weatherData.current.temperature_2m}°C</h3>
            <p>Feels Like: ${weatherData.current.apparent_temperature}°C</p>
            <p>💧Humidity: ${weatherData.current.relative_humidity_2m}%</p>
            <p>💨Wind Speed: ${weatherData.current.wind_speed_10m} km/h</p>
            <p>🌧️ Chance of Rain: ${weatherData.hourly.precipitation_probability[0]}%</p>
`;

    } catch (error) {
        console.error(error);
        weatherResult.textContent =
            "Something went wrong. Please try again.";
    }
}