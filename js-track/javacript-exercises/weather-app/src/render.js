import { getIconByCondition, getDayOfTheWeek, getUVDescription, getMoonPhaseInfo } from "./helpers.js";

const main = document.querySelector('main');

export function renderWeatherInfo(weatherInfo, location) {
    const weatherGrid = main.querySelector('.weather-grid');
    main.querySelector('h2').textContent = location;

    weatherGrid.innerHTML = [
        renderCurrentWeatherInfo(weatherInfo),
        renderSidePanelInfo(weatherInfo),
        renderForecast(weatherInfo.days, 9)
    ].join("");
}

function infoItem(label, value, icon) {
    return `
      <div class="info-item">
                        <span class="label">${label} <i class="wi wi-small ${icon}" ></i></span>
                        <span class="value">${value}</span>
    </div>`;
}

function renderCurrentWeatherInfo(weatherInfo) {
    let crnt = weatherInfo.currentConditions;

    return `
     <div class="current-conditions grid-item">
                <div class="current-time">
                    <p class="section-heading">Current Weather</p>
                    <p>${crnt.datetime.slice(0, -3)}</p>
                </div>
                <div class="current-forecast">
                    <i class="wi icon main ${getIconByCondition(crnt.icon)}"></i>
                    <div class="currentTemp">${crnt.temp}<span class="temp-unit">&deg;C</span></div>
                    <div class="current-state">
                        <div class="condition">${crnt.conditions}</div>
                        <div class="feelsLike">Feels like: ${crnt.feelslike}&deg;</div>
                    </div>
                </div>

                <div class="description">
                   ${weatherInfo.description}
                </div>

                <div class="information">
                    ${infoItem("Wind", `${crnt.windspeed} km/h`, "wi-windy")}
                    ${infoItem("Humidity", `${crnt.humidity}%`, "wi-humidity")}
                    ${infoItem("Visibility", `${crnt.visibility} km`, "wi-fog")}
                    ${infoItem("Pressure", `${crnt.pressure} mb`, "wi-barometer")}
                    ${infoItem("Dew point", `${crnt.dew}&deg;`, "wi-thermometer")}
                </div>
            </div>
    `;
}

function renderSidePanelInfo(weatherInfo) {
    let crnt = weatherInfo.currentConditions;
    let moon = getMoonPhaseInfo(crnt.moonphase);

    return `
     <div class="side-panel grid-item">
                <section class="alerts">
                    <h3 class="section-heading">Alerts</h3>
                    <ul>
                   ${weatherInfo.alerts && weatherInfo.alerts.length > 0
            ? weatherInfo.alerts.map(x =>
                `<li><strong>${x.event}:</strong> ${x.description}</li>`
            ).join("")
            : `<li>No alerts</li>`
        }
                    </ul>
                </section>
                <h3 class="additional">Details</h3>
                <section class="information">
                    ${infoItem("Sunrise", crnt.sunrise.slice(0, -3), "wi-sunrise")}
                    ${infoItem("Sunset", crnt.sunset.slice(0, -3), "wi-sunset")}
                    ${infoItem("Moon Phase", moon.name, moon.icon)}
                <div class="info-item">
                        <h3>UV Index</h3>
                        <div class="uv-value">${crnt.uvindex} (${getUVDescription(crnt.uvindex)})</div>
                </div>
            </div>
    `;
}

function renderForecast(days, limit = 9) {
    let slice = days.slice(0, limit);

    return `
     <div class="forecast grid-item">
                <h3>Next Days</h3>
                <ul>
                    ${slice.map(d => dayCard(d)).join("")}
                </ul>
            </div>`;
}

function dayCard(d) {
    let date = new Date(d.datetime);

    return `<li>
                        <div class="top">
                            <span class="date">${date.getDate()}</span>
                            <span class="day">${getDayOfTheWeek(date.getDay())}</span>
                        </div>
                        <div class="bottom">
                            <span class="wi icon ${getIconByCondition(d.icon)}"></span>
                            <div class="temps">
                                <span class="tempmax">${d.tempmax}&deg;</span>
                                <span class="tempmin">${d.tempmin}&deg;</span>
                            </div>
                        </div>
            </li>`;
}