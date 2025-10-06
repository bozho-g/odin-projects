export async function fetchWeather(latitude, longitude) {
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?unitGroup=metric&key=P6UA5VXTHEQCFB49M4UG2SSZ2&contentType=json`);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}

export async function fetchCitySuggestions(prefix) {
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?types=CITY&namePrefix=${prefix}&limit=5&sort=-population`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '444b92bd3amsh67e6d8de93e9c9ep13b7fejsnc3507eebdffe',
            'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options);
    const result = await response.json();

    return result.data;
}