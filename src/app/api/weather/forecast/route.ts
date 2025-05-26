import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const units = searchParams.get("units") || "metric";

    try {
        const apiKey = process.env.OPEN_WEATHER_API_KEY;
        const baseUrl = process.env.OPENWEATHER_FORECAST_BASE_URL;

        const url: string = `${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`OpenWeather API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Weather API error:", error);
        return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
    }
}
