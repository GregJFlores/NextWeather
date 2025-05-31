export type WeatherData = {
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

export type ForecastData = {
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

export type ForecastDay = {
    date: string;
    high: number;
    low: number;
    items: ForecastItem[];
};

export type ForecastWeek = {
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

export type WeatherForecastResponse = {
    cod: string;
    message: number;
    cnt: number;
    list: ForecastItem[];
    city: {
        id: number;
        name: string;
        coord: { lat: number; lon: number };
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
    };
};

export type ForecastItem = {
    dt: number;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        sea_level: number;
        grnd_level: number;
        humidity: number;
        temp_kf: number;
    };
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
    }[];
    clouds: {
        all: number;
    };
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    visibility: number;
    pop: number;
    rain?: {
        "3h": number;
    };
    sys: {
        pod: string;
    };
    dt_txt: string; // "2022-08-30 15:00:00"
};

export type CurrentWeatherResponse = {
    coord: {
        lon: number;
        lat: number;
    };
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    base: string;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
        sea_level?: number;
        grnd_level?: number;
    };
    visibility: number;
    wind: {
        speed: number;
        deg: number;
        gust?: number;
    };
    rain?: {
        "1h"?: number;
        "3h"?: number;
    };
    snow?: {
        "1h"?: number;
        "3h"?: number;
    };
    clouds: {
        all: number;
    };
    dt: number; // Unix timestamp
    sys: {
        type?: number;
        id?: number;
        country: string;
        sunrise: number;
        sunset: number;
    };
    timezone: number; // seconds from UTC
    id: number;
    name: string;
    cod: number;
};
