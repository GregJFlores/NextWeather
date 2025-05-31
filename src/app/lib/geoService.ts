const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TIME = 12 * 60 * 60 * 1000; // 12 hours

export async function getCityData(city: string) {
    const now = Date.now();
    const cached = cache.get(city.toLowerCase());

    if (cached && now - cached.timestamp < CACHE_TIME) {
        return cached.data;
    }

    const response = await fetch(`/api/geo?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    cache.set(city.toLowerCase(), { data, timestamp: now });
    return data;
}
