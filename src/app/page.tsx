"use client";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import ForecastCard from "@/components/ForecastCard";
import { ForecastData, ForecastDay, ForecastWeek, WeatherData } from "@/types/weather";

import { useState, useEffect } from "react";

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
                fetch(`/api/weather/current?lat=${lat}&lon=${lon}&units=imperial&limit=5`),
                fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}&units=imperial&limit=5`),
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
