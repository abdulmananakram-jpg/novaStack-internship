const API_KEY = '01ce25d29338e8b878d33e9b78dcc5d1';

const input = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const geoBtn = document.getElementById('geoBtn');
const unitToggle = document.getElementById('unitToggle');
const skeleton = document.getElementById('skeleton');
const weatherCard = document.getElementById('weatherCard');
const hourlySection = document.getElementById('hourlySection');
const hourlyStrip = document.getElementById('hourlyStrip');
const forecastSection = document.getElementById('forecastSection');
const forecastStrip = document.getElementById('forecastStrip');
const errorCard = document.getElementById('errorCard');
const errorText = document.getElementById('errorText');
const themeToggle = document.getElementById('themeToggle');
const recentCities = document.getElementById('recentCities');

const locationEl = document.getElementById('location').querySelector('span');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const aqi = document.getElementById('aqi');
const weatherSvgIcon = document.getElementById('weatherSvgIcon');

let currentUnit = 'metric';
let currentCity = '';
let searchTimeout;

// GSAP entrance
gsap.from('.app-header', { y: -40, opacity: 0, duration: 0.8, ease: 'power3.out' });
gsap.from('.search-section', { y: -20, opacity: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
gsap.from('.theme-toggle', { x: 20, opacity: 0, duration: 0.5, delay: 0.3, ease: 'power3.out' });

function animateCardIn() {
  gsap.fromTo(weatherCard,
    { y: 40, opacity: 0, scale: 0.96 },
    { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', clearProps: 'transform' }
  );
  gsap.fromTo('.reveal-stagger',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
  );
  gsap.fromTo('.stat-card',
    { y: 16, opacity: 0, scale: 0.9 },
    { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.04, ease: 'back.out(1.7)' }
  );
  gsap.fromTo('.forecast-day',
    { y: 12, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.35, stagger: 0.03, ease: 'power2.out' }
  );
}

function animateNumber(el, target) {
  const dur = 1.2;
  const start = parseFloat(el.textContent) || 0;
  gsap.to({ val: start }, {
    val: target,
    duration: dur,
    ease: 'power2.out',
    onUpdate: function () {
      el.textContent = Math.round(this.targets()[0].val);
    }
  });
}

// Particle canvas
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let particleCount = 40;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.3 + 0.05;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(44, 125, 160, ${this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}
initParticles();

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(44, 125, 160, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Theme toggle
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  gsap.fromTo('.theme-toggle', { rotate: 0 }, { rotate: 360, duration: 0.5, ease: 'power2.out' });
});

// Recent cities
function loadRecent() {
  const cities = JSON.parse(localStorage.getItem('weatherRecent') || '[]');
  recentCities.innerHTML = '';
  cities.slice(0, 4).forEach(city => {
    const chip = document.createElement('span');
    chip.className = 'recent-chip';
    chip.textContent = city;
    chip.addEventListener('click', () => {
      input.value = city;
      fetchWeather(city);
    });
    recentCities.appendChild(chip);
  });
}
loadRecent();

function addRecent(city) {
  let cities = JSON.parse(localStorage.getItem('weatherRecent') || '[]');
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  if (cities.length > 4) cities = cities.slice(0, 4);
  localStorage.setItem('weatherRecent', JSON.stringify(cities));
  loadRecent();
}

// Unit toggle
unitToggle.addEventListener('click', (e) => {
  const unitEl = e.target.closest('.unit');
  if (!unitEl) return;
  document.querySelectorAll('.unit').forEach((u) => u.classList.remove('active'));
  unitEl.classList.add('active');
  currentUnit = unitEl.dataset.unit;
  if (currentCity) fetchWeather(currentCity);
});

// Search suggestions
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

// Fetch weather
async function fetchWeather(city) {
  currentCity = city;
  showSkeleton();
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) throw new Error('City not found');
      if (res.status === 401) throw new Error('Invalid API key');
      if (res.status === 429) throw new Error('Too many requests');
      throw new Error(`Error ${res.status}`);
    }
    const data = await res.json();
    displayWeather(data);
    fetchForecast(city);
    fetchAQI(data.coord.lat, data.coord.lon);
    addRecent(city);
    showWeather();
    animateCardIn();
  } catch (err) {
    showError(err.message);
  }
}

// Fetch forecast
async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    displayHourly(data);
    displayForecast(data);
  } catch {
    hourlySection.hidden = true;
    forecastSection.hidden = true;
  }
}

// Fetch AQI
async function fetchAQI(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const aqiVal = data.list[0].main.aqi;
    const labels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    aqi.textContent = `${aqiVal} - ${labels[aqiVal] || '--'}`;
  } catch {
    aqi.textContent = '--';
  }
}

// Display weather
function displayWeather(data) {
  const { name, sys, main, weather, wind: windData, visibility: vis, coord } = data;
  const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
  const speedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';

  locationEl.textContent = `${name}, ${sys.country}`;
  temperature.textContent = Math.round(main.temp);
  document.querySelector('.temp-unit').textContent = tempUnit;
  condition.textContent = weather[0].description;
  feelsLike.textContent = `${Math.round(main.feels_like)}${tempUnit}`;
  humidity.textContent = `${main.humidity}%`;
  windSpeed.textContent = `${Math.round(windData.speed * (currentUnit === 'metric' ? 3.6 : 1))} ${speedUnit}`;
  visibility.textContent = currentUnit === 'metric' ? `${(vis / 1000).toFixed(1)} km` : `${(vis / 1609).toFixed(1)} mi`;
  pressure.textContent = `${main.pressure} hPa`;

  // Sunrise / Sunset
  const sr = new Date(sys.sunrise * 1000);
  const ss = new Date(sys.sunset * 1000);
  sunrise.textContent = sr.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  sunset.textContent = ss.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

  setWeatherIcon(weather[0].id, weather[0].icon);
  setWeatherBackground(weather[0].id);
}

// Display hourly
function displayHourly(data) {
  const list = data.list.slice(0, 8);
  hourlyStrip.innerHTML = '';
  const tempUnit = currentUnit === 'metric' ? '°' : '°';

  list.forEach((item) => {
    const time = new Date(item.dt * 1000);
    const hour = time.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    const weatherId = item.weather[0].id;
    const temp = Math.round(item.main.temp);

    const div = document.createElement('div');
    div.className = 'forecast-day';
    div.innerHTML = `
      <div class="day-name">${hour}</div>
      <div class="day-icon">${getWeatherIconClass(weatherId)}</div>
      <div class="day-temp">${temp}${tempUnit}</div>
    `;
    hourlyStrip.appendChild(div);
  });

  hourlySection.hidden = false;
}

// Display 5-day forecast
function displayForecast(data) {
  const daily = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  });

  const entries = Object.entries(daily).slice(0, 5);
  forecastStrip.innerHTML = '';
  const tempUnit = currentUnit === 'metric' ? '°' : '°';

  entries.forEach(([date, items]) => {
    const dayData = items[Math.floor(items.length / 2)];
    const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
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
  if (id >= 200 && id < 300) return '<i class="fas fa-bolt" style="color:#fbbf24"></i>';
  if (id >= 300 && id < 600) return '<i class="fas fa-cloud-rain" style="color:#60a5fa"></i>';
  if (id >= 600 && id < 700) return '<i class="fas fa-snowflake" style="color:#93c5fd"></i>';
  if (id >= 700 && id < 800) return '<i class="fas fa-smog" style="color:#94a3b8"></i>';
  if (id === 800) return '<i class="fas fa-sun" style="color:#fbbf24"></i>';
  return '<i class="fas fa-cloud-sun" style="color:#a9d6e5"></i>';
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

  const colorMap = {
    '01d': '#fbbf24', '01n': '#c084fc',
    '02d': '#fbbf24', '02n': '#c084fc',
    '09d': '#60a5fa', '10d': '#60a5fa',
    '11d': '#f59e0b', '13d': '#93c5fd',
  };
  weatherSvgIcon.style.color = colorMap[icon] || 'var(--text-secondary)';

  // Bounce in
  gsap.fromTo('#weatherSvgIcon',
    { scale: 0, rotate: -30 },
    { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2)' }
  );
}

function setWeatherBackground(id) {
  document.body.className = '';
  if (id >= 200 && id < 300) document.body.classList.add('weather-thunderstorm');
  else if (id >= 300 && id < 600) document.body.classList.add('weather-rainy');
  else if (id >= 600 && id < 700) document.body.classList.add('weather-snowy');
  else if (id >= 700 && id < 800) document.body.classList.add('weather-misty');
  else document.body.classList.add('weather-clear');
}

// Geolocation
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
      fetchAQI(pos.coords.latitude, pos.coords.longitude);
      addRecent(data.name);
      showWeather();
      animateCardIn();
    } catch { showError('Could not get weather for your location.'); }
  }, () => showError('Location permission denied.'));
});

function showSkeleton() {
  weatherCard.hidden = true;
  errorCard.hidden = true;
  skeleton.hidden = false;
  hourlySection.hidden = true;
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
  hourlySection.hidden = true;
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
