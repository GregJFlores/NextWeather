"use client";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import ForecastCard from "@/components/ForecastCard";
import {
    CurrentWeatherResponse,
    ForecastDay,
    ForecastWeek,
    WeatherForecastResponse,
} from "@/types/weather";

import { GeocodingResponse } from "@/types/geo";
import { useState } from "react";
import { getCityData } from "./lib/geoService";
import { getWeatherForCity } from "./lib/weatherService";

export default function Home() {
    return (
        <>
            <main>
                <WeatherComponent />
            </main>
            <footer className="sticky bottom-0 bg-gray-800/90 text-white py-4 text-center">
                <p>© {new Date().getFullYear()} Gregory Flores. All rights reserved.</p>
            </footer>
        </>
    );
}

function WeatherComponent() {
    const [weather, setWeather] = useState<CurrentWeatherResponse | null>(null);
    const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
    const [forecastWeek, setForecastWeek] = useState<ForecastWeek | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [units, setUnits] = useState<"metric" | "imperial">("imperial");
    const [cooldown, setCooldown] = useState(false);

    const fetchWeatherData = async (city: string) => {
        if (cooldown) {
            setError("Please wait before making another request.");
            return;
        }
        setLoading(true);
        setError(null);

        const weatherForCity = await getWeatherForCity(city);
        if (!weatherForCity) {
            setError("Failed to fetch weather data. Please try again.");
            setLoading(false);
            return;
        }
        const {
            current: currentData,
            forecast: forecastData,
        }: { current: CurrentWeatherResponse; forecast: WeatherForecastResponse } = weatherForCity;
        if (!currentData || !forecastData) {
            setError("No weather data found for the specified city.");
            setLoading(false);
            return;
        }
        const cityData: GeocodingResponse = await getCityData(city);
        if (!cityData || cityData.length === 0) {
            setError(`No coordinates found for city: ${city}`);
            setLoading(false);
            return;
        }
        const { state } = cityData[0];
        if (!state) {
            setError(`No state information found for city: ${city}`);
            setLoading(false);
            return;
        }

        try {
            setSelectedState(state);
            setWeather(currentData);
            setForecast(forecastData);
            setSelectedCity(city);
            setForecastWeek(getForecastWeek(forecastData));
            setCooldown(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
            setTimeout(() => setCooldown(false), 3000);
        }
    };

    const isValidCityName = (input: string) => /^[a-zA-Z\s\-']{2,100}$/.test(input);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && isValidCityName(inputValue.trim())) {
            fetchWeatherData(inputValue.trim());
        }
    };

    const handleUnitToggle = () => {
        const newUnits = units === "imperial" ? "metric" : "imperial";
        setUnits(newUnits);
        if (selectedCity) {
            setInputValue(selectedCity);
        }
    };

    const getForecastWeek = (forecastData: WeatherForecastResponse): ForecastWeek => {
        const timezoneOffset = forecastData.city.timezone; // in seconds

        const daysMap: { [key: string]: ForecastDay } = {};

        forecastData.list.forEach((item) => {
            // Apply timezone offset to get correct local date
            const localDate = new Date((item.dt + timezoneOffset) * 1000);
            const dateString = localDate.toISOString().split("T")[0]; // YYYY-MM-DD in local time

            if (!daysMap[dateString]) {
                daysMap[dateString] = {
                    date: dateString,
                    high: item.main.temp_max,
                    low: item.main.temp_min,
                    items: [],
                };
            } else {
                // Update high/low
                daysMap[dateString].high = Math.max(daysMap[dateString].high, item.main.temp_max);
                daysMap[dateString].low = Math.min(daysMap[dateString].low, item.main.temp_min);
            }

            daysMap[dateString].items.push(item);
        });

        // Sort hourly items in each day
        Object.values(daysMap).forEach((day) => {
            day.items.sort((a, b) => a.dt - b.dt);
        });

        // Return a sorted array of days
        const daysArray = Object.values(daysMap).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return {
            days: daysArray,
            city: forecastData.city,
        };
    };

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
                                        <span className="text-sm">°F</span>
                                        <div className="w-8 h-4 bg-white/20 rounded-full relative">
                                            <div
                                                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                                                    units === "imperial" ? "left-0.5" : "left-4"
                                                }`}
                                            ></div>
                                        </div>
                                        <span className="text-sm">°C</span>
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
                                5-Day Forecast for {forecast?.city?.name}, {selectedState}
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
