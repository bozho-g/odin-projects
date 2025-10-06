const conditionIcons = {
    "snow": "wi-snow",
    "snow-showers-day": "wi-day-snow",
    "snow-showers-night": "wi-night-alt-snow",
    "thunder-rain": "wi-thunderstorm",
    "thunder-showers-day": "wi-day-thunderstorm",
    "thunder-showers-night": "wi-night-alt-thunderstorm",
    "rain": "wi-rain",
    "showers-day": "wi-day-showers",
    "showers-night": "wi-night-showers",
    "fog": "wi-fog",
    "wind": "wi-strong-wind",
    "cloudy": "wi-cloudy",
    "partly-cloudy-day": "wi-day-cloudy",
    "partly-cloudy-night": "wi-night-partly-cloudy",
    "clear-day": "wi-day-sunny",
    "clear-night": "wi-night-clear"
};

export function getIconByCondition(condition) {
    return conditionIcons[condition];
}

const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export function getDayOfTheWeek(dayIndex) {
    return days[dayIndex];
}

export function getUVDescription(uv) {
    if (uv < 3) {
        return "Low";
    }
    if (uv < 6) {
        return "Moderate";
    }
    if (uv < 8) {
        return "High";
    }
    if (uv < 11) {
        return "Very High";
    }
    return "Extreme";
}

export function getMoonPhaseInfo(moonphase) {
    if (moonphase === undefined || moonphase === null || isNaN(moonphase)) {
        return { name: "Unknown", icon: "wi-moon-alt-new" };
    }

    const m = ((moonphase % 1) + 1) % 1;
    const ang = m * 360;
    const within = (a, b, t) => Math.abs(a - b) <= t;
    const thresholdDeg = 10;

    if (within(ang, 0, thresholdDeg) || within(ang, 360, thresholdDeg)) {
        return { name: "New Moon", icon: "wi-moon-alt-new" };
    }

    if (within(ang, 90, thresholdDeg)) {
        return { name: "First Quarter", icon: "wi-moon-alt-first-quarter" };
    }

    if (within(ang, 180, thresholdDeg)) {
        return { name: "Full Moon", icon: "wi-moon-alt-full" };
    }

    if (within(ang, 270, thresholdDeg)) {
        return { name: "Last Quarter", icon: "wi-moon-alt-third-quarter" };
    }

    if (ang > 0 && ang < 90) {
        return { name: "Waxing Crescent", icon: "wi-moon-alt-waxing-crescent-3" };
    }
    if (ang > 90 && ang < 180) {
        return { name: "Waxing Gibbous", icon: "wi-moon-alt-waxing-gibbous-4" };
    }
    if (ang > 180 && ang < 270) {
        return { name: "Waning Gibbous", icon: "wi-moon-alt-waning-gibbous-4" };
    }
    return { name: "Waning Crescent", icon: "wi-moon-alt-waning-crescent-4" };
}