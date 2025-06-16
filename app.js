// WeatherWise Pro - Enhanced JavaScript
console.log("🌤️ WeatherWise Pro is initializing...");

// API Configuration
const CONFIG = {
    WEATHER_API: {
        BASE_URL: "https://api.weatherapi.com/v1/",
        API_KEY: "c51a68b5a56945d0b7f64550242508", // Consider moving to environment variable
        ENDPOINTS: {
            CURRENT: "current.json",
            FORECAST: "forecast.json",
            SEARCH: "search.json",
            ASTRONOMY: "astronomy.json",
            HISTORY: "history.json"
        }
    },
    DEFAULTS: {
        CITY: "Islamabad",
        FORECAST_DAYS: 7,
        HOURLY_HOURS: 24
    }
};

// Global State Management
const AppState = {
    currentCity: CONFIG.DEFAULTS.CITY,
    temperatureUnit: 'celsius',
    theme: 'dark',
    isLoading: false,
    lastUpdated: null,
    recentSearches: JSON.parse(localStorage.getItem('weatherwise_recent') || '[]'),
    favorites: JSON.parse(localStorage.getItem('weatherwise_favorites') || '[]'),
    currentWeatherData: null,
    geolocationSupported: 'geolocation' in navigator
};

// DOM Elements Cache
const DOM = {
    // Loading & Error
    loadingScreen: document.getElementById('loadingScreen'),
    errorContainer: document.getElementById('errorContainer'),
    errorMessage: document.getElementById('errorMessage'),
    
    // Navigation & Controls
    themeToggle: document.getElementById('themeToggle'),
    unitsToggle: document.getElementById('unitsToggle'),
    
    // Search Elements
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    recentSearches: document.getElementById('recentSearches'),
    recentList: document.getElementById('recentList'),
    
    // Weather Display
    weatherCard: document.getElementById('weatherCard'),
    cityName: document.getElementById('cityName'),
    countryRegion: document.getElementById('countryRegion'),
    lastUpdated: document.getElementById('lastUpdated'),
    mainTemp: document.getElementById('mainTemp'),
    feelsLike: document.getElementById('feelsLike'),
    weatherIcon: document.getElementById('weatherIcon'),
    weatherCondition: document.getElementById('weatherCondition'),
    currentTime: document.getElementById('currentTime'),
    currentDate: document.getElementById('currentDate'),
    
    // Weather Details
    uvIndex: document.getElementById('uvIndex'),
    uvDescription: document.getElementById('uvDescription'),
    humidity: document.getElementById('humidity'),
    humidityDescription: document.getElementById('humidityDescription'),
    windSpeed: document.getElementById('windSpeed'),
    windDirection: document.getElementById('windDirection'),
    visibility: document.getElementById('visibility'),
    pressure: document.getElementById('pressure'),
    pressureDescription: document.getElementById('pressureDescription'),
    dewPoint: document.getElementById('dewPoint'),
    
    // Astronomy
    sunriseTime: document.getElementById('sunriseTime'),
    sunsetTime: document.getElementById('sunsetTime'),
    moonPhase: document.getElementById('moonPhase'),
    dayLength: document.getElementById('dayLength'),
    
    // Forecasts
    hourlyForecast: document.getElementById('hourlyForecast'),
    forecastList: document.getElementById('forecastList'),
    insightsGrid: document.getElementById('insightsGrid'),
    
    // Air Quality
    airQualitySection: document.getElementById('airQualitySection'),
    aqiValue: document.getElementById('aqiValue'),
    aqiLabel: document.getElementById('aqiLabel'),
    aqiDescription: document.getElementById('aqiDescription'),
    pollutants: document.getElementById('pollutants'),
    
    // Back to top
    backToTop: document.getElementById('backToTop')
};

// Weather Icon Mapping
const WEATHER_ICONS = {
    1000: 'images/clear.png', // Sunny
    1003: 'images/cloudy.png', // Partly cloudy
    1006: 'images/clouds.png', // Cloudy
    1009: 'images/clouds.png', // Overcast
    1030: 'images/mist.png', // Mist
    1063: 'images/rain.png', // Patchy rain possible
    1066: 'images/snow.png', // Patchy snow possible
    1069: 'images/rain.png', // Patchy sleet possible
    1072: 'images/drizzle.png', // Patchy freezing drizzle possible
    1087: 'images/storm.png', // Thundery outbreaks possible
    1114: 'images/snow.png', // Blowing snow
    1117: 'images/snow.png', // Blizzard
    1135: 'images/mist.png', // Fog
    1147: 'images/mist.png', // Freezing fog
    1150: 'images/drizzle.png', // Patchy light drizzle
    1153: 'images/drizzle.png', // Light drizzle
    1168: 'images/drizzle.png', // Freezing drizzle
    1171: 'images/drizzle.png', // Heavy freezing drizzle
    1180: 'images/rain.png', // Patchy light rain
    1183: 'images/rain.png', // Light rain
    1186: 'images/rain.png', // Moderate rain at times
    1189: 'images/rain.png', // Moderate rain
    1192: 'images/raiiny.png', // Heavy rain at times
    1195: 'images/raiiny.png', // Heavy rain
    1198: 'images/rain.png', // Light freezing rain
    1201: 'images/raiiny.png', // Moderate or heavy freezing rain
    1204: 'images/rain.png', // Light sleet
    1207: 'images/rain.png', // Moderate or heavy sleet
    1210: 'images/snow.png', // Patchy light snow
    1213: 'images/snow.png', // Light snow
    1216: 'images/snow.png', // Patchy moderate snow
    1219: 'images/snow.png', // Moderate snow
    1222: 'images/snow.png', // Patchy heavy snow
    1225: 'images/snow.png', // Heavy snow
    1237: 'images/snow.png', // Ice pellets
    1240: 'images/rain.png', // Light rain shower
    1243: 'images/raiiny.png', // Moderate or heavy rain shower
    1246: 'images/raiiny.png', // Torrential rain shower
    1249: 'images/rain.png', // Light sleet showers
    1252: 'images/rain.png', // Moderate or heavy sleet showers
    1255: 'images/snow.png', // Light snow showers
    1258: 'images/snow.png', // Moderate or heavy snow showers
    1261: 'images/snow.png', // Light showers of ice pellets
    1264: 'images/snow.png', // Moderate or heavy showers of ice pellets
    1273: 'images/storm.png', // Patchy light rain with thunder
    1276: 'images/storm.png', // Moderate or heavy rain with thunder
    1279: 'images/storm.png', // Patchy light snow with thunder
    1282: 'images/storm.png' // Moderate or heavy snow with thunder
};

// Utility Functions
const Utils = {
    // Temperature conversion
    convertTemperature(temp, toUnit) {
        if (toUnit === 'fahrenheit') {
            return Math.round((temp * 9/5) + 32);
        }
        return Math.round(temp);
    },

    // Format time
    formatTime(timeString) {
        try {
            const time = new Date(`2000-01-01 ${timeString}`);
            return time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } catch {
            return timeString;
        }
    },

    // Format date
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    },

    // Get weather icon
    getWeatherIcon(code) {
        return WEATHER_ICONS[code] || 'images/clear.png';
    },

    // UV Index description
    getUVDescription(uv) {
        if (uv <= 2) return 'Low';
        if (uv <= 5) return 'Moderate';
        if (uv <= 7) return 'High';
        if (uv <= 10) return 'Very High';
        return 'Extreme';
    },

    // Humidity description
    getHumidityDescription(humidity) {
        if (humidity < 30) return 'Dry';
        if (humidity <= 60) return 'Comfortable';
        if (humidity <= 80) return 'Humid';
        return 'Very Humid';
    },

    // Pressure description
    getPressureDescription(pressure) {
        if (pressure < 1013) return 'Low';
        if (pressure <= 1020) return 'Normal';
        return 'High';
    },

    // Wind direction from degrees
    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(degrees / 22.5) % 16];
    },

    // Calculate day length
    calculateDayLength(sunrise, sunset) {
        try {
            const sunriseTime = new Date(`2000-01-01 ${sunrise}`);
            const sunsetTime = new Date(`2000-01-01 ${sunset}`);
            const diff = sunsetTime - sunriseTime;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        } catch {
            return 'N/A';
        }
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show loading
    showLoading() {
        AppState.isLoading = true;
        if (DOM.loadingScreen) {
            DOM.loadingScreen.style.display = 'flex';
        }
    },

    // Hide loading
    hideLoading() {
        AppState.isLoading = false;
        if (DOM.loadingScreen) {
            DOM.loadingScreen.style.display = 'none';
        }
    },

    // Show error
    showError(message) {
        if (DOM.errorContainer && DOM.errorMessage) {
            DOM.errorMessage.textContent = message;
            DOM.errorContainer.style.display = 'block';
            setTimeout(() => {
                DOM.errorContainer.style.display = 'none';
            }, 5000);
        }
    },

    // Animate elements
    animateElement(element, animationClass, delay = 0) {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, delay);
    },

    // Check if data is fresh (less than 10 minutes old)
    isDataFresh(timestamp) {
        const now = new Date();
        const lastUpdate = new Date(timestamp);
        const diffMinutes = (now - lastUpdate) / (1000 * 60);
        return diffMinutes < 10;
    }
};

// Weather API Service
const WeatherAPI = {
    // Build API URL
    buildUrl(endpoint, params = {}) {
        const url = new URL(endpoint, CONFIG.WEATHER_API.BASE_URL);
        url.searchParams.append('key', CONFIG.WEATHER_API.API_KEY);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        return url.toString();
    },

    // Fetch current weather
    async getCurrentWeather(city) {
        try {
            const url = this.buildUrl(CONFIG.WEATHER_API.ENDPOINTS.CURRENT, { 
                q: city,
                aqi: 'yes'
            });
            const response = await fetch(url);
            if (!response.ok) throw new Error('Weather data not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    },

    // Fetch forecast
    async getForecast(city, days = 7) {
        try {
            const url = this.buildUrl(CONFIG.WEATHER_API.ENDPOINTS.FORECAST, { 
                q: city, 
                days: days,
                aqi: 'yes',
                alerts: 'yes'
            });
            const response = await fetch(url);
            if (!response.ok) throw new Error('Forecast data not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    },

    // Fetch astronomy data
    async getAstronomy(city, date = null) {
        try {
            const params = { q: city };
            if (date) params.dt = date;
            
            const url = this.buildUrl(CONFIG.WEATHER_API.ENDPOINTS.ASTRONOMY, params);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Astronomy data not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching astronomy:', error);
            throw error;
        }
    },

    // Search cities
    async searchCities(query) {
        try {
            const url = this.buildUrl(CONFIG.WEATHER_API.ENDPOINTS.SEARCH, { q: query });
            const response = await fetch(url);
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (error) {
            console.error('Error searching cities:', error);
            return [];
        }
    }
};

// Weather Display Functions
const WeatherDisplay = {
    // Update current weather
    updateCurrentWeather(data) {
        if (!data) return;

        const { location, current } = data;
        const tempUnit = AppState.temperatureUnit === 'celsius' ? 'C' : 'F';
        const temp = AppState.temperatureUnit === 'celsius' ? current.temp_c : current.temp_f;
        const feelsLike = AppState.temperatureUnit === 'celsius' ? current.feelslike_c : current.feelslike_f;

        // Update basic info
        if (DOM.cityName) DOM.cityName.textContent = location.name;
        if (DOM.countryRegion) DOM.countryRegion.textContent = `${location.region}, ${location.country}`;
        if (DOM.mainTemp) DOM.mainTemp.textContent = `${Math.round(temp)}°${tempUnit}`;
        if (DOM.feelsLike) DOM.feelsLike.textContent = `${Math.round(feelsLike)}°${tempUnit}`;
        if (DOM.weatherCondition) DOM.weatherCondition.textContent = current.condition.text;
        if (DOM.weatherIcon) {
            DOM.weatherIcon.src = Utils.getWeatherIcon(current.condition.code);
            DOM.weatherIcon.alt = current.condition.text;
        }

        // Update last updated
        if (DOM.lastUpdated) {
            const lastUpdate = new Date(current.last_updated);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastUpdate) / (1000 * 60));
            DOM.lastUpdated.textContent = `Last updated: ${diffMinutes} minutes ago`;
        }

        // Update weather details
        if (DOM.uvIndex) DOM.uvIndex.textContent = current.uv;
        if (DOM.uvDescription) DOM.uvDescription.textContent = Utils.getUVDescription(current.uv);
        if (DOM.humidity) DOM.humidity.textContent = `${current.humidity}%`;
        if (DOM.humidityDescription) DOM.humidityDescription.textContent = Utils.getHumidityDescription(current.humidity);
        if (DOM.windSpeed) DOM.windSpeed.textContent = `${current.wind_kph} km/h`;
        if (DOM.windDirection) DOM.windDirection.textContent = Utils.getWindDirection(current.wind_degree);
        if (DOM.visibility) DOM.visibility.textContent = `${current.vis_km} km`;
        if (DOM.pressure) DOM.pressure.textContent = `${current.pressure_mb} mb`;
        if (DOM.pressureDescription) DOM.pressureDescription.textContent = Utils.getPressureDescription(current.pressure_mb);
        if (DOM.dewPoint) DOM.dewPoint.textContent = `${Math.round(current.dewpoint_c)}°C`;

        // Update air quality if available
        if (current.air_quality) {
            this.updateAirQuality(data);
        }

        // Show weather card with animation
        if (DOM.weatherCard) {
            DOM.weatherCard.style.display = 'block';
            Utils.animateElement(DOM.weatherCard, 'fade-in');
        }
    },

    // Update time and date
    updateTimeAndDate() {
        const now = new Date();
        if (DOM.currentTime) {
            DOM.currentTime.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            });
        }
        if (DOM.currentDate) {
            DOM.currentDate.textContent = now.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        }
    },

    // Update astronomy data
    updateAstronomy(data) {
        if (!data || !data.astronomy) return;

        const astro = data.astronomy.astro;
        if (DOM.sunriseTime) DOM.sunriseTime.textContent = Utils.formatTime(astro.sunrise);
        if (DOM.sunsetTime) DOM.sunsetTime.textContent = Utils.formatTime(astro.sunset);
        if (DOM.moonPhase) DOM.moonPhase.textContent = astro.moon_phase;
        if (DOM.dayLength) {
            DOM.dayLength.textContent = Utils.calculateDayLength(astro.sunrise, astro.sunset);
        }
    },

    // Update hourly forecast
    updateHourlyForecast(forecastData) {
        if (!DOM.hourlyForecast || !forecastData) return;

        DOM.hourlyForecast.innerHTML = '';
        const today = forecastData.forecast.forecastday[0];
        const tomorrow = forecastData.forecast.forecastday[1];
        
        // Combine today's remaining hours and tomorrow's hours
        const now = new Date();
        const currentHour = now.getHours();
        
        const hours = [
            ...today.hour.slice(currentHour),
            ...(tomorrow ? tomorrow.hour.slice(0, Math.max(0, 24 - (24 - currentHour))) : [])
        ].slice(0, 24);

        hours.forEach((hour, index) => {
            const hourCard = document.createElement('div');
            hourCard.className = 'hourly-card';
            
            const time = new Date(hour.time);
            const tempUnit = AppState.temperatureUnit === 'celsius' ? 'C' : 'F';
            const temp = AppState.temperatureUnit === 'celsius' ? hour.temp_c : hour.temp_f;
            
            hourCard.innerHTML = `
                <div class="hourly-time">${time.getHours().toString().padStart(2, '0')}:00</div>
                <img src="${Utils.getWeatherIcon(hour.condition.code)}" alt="${hour.condition.text}" class="hourly-icon">
                <div class="hourly-temp">${Math.round(temp)}°${tempUnit}</div>
                <div class="hourly-condition">${hour.condition.text}</div>
                <div class="hourly-details">
                    <span>💧 ${hour.humidity}%</span>
                    <span>💨 ${hour.wind_kph} km/h</span>
                    <span>🌧️ ${hour.chance_of_rain}%</span>
                </div>
            `;
            
            DOM.hourlyForecast.appendChild(hourCard);
            Utils.animateElement(hourCard, 'slide-in', index * 50);
        });
    },

    // Update 7-day forecast
    updateWeeklyForecast(forecastData) {
        if (!DOM.forecastList || !forecastData) return;

        DOM.forecastList.innerHTML = '';
        
        forecastData.forecast.forecastday.forEach((day, index) => {
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            
            const date = new Date(day.date);
            const tempUnit = AppState.temperatureUnit === 'celsius' ? 'C' : 'F';
            const maxTemp = AppState.temperatureUnit === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f;
            const minTemp = AppState.temperatureUnit === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f;
            
            const dayName = index === 0 ? 'Today' : 
                           index === 1 ? 'Tomorrow' : 
                           date.toLocaleDateString('en-US', { weekday: 'long' });
            
            forecastCard.innerHTML = `
                <div class="forecast-header">
                    <div class="forecast-day">${dayName}</div>
                    <div class="forecast-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <div class="forecast-weather">
                    <img src="${Utils.getWeatherIcon(day.day.condition.code)}" alt="${day.day.condition.text}" class="forecast-icon">
                    <div class="forecast-condition">${day.day.condition.text}</div>
                </div>
                <div class="forecast-temps">
                    <span class="max-temp">${Math.round(maxTemp)}°</span>
                    <span class="min-temp">${Math.round(minTemp)}°</span>
                </div>
                <div class="forecast-details">
                    <div class="detail-item">
                        <span>🌧️</span>
                        <span>${day.day.daily_chance_of_rain}%</span>
                    </div>
                    <div class="detail-item">
                        <span>💨</span>
                        <span>${day.day.maxwind_kph} km/h</span>
                    </div>
                    <div class="detail-item">
                        <span>💧</span>
                        <span>${day.day.avghumidity}%</span>
                    </div>
                    <div class="detail-item">
                        <span>☀️</span>
                        <span>UV ${day.day.uv}</span>
                    </div>
                </div>
            `;
            
            DOM.forecastList.appendChild(forecastCard);
            Utils.animateElement(forecastCard, 'fade-in', index * 100);
        });
    },

    // Update weather insights
    updateWeatherInsights(data) {
        if (!DOM.insightsGrid || !data) return;

        DOM.insightsGrid.innerHTML = '';
        const insights = this.generateInsights(data);
        
        insights.forEach((insight, index) => {
            const insightCard = document.createElement('div');
            insightCard.className = 'insight-card';
            insightCard.innerHTML = `
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h3 class="insight-title">${insight.title}</h3>
                    <p class="insight-description">${insight.description}</p>
                </div>
            `;
            DOM.insightsGrid.appendChild(insightCard);
            Utils.animateElement(insightCard, 'fade-in', index * 150);
        });
    },

    // Generate weather insights
    generateInsights(data) {
        const insights = [];
        const current = data.current;
        const forecast = data.forecast.forecastday[0].day;

        // UV Index insight
        if (current.uv > 6) {
            insights.push({
                icon: '☀️',
                title: 'High UV Index',
                description: `UV index is ${current.uv}. Wear sunscreen and protective clothing when outdoors.`
            });
        }

        // Rain insight
        if (forecast.daily_chance_of_rain > 70) {
            insights.push({
                icon: '🌧️',
                title: 'Rain Expected',
                description: `${forecast.daily_chance_of_rain}% chance of rain today. Don't forget your umbrella!`
            });
        }

        // Wind insight
        if (current.wind_kph > 25) {
            insights.push({
                icon: '💨',
                title: 'Windy Conditions',
                description: `Strong winds at ${current.wind_kph} km/h. Secure outdoor items and be cautious while driving.`
            });
        }

        // Temperature insight
        const tempDiff = forecast.maxtemp_c - forecast.mintemp_c;
        if (tempDiff > 15) {
            insights.push({
                icon: '🌡️',
                title: 'Large Temperature Range',
                description: `Temperature will vary by ${Math.round(tempDiff)}°C today. Dress in layers for comfort.`
            });
        }

        // Humidity insight
        if (current.humidity > 80) {
            insights.push({
                icon: '💧',
                title: 'High Humidity',
                description: `Humidity is ${current.humidity}%. It may feel warmer than the actual temperature.`
            });
        }

        // Visibility insight
        if (current.vis_km < 5) {
            insights.push({
                icon: '🌫️',
                title: 'Poor Visibility',
                description: `Visibility is only ${current.vis_km} km. Drive carefully and use headlights.`
            });
        }

        // Air Quality insight
        if (current.air_quality) {
            const pm25 = current.air_quality.pm2_5;
            if (pm25 > 35) {
                insights.push({
                    icon: '💨',
                    title: 'Air Quality Alert',
                    description: `PM2.5 levels are elevated at ${pm25.toFixed(1)} μg/m³. Limit outdoor activities.`
                });
            }
        }

        // Pressure trend insight
        if (current.pressure_mb < 1000) {
            insights.push({
                icon: '📉',
                title: 'Low Pressure System',
                description: `Barometric pressure is low at ${current.pressure_mb} mb. Weather changes likely.`
            });
        }

        return insights.slice(0, 6); // Limit to 6 insights
    },

    // Update air quality
    updateAirQuality(data) {
        if (!data.current.air_quality || !DOM.airQualitySection) return;

        const aqi = data.current.air_quality;
        DOM.airQualitySection.style.display = 'block';

        // Extract pollutant values
        const co = aqi.co || 0;
        const no2 = aqi.no2 || 0;
        const o3 = aqi.o3 || 0;
        const so2 = aqi.so2 || 0;
        const pm2_5 = aqi.pm2_5 || 0;
        const pm10 = aqi.pm10 || 0;

        // Simple AQI calculation based on PM2.5 (primary indicator)
        let aqiValue = Math.round(pm2_5 * 2);
        aqiValue = Math.max(1, Math.min(aqiValue, 500)); // Ensure range 1-500

        if (DOM.aqiValue) DOM.aqiValue.textContent = aqiValue;
        
        let aqiDescription = '';
        let aqiColor = '';
        if (aqiValue <= 50) {
            aqiDescription = 'Good - Air quality is satisfactory';
            aqiColor = 'var(--success-color)';
        } else if (aqiValue <= 100) {
            aqiDescription = 'Moderate - Acceptable for most people';
            aqiColor = 'var(--warning-color)';
        } else if (aqiValue <= 150) {
            aqiDescription = 'Unhealthy for sensitive groups';
            aqiColor = 'orange';
        } else if (aqiValue <= 200) {
            aqiDescription = 'Unhealthy - Everyone may experience problems';
            aqiColor = 'var(--danger-color)';
        } else if (aqiValue <= 300) {
            aqiDescription = 'Very Unhealthy - Health alert';
            aqiColor = 'purple';
        } else {
            aqiDescription = 'Hazardous - Emergency conditions';
            aqiColor = 'maroon';
        }

        if (DOM.aqiDescription) DOM.aqiDescription.textContent = aqiDescription;
        if (DOM.aqiValue) DOM.aqiValue.style.color = aqiColor;

        // Update pollutants
        if (DOM.pollutants) {
            DOM.pollutants.innerHTML = `
                <div class="pollutant-item">
                    <span class="pollutant-name">PM2.5:</span>
                    <span class="pollutant-value">${pm2_5.toFixed(1)} μg/m³
                    </span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">PM10:</span>
                    <span class="pollutant-value">${pm10.toFixed(1)} μg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">CO:</span>
                    <span class="pollutant-value">${co.toFixed(1)} μg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">NO₂:</span>
                    <span class="pollutant-value">${no2.toFixed(1)} μg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">O₃:</span>
                    <span class="pollutant-value">${o3.toFixed(1)} μg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">SO₂:</span>
                    <span class="pollutant-value">${so2.toFixed(1)} μg/m³</span>
                </div>
            `;
        }
    }
};

// Location Services
const LocationService = {
    // Get user's current location
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    let message = 'Location access denied';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            message = 'Location request timed out';
                            break;
                    }
                    reject(new Error(message));
                },
                options
            );
        });
    },

    // Get city name from coordinates
    async getCityFromCoordinates(lat, lon) {
        try {
            const query = `${lat},${lon}`;
            const data = await WeatherAPI.getCurrentWeather(query);
            return data.location.name;
        } catch (error) {
            throw new Error('Failed to get location name');
        }
    }
};

// Search and History Management
const HistoryManager = {
    // Add city to recent searches
    addToRecent(city) {
        let recent = [...AppState.recentSearches];
        
        // Remove if already exists
        recent = recent.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        // Add to beginning
        recent.unshift(city);
        
        // Keep only last 8 searches
        recent = recent.slice(0, 8);
        
        // Update state and localStorage
        AppState.recentSearches = recent;
        try {
            localStorage.setItem('weatherwise_recent', JSON.stringify(recent));
        } catch (error) {
            console.warn('Failed to save recent searches:', error);
        }
        
        this.updateRecentSearchesDisplay();
    },

    // Update recent searches display
    updateRecentSearchesDisplay() {
        if (!DOM.recentList || !DOM.recentSearches) return;

        if (AppState.recentSearches.length === 0) {
            DOM.recentSearches.style.display = 'none';
            return;
        }

        DOM.recentSearches.style.display = 'block';
        DOM.recentList.innerHTML = '';

        AppState.recentSearches.forEach((city, index) => {
            const recentItem = document.createElement('div');
            recentItem.className = 'recent-item';
            recentItem.innerHTML = `
                <span class="recent-city">${city}</span>
                <button class="remove-recent" data-city="${city}">×</button>
            `;
            
            // Add click event for city
            recentItem.querySelector('.recent-city').addEventListener('click', () => {
                WeatherManager.searchWeather(city);
            });

            // Add click event for remove button
            recentItem.querySelector('.remove-recent').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromRecent(city);
            });

            DOM.recentList.appendChild(recentItem);
            Utils.animateElement(recentItem, 'fade-in', index * 50);
        });
    },

    // Remove city from recent searches
    removeFromRecent(city) {
        AppState.recentSearches = AppState.recentSearches.filter(
            item => item.toLowerCase() !== city.toLowerCase()
        );
        
        try {
            localStorage.setItem('weatherwise_recent', JSON.stringify(AppState.recentSearches));
        } catch (error) {
            console.warn('Failed to save recent searches:', error);
        }
        
        this.updateRecentSearchesDisplay();
    }
};

// Weather Manager - Main Controller
const WeatherManager = {
    // Initialize the app
    async init() {
        console.log('🌤️ WeatherWise Pro initializing...');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load saved settings
            this.loadSettings();
            
            // Update time and date
            WeatherDisplay.updateTimeAndDate();
            setInterval(() => WeatherDisplay.updateTimeAndDate(), 60000);
            
            // Initialize recent searches display
            HistoryManager.updateRecentSearchesDisplay();
            
            // Load default weather
            await this.searchWeather(AppState.currentCity);
            
            console.log('✅ WeatherWise Pro initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize WeatherWise Pro:', error);
            Utils.showError('Failed to initialize the app. Please refresh the page.');
        }
    },

    // Setup all event listeners
    setupEventListeners() {
        // Search functionality
        if (DOM.searchBtn) {
            DOM.searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (DOM.cityInput) {
            DOM.cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
            
            // Auto-suggestions (debounced)
            DOM.cityInput.addEventListener('input', Utils.debounce((e) => {
                this.handleAutoSuggestions(e.target.value);
            }, 300));
        }

        // Location button
        if (DOM.locationBtn) {
            DOM.locationBtn.addEventListener('click', () => this.handleLocationSearch());
        }

        // Theme toggle
        if (DOM.themeToggle) {
            DOM.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Units toggle
        if (DOM.unitsToggle) {
            DOM.unitsToggle.addEventListener('click', () => this.toggleUnits());
        }

        // Back to top button
        if (DOM.backToTop) {
            DOM.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Show/hide back to top button on scroll
        window.addEventListener('scroll', Utils.debounce(() => {
            if (DOM.backToTop) {
                DOM.backToTop.style.display = window.pageYOffset > 500 ? 'flex' : 'none';
            }
        }, 100));

        // Error container click to hide
        if (DOM.errorContainer) {
            DOM.errorContainer.addEventListener('click', () => {
                DOM.errorContainer.style.display = 'none';
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (DOM.cityInput) {
                    DOM.cityInput.focus();
                }
            }
        });

        // Touch and swipe events for mobile
        this.setupTouchEvents();
    },

    // Setup touch events for mobile gestures
    setupTouchEvents() {
        let startY = 0;
        let startTime = 0;

        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });

        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            const deltaY = startY - endY;
            const deltaTime = endTime - startTime;

            // Swipe down to refresh (if at top of page)
            if (deltaY < -100 && deltaTime < 500 && window.pageYOffset === 0) {
                this.refreshWeather();
            }
        });
    },

    // Handle search input
    async handleSearch() {
        const city = DOM.cityInput?.value.trim();
        if (!city) return;

        await this.searchWeather(city);
        if (DOM.cityInput) DOM.cityInput.value = '';
    },

    // Handle auto-suggestions
    async handleAutoSuggestions(query) {
        if (!query || query.length < 2) return;
        
        try {
            const suggestions = await WeatherAPI.searchCities(query);
            this.displaySuggestions(suggestions.slice(0, 5));
        } catch (error) {
            console.warn('Failed to fetch suggestions:', error);
        }
    },

    // Display search suggestions
    displaySuggestions(suggestions) {
        // Remove existing suggestions
        const existingSuggestions = document.querySelector('.search-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

        if (suggestions.length === 0) return;

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <span class="suggestion-name">${suggestion.name}</span>
                <span class="suggestion-region">${suggestion.region}, ${suggestion.country}</span>
            `;
            
            suggestionItem.addEventListener('click', () => {
                this.searchWeather(suggestion.name);
                if (DOM.cityInput) DOM.cityInput.value = '';
                suggestionsContainer.remove();
            });
            
            suggestionsContainer.appendChild(suggestionItem);
        });

        // Position suggestions below search box
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(suggestionsContainer);
        }

        // Remove suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer?.contains(e.target)) {
                suggestionsContainer.remove();
            }
        }, { once: true });
    },

    // Handle location-based search
    async handleLocationSearch() {
        try {
            Utils.showLoading();
            
            const location = await LocationService.getCurrentLocation();
            const cityName = await LocationService.getCityFromCoordinates(
                location.latitude, 
                location.longitude
            );
            
            await this.searchWeather(`${location.latitude},${location.longitude}`);
            
        } catch (error) {
            console.error('Location search failed:', error);
            Utils.showError(error.message || 'Failed to get your location');
        } finally {
            Utils.hideLoading();
        }
    },

    // Main search weather function
    async searchWeather(city) {
        try {
            Utils.showLoading();
            
            // Fetch all weather data
            const [currentWeather, forecast, astronomy] = await Promise.all([
                WeatherAPI.getCurrentWeather(city),
                WeatherAPI.getForecast(city, 7),
                WeatherAPI.getAstronomy(city).catch(() => null) // Optional
            ]);

            // Update app state
            AppState.currentCity = currentWeather.location.name;
            AppState.currentWeatherData = currentWeather;
            AppState.lastUpdated = new Date();

            // Add to recent searches
            HistoryManager.addToRecent(currentWeather.location.name);

            // Update all display sections
            WeatherDisplay.updateCurrentWeather(currentWeather);
            WeatherDisplay.updateHourlyForecast(forecast);
            WeatherDisplay.updateWeeklyForecast(forecast);
            WeatherDisplay.updateWeatherInsights(forecast);
            
            if (astronomy) {
                WeatherDisplay.updateAstronomy(astronomy);
            }

            // Scroll to weather card on mobile
            if (window.innerWidth <= 768 && DOM.weatherCard) {
                DOM.weatherCard.scrollIntoView({ behavior: 'smooth' });
            }

        } catch (error) {
            console.error('Weather search failed:', error);
            Utils.showError('Unable to fetch weather data. Please check the city name and try again.');
        } finally {
            Utils.hideLoading();
        }
    },

    // Refresh current weather
    async refreshWeather() {
        if (AppState.currentCity) {
            await this.searchWeather(AppState.currentCity);
        }
    },

    // Toggle theme
    toggleTheme() {
        const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
        AppState.theme = newTheme;
        
        document.body.setAttribute('data-theme', newTheme);
        
        // Update button text
        if (DOM.unitsToggle) {
            DOM.unitsToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        }
        
        // Save preference
        try {
            localStorage.setItem('weatherwise_theme', newTheme);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    },

    // Toggle temperature units
    async toggleUnits() {
        const newUnit = AppState.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        AppState.temperatureUnit = newUnit;
        
        // Update button text
        if (DOM.unitsToggle) {
            DOM.unitsToggle.textContent = newUnit === 'celsius' ? '°C' : '°F';
        }
        
        // Refresh display with new units
        if (AppState.currentWeatherData) {
            WeatherDisplay.updateCurrentWeather(AppState.currentWeatherData);
        }
        
        // Save preference
        try {
            localStorage.setItem('weatherwise_units', newUnit);
        } catch (error) {
            console.warn('Failed to save units preference:', error);
        }
    },

    // Load saved settings
    loadSettings() {
        try {
            // Load theme
            const savedTheme = localStorage.getItem('weatherwise_theme');
            if (savedTheme) {
                AppState.theme = savedTheme;
                document.body.setAttribute('data-theme', savedTheme);
            }

            // Load units
            const savedUnits = localStorage.getItem('weatherwise_units');
            if (savedUnits) {
                AppState.temperatureUnit = savedUnits;
                if (DOM.unitsToggle) {
                    DOM.unitsToggle.textContent = savedUnits === 'celsius' ? '°C' : '°F';
                }
            }

            // Load recent searches
            const savedRecent = localStorage.getItem('weatherwise_recent');
            if (savedRecent) {
                AppState.recentSearches = JSON.parse(savedRecent);
            }

        } catch (error) {
            console.warn('Failed to load saved settings:', error);
        }
    }
};

// Performance Monitoring
const PerformanceMonitor = {
    startTime: Date.now(),
    
    logLoadTime() {
        const loadTime = Date.now() - this.startTime;
        console.log(`⚡ WeatherWise Pro loaded in ${loadTime}ms`);
    },

    // Monitor API response times
    async monitorAPICall(apiCall, name) {
        const start = performance.now();
        try {
            const result = await apiCall();
            const end = performance.now();
            console.log(`📊 ${name} API call: ${(end - start).toFixed(2)}ms`);
            return result;
        } catch (error) {
            const end = performance.now();
            console.warn(`❌ ${name} API call failed after ${(end - start).toFixed(2)}ms:`, error);
            throw error;
        }
    }
};

// Error Handling and Logging
const ErrorHandler = {
    // Log error with context
    logError(error, context = '') {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            timestamp,
            context,
            message: error.message,
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('🚨 WeatherWise Error:', errorInfo);
        
        // Could send to error reporting service here
        // this.sendErrorReport(errorInfo);
    },

    // Global error handlers
    setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            this.logError(event.error, 'Global error handler');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError(new Error(event.reason), 'Unhandled promise rejection');
        });
    }
};

// Service Worker Registration for PWA capabilities
const ServiceWorkerManager = {
    async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
            } catch (error) {
                console.warn('❌ Service Worker registration failed:', error);
            }
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Setup error handling
        ErrorHandler.setupGlobalHandlers();
        
        // Register service worker
        await ServiceWorkerManager.register();
        
        // Initialize main app
        await WeatherManager.init();
        
        // Log performance
        PerformanceMonitor.logLoadTime();
        
    } catch (error) {
        ErrorHandler.logError(error, 'App initialization');
        Utils.showError('Failed to initialize the app. Please refresh the page.');
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WeatherManager,
        WeatherAPI,
        WeatherDisplay,
        Utils,
        LocationService,
        HistoryManager
    };
}

console.log('🌟 WeatherWise Pro script loaded successfully!');