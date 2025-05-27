import { convertToCelsius } from "@/app/lib/temperature";
import { ForecastItem } from "@/types/weather";
import Image from "next/image";

const HourlyForecastItem = ({
    item,
    units,
}: {
    item: ForecastItem;
    units: "metric" | "imperial";
}) => {
    const temp =
        units === "metric"
            ? convertToCelsius(Math.round(item.main.temp))
            : Math.round(item.main.temp);
    const time = new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        hour12: true,
    });

    return (
        <div className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-white/5 transition-colors">
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
                    {temp}°{units === "metric" ? "C" : "F"}
                </span>
            </div>
        </div>
    );
};

export default HourlyForecastItem;
