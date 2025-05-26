"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

type WeatherData = {
    name: string;
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
    };
    weather: Array<{
        main: string;
        description: string;
        icon: string;
    }>;
};

type ForecastItem = {
    dt: number;
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
    };
    weather: Array<{
        main: string;
        description: string;
        icon: string;
    }>;
    dt_txt: string;
};

type ForecastData = {
    list: ForecastItem[];
    city: {
        name: string;
        country: string;
        coord: {
            lat: number;
            lon: number;
        };
    };
};

type ForecastDay = {
    date: string;
    high: number;
    low: number;
    items: ForecastItem[];
};

type ForecastWeek = {
    days: ForecastDay[];
    city: {
        name: string;
        country: string;
        coord: {
            lat: number;
            lon: number;
        };
    };
};

export default function Home() {
    return (
        <div>
            <WeatherComponent />
        </div>
    );
}

function WeatherComponent() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [forecastWeek, setForecastWeek] = useState<ForecastWeek | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState("San Antonio");
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("San Antonio");
    const [units, setUnits] = useState<"metric" | "imperial">("imperial");

    const fetchLatLon = async (city: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/geo?city=${encodeURIComponent(city)}`);
            if (!response.ok) {
                throw new Error("Failed to fetch latitude and longitude");
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchBothWeatherData = async (city: string) => {
        setLoading(true);
        setError(null);

        const latLon = await fetchLatLon(city);
        if (!latLon) {
            setLoading(false);
            return;
        }
        const { lat, lon, state } = latLon[0];

        try {
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`/api/weather/current?lat=${lat}&lon=${lon}&units=${units}&limit=5`),
                fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}&units=${units}&limit=5`),
            ]);

            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error("Failed to fetch weather data");
            }

            const [currentData, forecastData] = await Promise.all([
                currentResponse.json(),
                forecastResponse.json(),
            ]);

            setSelectedState(state);
            setWeather(currentData);
            setForecast(forecastData);
            setSelectedCity(city);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            fetchBothWeatherData(inputValue.trim());
        }
    };

    const handleUnitToggle = () => {
        const newUnits = units === "imperial" ? "metric" : "imperial";
        setUnits(newUnits);
        if (selectedCity) {
            setInputValue(selectedCity);
            fetchBothWeatherData(`${selectedCity}`);
        }
    };

    const getForecastWeek = (forecastData: ForecastData): ForecastWeek => {
        const daysMap: { [key: string]: ForecastDay } = {};
        forecastData.list.forEach((item) => {
            const date = new Date(item.dt * 1000);
            const dateString = date.toISOString().split("T")[0]; // Get YYYY-MM-DD format
            if (!daysMap[dateString]) {
                daysMap[dateString] = {
                    date: dateString,
                    high: item.main.temp,
                    low: item.main.temp,
                    items: [],
                };
            }
            daysMap[dateString].items.push(item);
            daysMap[dateString].high = Math.max(daysMap[dateString].high, item.main.temp);
            daysMap[dateString].low = Math.min(daysMap[dateString].low, item.main.temp);
        });
        const days = Object.values(daysMap).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        return {
            days,
            city: forecastData.city,
        };
    };

    useEffect(() => {
        if (forecast) {
            const week = getForecastWeek(forecast);
            setForecastWeek(week);
        }
    }, [forecast]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
            <div className="container mx-auto px-4">
                {/* City Search */}
                <div className="mx-auto max-w-2xl mb-8">
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800/90 to-gray-900/95 backdrop-blur-sm border border-white/10 shadow-xl">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                                        Weather Forecast
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={handleUnitToggle}
                                        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                                    >
                                        <span className="text-sm">
                                            °{units === "imperial" ? "F" : "C"}
                                        </span>
                                        <div className="w-8 h-4 bg-white/20 rounded-full relative">
                                            <div
                                                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                                                    units === "imperial" ? "left-0.5" : "left-4"
                                                }`}
                                            ></div>
                                        </div>
                                        <span className="text-sm">
                                            °{units === "imperial" ? "C" : "F"}
                                        </span>
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Enter city name (e.g., San Antonio, New York)"
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !inputValue.trim()}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span className="hidden sm:inline">Loading...</span>
                                            </div>
                                        ) : (
                                            "Get Weather"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mx-auto max-w-2xl mb-8">
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
                            <p className="text-red-200 text-center font-medium">Error: {error}</p>
                        </div>
                    </div>
                )}

                {/* Current Weather */}
                {weather && (
                    <CurrentWeatherCard weather={weather} units={units} state={selectedState} />
                )}

                {/* Forecast */}
                {forecast && (
                    <div className="mt-8">
                        <div className="text-center flex justify-center items-center gap-x-2 text-2xl font-bold text-white mb-6">
                            <h2>
                                5-Day Forecast for {forecast.city.name}, {selectedState}
                            </h2>
                        </div>
                        <div className="mx-auto max-w-full px-6 lg:px-8">
                            <div className="mx-auto grid max-w-md grid-cols-1 gap-4 sm:gap-6 md:max-w-3xl md:grid-cols-2 lg:max-w-7xl lg:grid-cols-5">
                                {forecastWeek?.days.map((item) => (
                                    <ForecastCard
                                        key={item.date}
                                        forecastDay={item}
                                        date={item.date}
                                        units={units}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CurrentWeatherCard({
    weather,
    units,
    state,
}: {
    weather: WeatherData;
    units: "metric" | "imperial";
    state?: string | null;
}) {
    const temp = Math.round(weather.main.temp);
    const feelsLike = Math.round(weather.main.feels_like);
    const humidity = weather.main.humidity;
    const description = weather.weather[0].description;
    const icon = weather.weather[0].icon;
    const unitSymbol = units === "imperial" ? "F" : "C";

    return (
        <div className="mx-auto max-w-4xl px-6 lg:px-8 mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-800/20 backdrop-blur-sm border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/95"></div>

                <div className="relative p-6 sm:p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
                        {/* Location & Main Temp */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                                {weather.name}, {state || ""}
                            </h1>
                            <div className="flex items-baseline justify-center lg:justify-start gap-x-2">
                                <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg">
                                    {temp}°
                                </span>
                                <span className="text-xl sm:text-2xl text-gray-300 font-medium">
                                    {unitSymbol}
                                </span>
                            </div>
                            <p className="text-lg sm:text-xl text-gray-300/90 capitalize mt-2 font-medium">
                                {description}
                            </p>
                        </div>

                        {/* Weather Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
                                <Image
                                    src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
                                    alt={description}
                                    width={128}
                                    height={128}
                                    className="relative h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 drop-shadow-2xl"
                                />
                            </div>
                        </div>

                        {/* Weather Details */}
                        <div className="grid grid-cols-2 gap-4 lg:gap-6">
                            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    {feelsLike}°{unitSymbol}
                                </div>
                                <div className="text-sm sm:text-base text-gray-400 font-medium uppercase tracking-wide">
                                    Feels Like
                                </div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    {humidity}%
                                </div>
                                <div className="text-sm sm:text-base text-gray-400 font-medium uppercase tracking-wide">
                                    Humidity
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ForecastCard({
    date,
    forecastDay,
    units,
}: {
    date: string;
    forecastDay: ForecastDay;
    units: "metric" | "imperial";
}) {
    const highTemp = Math.round(forecastDay.high);
    const lowTemp = Math.round(forecastDay.low);
    const description = forecastDay.items[0].weather[0].description;
    const unitSymbol = units === "imperial" ? "F" : "C";
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-800/90 to-gray-900/95 p-4 sm:p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm hover:ring-white/20 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="inline-flex justify-center mb-2">
                        <Image
                            src={`https://openweathermap.org/img/wn/${forecastDay.items[0].weather[0].icon}@2x.png`}
                            alt={forecastDay.items[0].weather[0].description}
                            width={64}
                            height={64}
                            className="h-12 w-12 sm:h-16 sm:w-16 drop-shadow-lg"
                        />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white/90 tracking-wide">
                        {formattedDate}
                    </h3>
                </div>

                {/* Temperature */}
                <div className="text-center mb-4">
                    <div className="flex items-baseline justify-center gap-x-1">
                        <span className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                            {highTemp}°{unitSymbol}
                        </span>
                        <span className="text-lg sm:text-xl text-gray-300 font-medium">
                            / {lowTemp}°{unitSymbol}
                        </span>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-gray-300/80 capitalize leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Hourly Forecast */}
                <div className="flex-1 min-h-0">
                    <div className="border-t border-gray-700/50 pt-3">
                        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 text-center">
                            Hourly
                        </h4>
                        <div className="space-y-1.5 max-h-32 sm:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {forecastDay.items.map((item) => {
                                const time = new Date(item.dt * 1000).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    hour12: true,
                                });
                                return (
                                    <div
                                        key={item.dt}
                                        className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-xs sm:text-sm text-gray-400 font-medium min-w-[3rem]">
                                            {time}
                                        </span>
                                        <div className="flex items-center gap-x-1.5">
                                            <Image
                                                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                                                alt={item.weather[0].description}
                                                width={20}
                                                height={20}
                                                className="h-4 w-4 sm:h-5 sm:w-5 opacity-80"
                                            />
                                            <span className="text-xs sm:text-sm font-semibold text-white min-w-[2rem] text-right">
                                                {Math.round(item.main.temp)}°{unitSymbol}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
