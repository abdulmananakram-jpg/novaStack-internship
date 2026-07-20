/* ============================================================
   WEATHER APP — Main Script
   Master Prompt: Advanced Animated Weather App
   ============================================================ */

// ============================================================
// STEP 1: Paste your real OpenWeatherMap API key below
//         (new keys take up to 2 hours to activate after signup)
// ============================================================
const API_KEY = "PASTE_YOUR_OPENWEATHERMAP_KEY_HERE"; // <-- Replace with your real key

/* ============================================================
   DOM References
   ============================================================ */
const searchInput     = document.getElementById('searchInput');
const searchBtn       = document.getElementById('searchBtn');
const searchWrapper   = document.getElementById('searchWrapper');
const suggestions     = document.getElementById('suggestions');
const geoBtn          = document.getElementById('geoBtn');
const pillToggle      = document.getElementById('pillToggle');
const pillOptions     = document.querySelectorAll('.pill-option');
const pillSlider      = document.getElementById('pillSlider');
const emptyTooltip    = document.getElementById('emptyTooltip');
const recentChips     = document.getElementById('recentChips');

const skeleton        = document.getElementById('skeleton');
const weatherCard     = document.getElementById('weatherCard');
const weatherBody     = document.getElementById('weatherBody');
const forecastSection = document.getElementById('forecastSection');
const forecastStrip   = document.getElementById('forecastStrip');
const errorCard       = document.getElementById('errorCard');
const errorMsg        = document.getElementById('errorMsg');
const retryBtn        = document.getElementById('retryBtn');

const mainIcon        = document.getElementById('mainIcon');
const iconWrap        = document.querySelector('.weather-icon-wrap');
const tempValue       = document.getElementById('tempValue');
const tempUnitLabel   = document.getElementById('tempUnitLabel');
const conditionText   = document.getElementById('conditionText');
const locationSpan    = document.getElementById('locationText').querySelector('span');
const feelsLike       = document.getElementById('feelsLike');
const humidity        = document.getElementById('humidity');
const windSpeed       = document.getElementById('windSpeed');
const visibility      = document.getElementById('visibility');
const pressure        = document.getElementById('pressure');
const sunrise         = document.getElementById('sunrise');
const sunset          = document.getElementById('sunset');

/* ============================================================
   State
   ============================================================ */
let currentUnit = 'metric';           // 'metric' | 'imperial' (display only)
let currentCity = '';                 // last searched city name
let cachedWeather = null;             // always in METRIC (for client-side conversion)
let cachedForecast = null;            // always in METRIC
let recentCities = [];                // in-memory array (max 5)
let searchTimeout;                    // debounce timer
let isFetching = false;

/* ============================================================
   Conversion Helpers — metric stored, convert on display
   ============================================================ */
function toF(c) { return Math.round(c * 9/5 + 32); }

function toMph(ms) { return Math.round(ms * 2.237); }

function toKm(ms) { return Math.round(ms * 3.6); }

function toMi(m) { return (m / 1609).toFixed(1); }

function toKmDisplay(m) { return (m / 1000).toFixed(1); }

/* ============================================================
   Display Weather — renders using currentUnit (client-side conversion)
   ============================================================ */
function displayWeather(data) {
  // data is always in METRIC from cache
  const { name, sys, main, weather, wind: w, visibility: vis } = data;
  const isMetric = currentUnit === 'metric';

  const temp     = isMetric ? Math.round(main.temp) : toF(main.temp);
  const feels    = isMetric ? `${Math.round(main.feels_like)}°C` : `${toF(main.feels_like)}°F`;
  const hum      = `${main.humidity}%`;
  const windVal  = isMetric ? `${toKm(w.speed)} km/h` : `${toMph(w.speed)} mph`;
  const visText  = isMetric ? `${toKmDisplay(vis)} km` : `${toMi(vis)} mi`;
  const press    = `${main.pressure} hPa`;
  const tempU    = isMetric ? '°C' : '°F';

  locationSpan.textContent    = `${name}, ${sys.country}`;
  conditionText.textContent   = weather[0].description;
  tempUnitLabel.textContent   = tempU;
  feelsLike.textContent       = feels;
  humidity.textContent        = hum;
  windSpeed.textContent       = windVal;
  visibility.textContent      = visText;
  pressure.textContent        = press;

  // Sunrise / Sunset (always local time, unit independent)
  const sr = new Date(sys.sunrise * 1000);
  const ss = new Date(sys.sunset * 1000);
  sunrise.textContent = sr.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  sunset.textContent  = ss.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

  // Count-up animation
  animateCountUp(tempValue, temp);

  // Icon + idle animation
  setMainIcon(weather[0].id, weather[0].icon);
  setIconIdleAnimation(weather[0].id);
}

/* ============================================================
   Render 5-Day Forecast — client-side conversion
   ============================================================ */
function renderForecast(data) {
  // data is always in METRIC
  const daily = {};
  data.list.forEach((item) => {
    const d = item.dt_txt.split(' ')[0];
    if (!daily[d]) daily[d] = [];
    daily[d].push(item);
  });

  const entries = Object.entries(daily).slice(0, 5);
  forecastStrip.innerHTML = '';
  const isMetric = currentUnit === 'metric';
  const sym = '°';

  entries.forEach(([date, items]) => {
    const mid     = items[Math.floor(items.length / 2)];
    const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
    const temps   = items.map(i => i.main.temp);
    let high = Math.round(Math.max(...temps));
    let low  = Math.round(Math.min(...temps));
    if (!isMetric) { high = toF(high); low = toF(low); }
    const wid = mid.weather[0].id;

    const div = document.createElement('div');
    div.className = 'forecast-day';
    div.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-icon">${forecastIcon(wid)}</div>
      <div class="day-temp">${high}${sym} <span>${low}${sym}</span></div>
    `;
    forecastStrip.appendChild(div);
  });

  forecastSection.hidden = false;
}

/* ============================================================
   Count-Up Animation — requestAnimationFrame with ease-out
   ============================================================ */
function animateCountUp(el, target) {
  const start = parseFloat(el.textContent) || 0;
  const duration = 800;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
      el.classList.add('pop');
      setTimeout(() => el.classList.remove('pop'), 300);
    }
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   Set Main Weather Icon — day/night aware
   ============================================================ */
function setMainIcon(id, iconCode) {
  const isNight = iconCode && iconCode.endsWith('n');
  let iconClass = 'fa-sun';

  if (id >= 200 && id < 300)       iconClass = 'fa-bolt';
  else if (id >= 300 && id < 400)  iconClass = 'fa-cloud-rain';
  else if (id >= 500 && id < 600)  iconClass = isNight ? 'fa-cloud-rain' : 'fa-cloud-showers-heavy';
  else if (id >= 600 && id < 700)  iconClass = 'fa-snowflake';
  else if (id >= 700 && id < 800)  iconClass = 'fa-smog';
  else if (id === 800)             iconClass = isNight ? 'fa-moon' : 'fa-sun';
  else if (id === 801)             iconClass = isNight ? 'fa-cloud-moon' : 'fa-cloud-sun';
  else                             iconClass = 'fa-cloud';

  mainIcon.className = `fas ${iconClass}`;

  const colorMap = {
    'fa-sun': '#fbbf24', 'fa-moon': '#c084fc', 'fa-bolt': '#f59e0b',
    'fa-snowflake': '#93c5fd', 'fa-cloud-showers-heavy': '#60a5fa',
    'fa-cloud-rain': '#60a5fa',
  };
  mainIcon.style.color = colorMap[iconClass] || 'var(--text-secondary)';
}

/* ============================================================
   Idle Icon Animation — subtle continuous motion per condition
   ============================================================ */
function setIconIdleAnimation(id) {
  iconWrap.className = 'weather-icon-wrap';
  if (id >= 200 && id < 300)            iconWrap.classList.add('idle-pulse');  // thunder — pulse
  else if (id >= 300 && id < 600)       iconWrap.classList.add('idle-drip');   // rain — drip
  else if (id >= 600 && id < 700)       iconWrap.classList.add('idle-float');  // snow — float
  else                                  iconWrap.classList.add('idle-float');  // default
}

/* ============================================================
   Dynamic Background Theme — weather + day/night
   ============================================================ */
function updateTheme(data) {
  const { weather, sys } = data;
  const now = Math.floor(Date.now() / 1000);
  const isDay = now >= sys.sunrise && now < sys.sunset;
  const id = weather[0].id;

  let cls = 'theme-clear-day';
  if (id >= 200 && id < 300)            cls = 'theme-thunderstorm';
  else if (id >= 300 && id < 600)       cls = 'theme-rainy';
  else if (id >= 600 && id < 700)       cls = 'theme-snowy';
  else if (id >= 700 && id < 800)       cls = 'theme-mist';
  else if (id >= 801 && id <= 804)      cls = 'theme-cloudy';
  else if (id === 800)                  cls = isDay ? 'theme-clear-day' : 'theme-clear-night';

  document.body.className = cls;
}

/* ============================================================
   Forecast Icon Helper
   ============================================================ */
function forecastIcon(id) {
  if (id >= 200 && id < 300) return '<i class="fas fa-bolt" style="color:#f59e0b"></i>';
  if (id >= 300 && id < 600) return '<i class="fas fa-cloud-rain" style="color:#60a5fa"></i>';
  if (id >= 600 && id < 700) return '<i class="fas fa-snowflake" style="color:#93c5fd"></i>';
  if (id >= 700 && id < 800) return '<i class="fas fa-smog" style="color:#94a3b8"></i>';
  if (id === 800) return '<i class="fas fa-sun" style="color:#fbbf24"></i>';
  if (id === 801) return '<i class="fas fa-cloud-sun" style="color:#94a3b8"></i>';
  return '<i class="fas fa-cloud" style="color:#94a3b8"></i>';
}

/* ============================================================
   Fetch Weather — always in metric, cache for unit toggle
   ============================================================ */
async function fetchWeather(city) {
  if (isFetching) return;
  isFetching = true;
  showSkeleton();

  // Always fetch in METRIC for client-side conversion
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) throw new Error('City not found — please check the spelling and try again.');
      if (res.status === 401) throw new Error('Invalid API key. Get a free key at openweathermap.org.');
      if (res.status === 429) throw new Error('Too many requests — please wait a moment and try again.');
      throw new Error(`Something went wrong (Error ${res.status}). Please try again.`);
    }
    const data = await res.json();
    cachedWeather = data;
    displayWeather(data);
    currentCity = data.name;
    addRecentCity(data.name);
    updateTheme(data);

    // Fetch forecast (always metric)
    const fUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    try {
      const fRes = await fetch(fUrl);
      const fData = await fRes.json();
      cachedForecast = fData;
      renderForecast(fData);
    } catch {
      forecastSection.hidden = true;
    }

    showWeatherCard();
  } catch (err) {
    showError(err.message);
  } finally {
    isFetching = false;
  }
}

/* ============================================================
   Geolocation — auto-fetch on page load + button
   ============================================================ */

// Shared handler for geo position
async function handleGeoPosition(pos) {
  showSkeleton();
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    cachedWeather = data;
    displayWeather(data);
    searchInput.value = data.name;
    currentCity = data.name;

    const fUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${API_KEY}`;
    const fRes = await fetch(fUrl);
    const fData = await fRes.json();
    cachedForecast = fData;
    renderForecast(fData);

    showWeatherCard();
    addRecentCity(data.name);
  } catch {
    showError('Could not get weather for your location.');
  }
}

function initGeolocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(handleGeoPosition, () => {});
}

// Geo button
geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) { showError('Geolocation is not supported by your browser.'); return; }
  navigator.geolocation.getCurrentPosition(
    handleGeoPosition,
    () => showError('Location access denied. Please enable permissions.')
  );
});

/* ============================================================
   Search — Enter key OR search button click
   ============================================================ */
function performSearch() {
  const city = searchInput.value.trim();
  if (!city) {
    searchWrapper.classList.add('shake');
    emptyTooltip.classList.add('show');
    setTimeout(() => searchWrapper.classList.remove('shake'), 500);
    setTimeout(() => emptyTooltip.classList.remove('show'), 2500);
    return;
  }
  emptyTooltip.classList.remove('show');
  suggestions.classList.remove('active');
  fetchWeather(city);
}

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); performSearch(); }
});

searchBtn.addEventListener('click', performSearch);

/* ============================================================
   Live Suggestions — debounced 300ms
   ============================================================ */
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const q = searchInput.value.trim();
  if (q.length < 2) { suggestions.classList.remove('active'); return; }
  searchTimeout = setTimeout(() => fetchSuggestions(q), 300);
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => suggestions.classList.remove('active'), 200);
});

async function fetchSuggestions(query) {
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
          searchInput.value = loc.name;
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

/* ============================================================
   Unit Toggle — sliding pill, client-side conversion, no re-fetch
   ============================================================ */
pillToggle.addEventListener('click', (e) => {
  const option = e.target.closest('.pill-option');
  if (!option || option.dataset.unit === currentUnit) return;

  pillOptions.forEach(o => o.classList.remove('active'));
  option.classList.add('active');

  const isImperial = option.dataset.unit === 'imperial';
  pillSlider.classList.toggle('right', isImperial);
  currentUnit = option.dataset.unit;

  // Re-render from cached metric data
  if (cachedWeather) displayWeather(cachedWeather);
  if (cachedForecast) renderForecast(cachedForecast);
});

/* ============================================================
   Recent Cities — in-memory JS array (max 5)
   ============================================================ */
function addRecentCity(city) {
  recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
  recentCities.unshift(city);
  if (recentCities.length > 5) recentCities = recentCities.slice(0, 5);
  renderRecentChips();
}

function renderRecentChips() {
  recentChips.innerHTML = '';
  recentCities.forEach(city => {
    const chip = document.createElement('span');
    chip.className = 'recent-chip';
    chip.textContent = city;
    chip.addEventListener('click', () => {
      searchInput.value = city;
      fetchWeather(city);
    });
    recentChips.appendChild(chip);
  });
}

/* ============================================================
   UI Helpers
   ============================================================ */
function showSkeleton() {
  skeleton.hidden = false;
  weatherCard.hidden = true;
  errorCard.hidden = true;
  forecastSection.hidden = true;
}

function showWeatherCard() {
  skeleton.hidden = true;
  errorCard.hidden = true;
  weatherCard.hidden = false;
  weatherCard.classList.remove('fade-out');
  weatherCard.classList.add('visible');
}

function showError(msg) {
  skeleton.hidden = true;
  weatherCard.hidden = true;
  forecastSection.hidden = true;
  errorCard.hidden = false;
  errorMsg.textContent = msg;
}

// Retry button
retryBtn.addEventListener('click', () => {
  if (currentCity) fetchWeather(currentCity);
  else errorCard.hidden = true;
});

/* ============================================================
   Init
   ============================================================ */
initGeolocation();
