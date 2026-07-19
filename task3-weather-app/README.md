# Weather App — NovaStack Hub Internship (Task 3)

A responsive weather dashboard that fetches live data from the OpenWeatherMap API.

## Features
- Search by city name with error handling
- Displays temperature, feels-like, condition with icon, humidity, wind speed, pressure
- Dynamic background gradient based on weather condition (sunny, cloudy, rainy, snowy, etc.)
- Loading spinner while fetching
- Error state for invalid city names or API issues
- Glassmorphism weather-card design

## Tech
- HTML5
- CSS3 (glassmorphism, CSS transitions, dynamic class-based theming)
- Vanilla JavaScript (async/await, Fetch API)
- OpenWeatherMap Free API

## How to Run
1. Open `script.js` and replace `YOUR_API_KEY_HERE` with your free API key from [openweathermap.org/api](https://openweathermap.org/api).
2. Open `index.html` in a browser.
3. Type a city name and press Enter or click Search.

## Personalization
- **API Key** — required. Go to OpenWeatherMap → Sign up → Copy your free API key → paste it in `script.js`.
