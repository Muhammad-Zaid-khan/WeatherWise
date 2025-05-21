
console.log("WeatherWise is ready!");

// API configuration
const ApiUrl = "https://api.weatherapi.com/v1/";
const ApiKey = "c51a68b5a56945d0b7f64550242508";
const tip0=document.getElementById("tip0");
const tip1=document.getElementById("tip1");
console.log(tip0);
console.log(tip1);
tip0.src="./images/stay.png";
tip1.src="./images/stay.png";

// DOM Elements
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const themeToggle = document.getElementById("themeToggle");
const forecastList = document.querySelector(".forecast-list");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

// Theme toggle
function toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", newTheme);

    const sunIcon = themeToggle?.querySelector(".sun-icon");
    const moonIcon = themeToggle?.querySelector(".moon-icon");
    if (sunIcon && moonIcon) {
        sunIcon.style.display = newTheme === "light" ? "none" : "inline";
        moonIcon.style.display = newTheme === "light" ? "inline" : "none";
    }
}

// Apply theme on load
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
document.body.setAttribute("data-theme", prefersDarkScheme.matches ? "dark" : "light");

// Theme toggle listener
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

// Weather icon mapping
const weatherIcons = {
    Cloud: "images/clouds.png",
    Mist: "images/mist.png",
    Sunny: "images/clear.png",
    Rain: "images/rain.png",
    Drizzle: "images/drizzle.png",
    "Partly cloudy": "images/cloudy.png",
    "Torrential rain shower": "images/raiiny.png",
    Clear: "images/sunny.png",
    "Patchy rain nearby": "images/clouds.png"
};

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function createForecastCard(day, index) {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.dataset.index = index;

    card.innerHTML = `
        <div class="card-header">
            <h3 class="forecast-date">${formatDate(day.date)}</h3>
            <img class="forecast-icon" src="${weatherIcons[day.day.condition.text] || weatherIcons['Cloud']}" alt="Weather">
        </div>
        <div class="card-content">
            <p class="forecast-temp">${Math.round(day.day.maxtemp_c)}°C</p>
            <p class="forecast-condition">${day.day.condition.text}</p>
        </div>
    `;

    return card;
}

async function fetchForecast(cityName) {
    try {
        console.log('Fetching forecast for:', cityName);
        const response = await fetch(`${ApiUrl}forecast.json?q=${cityName}&days=5&key=${ApiKey}`);
        if (!response.ok) throw new Error('Failed to fetch forecast');
        
        const data = await response.json();
        console.log('Forecast data:', data);
        
        const forecastDays = data.forecast.forecastday;
        forecastList.innerHTML = "";
        
        // Create all forecast cards but show only one
        forecastDays.forEach((day, index) => {
            const card = createForecastCard(day, index);
            card.style.display = index === 0 ? "block" : "none";
            forecastList.appendChild(card);
        });
        
        // Initialize navigation
        let currentDay = 0;
        
        const prevDayBtn = document.querySelector(".prev-day");
        const nextDayBtn = document.querySelector(".next-day");
        
        if (prevDayBtn && nextDayBtn) {
            prevDayBtn.addEventListener("click", () => {
                if (currentDay > 0) {
                    currentDay--;
                    updateForecastDisplay(currentDay);
                }
            });
            
            nextDayBtn.addEventListener("click", () => {
                if (currentDay < forecastDays.length - 1) {
                    currentDay++;
                    updateForecastDisplay(currentDay);
                }
            });
        }
        
        function updateForecastDisplay(dayIndex) {
            const cards = document.querySelectorAll(".forecast-card");
            cards.forEach((card, index) => {
                card.style.display = index === dayIndex ? "block" : "none";
            });
        }
        
    } catch (error) {
        console.error('Error fetching forecast:', error);
        const errorDiv = document.querySelector('.error');
        if (errorDiv) {
            errorDiv.textContent = 'Error fetching forecast data';
            errorDiv.classList.add('show');
            setTimeout(() => errorDiv.classList.remove('show'), 3000);
        }
    }
}

async function checkWeather(cityName) {
    try {
        const response = await fetch(`${ApiUrl}current.json?q=${cityName}&key=${ApiKey}`);
        if (!response.ok) throw new Error('Invalid city name');

        const data = await response.json();
        const currentTemp = Math.round(data.current.temp_c);

        document.querySelector(".temp").textContent = `${currentTemp}°C`;
        document.querySelector(".city").textContent = data.location.name;
        document.querySelector(".weather-desc").textContent = data.current.condition.text;
        document.querySelector(".weather-icon").src = weatherIcons[data.current.condition.text] || weatherIcons['Cloud'];

        const now = new Date();
        document.querySelector(".current-time").textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        document.querySelector(".date").textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        document.querySelector(".uv-index").textContent = data.current.uv;
        document.querySelector(".visibility").textContent = `${data.current.vis_km} km`;
        document.querySelector(".humidity-per").textContent = `${data.current.humidity}%`;
        document.querySelector(".wind-speed").textContent = `${data.current.wind_kph} km/h`;
        document.querySelector(".feels-temp").textContent = `${Math.round(data.current.feelslike_c)}°C`;

        updateWeatherTips(data.current.condition.text, currentTemp);
        await fetchForecast(cityName);

        document.querySelector('.error')?.classList.remove('show');

    } catch (error) {
        console.error('Error fetching weather:', error);
        const errorDiv = document.querySelector('.error');
        if (errorDiv) {
            errorDiv.textContent = 'Could not fetch weather';
            errorDiv.classList.add('show');
            setTimeout(() => errorDiv.classList.remove('show'), 3000);
        }
    }
}

function updateWeatherTips(conditionText, temperature) {
    const tipsContainer = document.querySelector(".tips-container");
    tipsContainer.innerHTML = "";

    const tips = [
        { icon: "./images/stay.png", title: "Stay Hydrated", description: "Drink plenty of water to stay hydrated.", condition: temperature > 25 },
        { icon: "./images/sunscreen.png", title: "Wear Sunscreen", description: "Apply sunscreen with SPF 30 or higher.", condition: temperature > 20 },
        { icon: "./images/dress.png", title: "Dress Appropriately", description: "Wear light clothing during hot weather.", condition: temperature > 30 },
        { icon: "./images/indoor (1).png", title: "Stay Indoors", description: "Avoid outdoor activities during extreme heat.", condition: temperature > 35 },
        { icon: "./images/umberlla.png", title: "Carry Umbrella", description: "Carry an umbrella for protection from rain.", condition: conditionText.includes("Rain") || conditionText.includes("Shower") }
    ];

    tips.filter(tip => tip.condition).slice(0, 2).forEach(tip => {
        const tipItem = document.createElement("div");
        tipItem.className = "tip-item";
        tipItem.innerHTML = `
            <img src="${tip.icon}" alt="${tip.title}">
            <div>
                <h3>${tip.title}</h3>
                <p>${tip.description}</p>
            </div>
        `;
        tipsContainer.appendChild(tipItem);
    });
}

// Search events
if (searchBtn && searchBox) {
    searchBtn.addEventListener('click', () => {
        const city = searchBox.value.trim();
        if (city) checkWeather(city);
    });

    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = searchBox.value.trim();
            if (city) checkWeather(city);
        }
    });
}

// Forecast scroll
let scrollPosition = 0;
const scrollAmount = 120;

if (prevBtn && nextBtn && forecastList) {
    prevBtn.addEventListener("click", () => {
        scrollPosition -= scrollAmount;
        forecastList.scrollLeft = Math.max(0, scrollPosition);
    });

    nextBtn.addEventListener("click", () => {
        scrollPosition += scrollAmount;
        forecastList.scrollLeft = Math.min(forecastList.scrollWidth - forecastList.clientWidth, scrollPosition);
    });
}

// Extra styling for location button (optional)
const style = document.createElement("style");
style.textContent = `
    .location-btn {
        background: linear-gradient(45deg, #00feba, #5b548a);
        border: none;
        border-radius: 25px;
        color: white;
        padding: 10px 20px;
        cursor: pointer;
        margin-left: 10px;
        transition: all 0.3s ease;
    }

    .location-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);

// Initial load
checkWeather("Islamabad");
