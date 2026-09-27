let currentCity = "";
let temperatureChart = null;
let windChart = null;
let currentTimezone = "Asia/Kolkata";
async function getWeather() {
    document.getElementById("condition").textContent = "Loading...";
    let city = document.getElementById("cityInput").value.trim();
   
    if (city.toLowerCase() === "ooty") {
    city = "Udhagamandalam";
}

if (city.toLowerCase() === "bangalore") {
    city = "Bengaluru";
}

if (city !== "") {
    currentCity = city;
}
else {
    city = currentCity;
}

if (city === "") {
        alert("Please enter a city name");
        return;
    }

    let searchCity = city
    .replace(/newyork/i, "New York");

let geoURL =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=100&language=en&format=json`;
    let geoResponse = await fetch(geoURL);
    let geoData = await geoResponse.json();

    if (!geoData.results) {
        alert("City not found");
        return;
    }
    
let location = geoData.results.find(
    place =>
        place.timezone &&
        place.latitude !== undefined &&
        place.longitude !== undefined &&
        (
            place.feature_code === "PCLI" ||
            place.feature_code === "PPLC" ||
            place.feature_code === "PPLA" ||
            place.feature_code === "PPLA2" ||
            place.feature_code === "PPLA3" ||
            place.feature_code === "PPLA4" ||
            place.feature_code === "PPL" &&
place.population >= 15000
        ) &&
        place.name.toLowerCase().replace(/\s+/g, "") ===
        city.toLowerCase().replace(/\s+/g, "")
);
if (!location) {
    alert("City not found");
    return;
}

    document.getElementById("cityInput").value = location.name;

    let latitude = location.latitude;
    let longitude = location.longitude;

    let weatherURL =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&hourly=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`;
    let weatherResponse = await fetch(weatherURL);

if (!weatherResponse.ok) {
    alert("City not found!");
    return;
}

let weatherData = await weatherResponse.json();
currentTimezone = weatherData.timezone;
let forecast = document.getElementById("forecast");
forecast.innerHTML = "";

for (let i = 0; i < 5; i++) {
    forecast.innerHTML += `
        <div class="forecast-day">
            <h3>${weatherData.daily.time[i]}</h3>
            <p>🌡️ Max: ${weatherData.daily.temperature_2m_max[i]} °C</p>
            <p>🌡️ Min: ${weatherData.daily.temperature_2m_min[i]} °C</p>
        </div>
    `;
}
let labels = weatherData.hourly.time.slice(0, 24).map((time, index) =>
    index % 2 === 0
    ? time.substring(11, 16)
    : ""
);

let temperatures = weatherData.hourly.temperature_2m.slice(0, 24);
let windSpeeds = weatherData.hourly.wind_speed_10m.slice(0, 24);


if (temperatureChart) {
    temperatureChart.destroy();
}

temperatureChart = new Chart(document.getElementById("temperatureChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Temperature °C",
            data: temperatures,
            borderColor: "#ff7043",
            backgroundColor: "rgba(255,112,67,0.15)",
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true
    }
});

if (windChart) {
    windChart.destroy();
}

windChart = new Chart(document.getElementById("windChart"), {
    type: "bar",
    data: {
        labels: labels,
        datasets: [{
            label: "Wind Speed km/h",
            data: windSpeeds,
            backgroundColor: "#64B5F6"
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
    document.getElementById("city").textContent =
        location.name;
    
    let temp = weatherData.current.temperature_2m;

if (!isCelsius) {
    temp = (temp * 9 / 5) + 32;
}

document.getElementById("temperature").textContent =
`🌡️ Temperature: ${temp.toFixed(1)} °${isCelsius ? "C" : "F"}`;

    let feels = weatherData.current.apparent_temperature;

if (!isCelsius) {
    feels = (feels * 9 / 5) + 32;
}

document.getElementById("feelsLike").textContent =
    `🤗 Feels Like: ${feels.toFixed(1)} °${isCelsius ? "C" : "F"}`;

    document.getElementById("humidity").textContent =
        `💧 Humidity: ${weatherData.current.relative_humidity_2m} %`;

    document.getElementById("wind").textContent =
        `💨 Wind Speed: ${weatherData.current.wind_speed_10m} km/h`;

    let code = weatherData.current.weather_code;

let condition = "Unknown";

if (code === 0) {
    condition = "☀️ Clear Sky";
}
else if (code <= 3) {
    condition = "☁️ Cloudy";
}
else if (code <= 67) {
    condition = "🌧️ Rain";
}
else if (code <= 77) {
    condition = "❄️ Snow";
}
else {
    condition = "⛈️ Thunderstorm";
}

document.getElementById("condition").textContent = condition;
document.getElementById("dateTime").textContent =
    new Date().toLocaleString();
console.log(weatherData);



if (code === 0) {
    document.body.style.background = "linear-gradient(135deg, #FFD54F, #FFB74D)";
}
else if (code <= 3) {
    document.body.style.background = "linear-gradient(135deg, #90CAF9, #B0BEC5)";
}
else if (code <= 67) {
    document.body.style.background = "linear-gradient(135deg, #607D8B, #90A4AE)";
}
else {
    document.body.style.background = "linear-gradient(135deg, #37474F, #78909C)";
}
}

setInterval(() => {
    document.getElementById("dateTime").textContent =
        new Date().toLocaleString("en-US", {
            timeZone: currentTimezone
        });
}, 1000);
let isCelsius = true;

function toggleUnit() {
    isCelsius = !isCelsius;

    document.getElementById("cityInput").value = currentCity;

    document.getElementById("unitButton").textContent =
        isCelsius ? "Switch to °F" : "Switch to °C";

    getWeather();
}