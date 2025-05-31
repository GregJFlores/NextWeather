export type GeocodingResult = {
    name: string;
    local_names?: Record<string, string>; // language code to localized name
    lat: number;
    lon: number;
    country: string;
    state?: string;
};

export type GeocodingResponse = GeocodingResult[];
