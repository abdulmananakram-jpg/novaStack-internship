const API_KEY = '01ce25d29338e8b878d33e9b78dcc5d1';

const input = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const geoBtn = document.getElementById('geoBtn');
const unitToggle = document.getElementById('unitToggle');
const skeleton = document.getElementById('skeleton');
const weatherCard = document.getElementById('weatherCard');
const forecastSection = document.getElementById('forecastSection');
const forecastStrip = document.getElementById('forecastStrip');
const errorCard = document.getElementById('errorCard');
const errorText = document.getElementById('errorText');
const themeToggle = document.getElementById('themeToggle');

const locationEl = document.getElementById('location').querySelector('span');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const weatherSvgIcon = document.getElementById('weatherSvgIcon');

let currentUnit = 'metric';
let currentCity = '';
let searchTimeout;

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

unitToggle.addEventListener('click', (e) => {
  const unitEl = e.target.closest('.unit');
  if (!unitEl) return;
  document.querySelectorAll('.unit').forEach((u) => u.classList.remove('active'));
  unitEl.classList.add('active');
  currentUnit = unitEl.dataset.unit;
  if (currentCity) fetchWeather(currentCity);
});

async function fetchSuggestions(query) {
  if (query.length < 2) { suggestions.classList.remove('active'); return; }
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    suggestions.innerHTML = '';
    if (data.length) {
      data.forEach((loc) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = `${loc.name}, ${loc.state ? loc.state + ', ' : ''}${loc.country}`;
        div.addEventListener('click', () => {
          input.value = loc.name;
          suggestions.classList.remove('active');
          fetchWeather(loc.name);
        });
        suggestions.appendChild(div);
      });
      suggestions.classList.add('active');
    } else {
      suggestions.classList.remove('active');
    }
  } catch {
    suggestions.classList.remove('active');
  }
}

input.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => fetchSuggestions(input.value), 300);
});

input.addEventListener('blur', () => {
  setTimeout(() => suggestions.classList.remove('active'), 200);
});

async function fetchWeather(city) {
  currentCity = city;
  showSkeleton();
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) throw new Error('City not found');
      if (res.status === 401) throw new Error('Invalid API key. Get a free key at openweathermap.org');
      if (res.status === 429) throw new Error('Too many requests. Please wait a moment.');
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    displayWeather(data);
    fetchForecast(city);
    showWeather();
  } catch (err) {
    showError(err.message);
  }
}

async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    displayForecast(data);
  } catch { forecastSection.hidden = true; }
}

function displayWeather(data) {
  const { name, sys, main, weather, wind: windData } = data;
  const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
  const speedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';

  locationEl.textContent = `${name}, ${sys.country}`;
  temperature.textContent = Math.round(main.temp);
  document.querySelector('.temp-unit').textContent = tempUnit;
  condition.textContent = weather[0].description;
  feelsLike.textContent = `${Math.round(main.feels_like)}${tempUnit}`;
  humidity.textContent = `${main.humidity}%`;
  windSpeed.textContent = `${Math.round(windData.speed * (currentUnit === 'metric' ? 3.6 : 1))} ${speedUnit}`;

  setWeatherIcon(weather[0].id, weather[0].icon);
  setWeatherBackground(weather[0].id, weather[0].icon);
}

function displayForecast(data) {
  const daily = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  });

  const entries = Object.entries(daily).slice(0, 5);
  forecastStrip.innerHTML = '';

  entries.forEach(([date, items]) => {
    const dayData = items[Math.floor(items.length / 2)];
    const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
    const tempUnit = currentUnit === 'metric' ? '°' : '°';
    const temps = items.map((i) => i.main.temp);
    const high = Math.round(Math.max(...temps));
    const low = Math.round(Math.min(...temps));
    const weatherId = dayData.weather[0].id;

    const div = document.createElement('div');
    div.className = 'forecast-day';
    div.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-icon">${getWeatherIconClass(weatherId)}</div>
      <div class="day-temp">${high}${tempUnit} <span>${low}${tempUnit}</span></div>
    `;
    forecastStrip.appendChild(div);
  });

  forecastSection.hidden = false;
}

function getWeatherIconClass(id) {
  if (id >= 200 && id < 300) return '<i class="fas fa-bolt" style="color:#f59e0b"></i>';
  if (id >= 300 && id < 600) return '<i class="fas fa-cloud-rain" style="color:#60a5fa"></i>';
  if (id >= 600 && id < 700) return '<i class="fas fa-snowflake" style="color:#93c5fd"></i>';
  if (id >= 700 && id < 800) return '<i class="fas fa-smog" style="color:#94a3b8"></i>';
  if (id === 800) return '<i class="fas fa-sun" style="color:#fbbf24"></i>';
  return '<i class="fas fa-cloud-sun" style="color:#94a3b8"></i>';
}

function setWeatherIcon(id, icon) {
  const iconMap = {
    '01d': 'fa-sun', '01n': 'fa-moon',
    '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
    '03d': 'fa-cloud', '03n': 'fa-cloud',
    '04d': 'fa-cloud', '04n': 'fa-cloud',
    '09d': 'fa-cloud-showers-heavy', '09n': 'fa-cloud-showers-heavy',
    '10d': 'fa-cloud-rain', '10n': 'fa-cloud-rain',
    '11d': 'fa-bolt', '11n': 'fa-bolt',
    '13d': 'fa-snowflake', '13n': 'fa-snowflake',
    '50d': 'fa-smog', '50n': 'fa-smog',
  };
  weatherSvgIcon.className = `fas ${iconMap[icon] || 'fa-cloud-sun'}`;
  weatherSvgIcon.style.color = id === 800 ? '#fbbf24' : '';
}

function setWeatherBackground(id) {
  document.body.className = '';
  if (id >= 200 && id < 300) document.body.classList.add('weather-thunderstorm');
  else if (id >= 300 && id < 600) document.body.classList.add('weather-rainy');
  else if (id >= 600 && id < 700) document.body.classList.add('weather-snowy');
  else if (id >= 700 && id < 800) document.body.classList.add('weather-cloudy');
  else if (id >= 800) document.body.classList.add('weather-sunny');
}

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) { showError('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    showSkeleton();
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=${currentUnit}&appid=${API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      displayWeather(data);
      input.value = data.name;
      currentCity = data.name;
      fetchForecast(data.name);
      showWeather();
    } catch { showError('Could not get weather for your location.'); }
  }, () => showError('Location permission denied.'));
});

function showSkeleton() {
  weatherCard.hidden = true;
  errorCard.hidden = true;
  skeleton.hidden = false;
  forecastSection.hidden = true;
}

function showWeather() {
  skeleton.hidden = true;
  errorCard.hidden = true;
  weatherCard.hidden = false;
}

function showError(msg) {
  skeleton.hidden = true;
  weatherCard.hidden = true;
  forecastSection.hidden = true;
  errorCard.hidden = false;
  errorText.textContent = msg;
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    suggestions.classList.remove('active');
    const city = input.value.trim();
    if (city) fetchWeather(city);
  }
});

document.getElementById('searchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  suggestions.classList.remove('active');
  const city = input.value.trim();
  if (city) fetchWeather(city);
});
