import Image from "next/image";
import HourlyForecastItem from "./HourlyForecastItem";
import { convertToCelsius } from "@/app/lib/temperature";
import { useEffect, useState } from "react";
import { ForecastDay } from "@/types/weather";

function ForecastCard({
    date,
    forecastDay,
    units,
}: {
    date: string;
    forecastDay: ForecastDay;
    units: "metric" | "imperial";
}) {
    const [highTemp, setHighTemp] = useState(Math.round(forecastDay.high));
    const [lowTemp, setLowTemp] = useState(Math.round(forecastDay.low));

    useEffect(() => {
        if (units === "metric") {
            setHighTemp(convertToCelsius(Math.round(forecastDay.high)));
            setLowTemp(convertToCelsius(Math.round(forecastDay.low)));
        } else {
            setHighTemp(Math.round(forecastDay.high));
            setLowTemp(Math.round(forecastDay.low));
        }
    }, [units, forecastDay.high, forecastDay.low]);

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
                                    <HourlyForecastItem key={item.dt} item={item} units={units} />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForecastCard;
