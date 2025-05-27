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

export type ForecastItem = {
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
