import { convertToCelsius } from "@/app/lib/temperature";
import { CurrentWeatherResponse } from "@/types/weather";
import Image from "next/image";
import { useEffect, useState } from "react";

function getWindDirection(degrees: number): string {
    const directions = [
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function CurrentWeatherCard({
    weather,
    units,
    state,
}: {
    weather: CurrentWeatherResponse;
    units: "metric" | "imperial";
    state?: string | null;
}) {
    const [temp, setTemp] = useState(Math.round(weather.main.temp));
    const [feelsLike, setFeelsLike] = useState(Math.round(weather.main.feels_like));
    useEffect(() => {
        if (units === "metric") {
            setTemp(convertToCelsius(Math.round(weather.main.temp)));
            setFeelsLike(convertToCelsius(Math.round(weather.main.feels_like)));
        } else {
            setTemp(Math.round(weather.main.temp));
            setFeelsLike(Math.round(weather.main.feels_like));
        }
    }, [units]);

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
                        <div className="grid grid-cols-1 gap-4 lg:gap-6">
                            <div className="grid grid-cols-2 gap-4">
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

                            {/* Wind Dial */}
                            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex flex-col items-center">
                                    <div className="relative w-20 h-20 mb-3">
                                        {/* Compass base */}
                                        <div className="p-6 w-20 h-20 rounded-full border-2 border-white/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative">
                                            {/* Cardinal directions */}
                                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold">
                                                N
                                            </div>
                                            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 text-xs text-white font-bold">
                                                E
                                            </div>
                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold">
                                                S
                                            </div>
                                            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 text-xs text-white font-bold">
                                                W
                                            </div>

                                            {/* Center dot */}
                                            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                                            {/* Wind direction arrow */}
                                            <div
                                                className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-gradient-to-t from-red-500 to-red-300 transform -translate-x-1/2 origin-bottom transition-transform duration-500"
                                                style={{
                                                    transform: `translate(-50%, -100%) rotate(${weather.wind.deg}deg)`,
                                                    transformOrigin: "bottom center",
                                                }}
                                            >
                                                {/* Arrow head */}
                                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-red-300"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                                        {Math.round(weather.wind.speed)}{" "}
                                        {units === "metric" ? "m/s" : "mph"}
                                    </div>
                                    <div className="text-sm sm:text-base text-gray-400 font-medium uppercase tracking-wide mb-1">
                                        Wind Speed
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-300">
                                        {weather.wind.deg}° ({getWindDirection(weather.wind.deg)})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>{" "}
                </div>{" "}
            </div>
        </div>
    );
}
export default CurrentWeatherCard;
