import { getCityData } from "./geoService";

const current_cache = new Map<string, { data: any; timestamp: number }>();
const forecast_cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TIME = 5 * 60_000; // 5 mins

export async function getCurrentWeatherForCity(city: string) {
    const now = Date.now();
    const cached = current_cache.get(city.toLowerCase());

    if (cached && now - cached.timestamp < CACHE_TIME) {
        return cached.data;
    }

    const geoResponse = await getCityData(city);
    if (!geoResponse || geoResponse.length === 0) {
        throw new Error(`No coordinates found for city: ${city}`);
    }
    const { lat, lon } = geoResponse[0];

    const weatherResponse = await fetch(
        `/api/weather/current?lat=${lat}&lon=${lon}&units=imperial&limit=5`
    );
    const data = await weatherResponse.json();

    current_cache.set(city.toLowerCase(), { data, timestamp: now });
    return data;
}

export async function getForecastWeatherForCity(city: string) {
    const now = Date.now();
    const cached = forecast_cache.get(city.toLowerCase());

    if (cached && now - cached.timestamp < CACHE_TIME) {
        return cached.data;
    }

    const geoResponse = await getCityData(city);
    if (!geoResponse || geoResponse.length === 0) {
        throw new Error(`No coordinates found for city: ${city}`);
    }
    const { lat, lon } = geoResponse[0];

    const weatherResponse = await fetch(
        `/api/weather/forecast?lat=${lat}&lon=${lon}&units=imperial&limit=5`
    );
    const data = await weatherResponse.json();

    forecast_cache.set(city.toLowerCase(), { data, timestamp: now });
    return data;
}

export async function getWeatherForCity(city: string) {
    try {
        const currentWeather = await getCurrentWeatherForCity(city);
        const forecastWeather = await getForecastWeatherForCity(city);
        return { current: currentWeather, forecast: forecastWeather };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
    }
}
