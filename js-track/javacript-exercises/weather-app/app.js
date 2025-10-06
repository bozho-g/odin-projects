import { fetchWeather } from "./src/api.js";
import { initDropdown } from "./src/dropdown.js";
import { renderWeatherInfo } from "./src/render.js";
import { toggleSpinner } from "./src/spinner.js";

initDropdown({
    form: document.getElementById('weatherForm'),
    input: document.querySelector('#cityInput'),
    list: document.querySelector('#suggestions'),
    onSelect: ({ lat, lon, location }) => getWeather(lat, lon, location)
});

async function getWeather(latitude, longitude, location) {
    try {
        toggleSpinner(true);
        const data = await fetchWeather(latitude, longitude);
        toggleSpinner(false);
        renderWeatherInfo(data, location);
    } catch (error) {
        console.log(error);
    }
}