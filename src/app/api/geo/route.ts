import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    if (!city) {
        return NextResponse.json({ error: "City parameter is required" }, { status: 400 });
    }
    const stateCode = searchParams.get("stateCode");
    const countryCode = searchParams.get("countryCode");

    try {
        const apiKey = process.env.OPEN_WEATHER_API_KEY;
        const baseUrl = process.env.OPENWEATHER_GEO_BASE_URL;
        console.log("API Key:", apiKey);
        console.log("Base URL:", baseUrl);

        let url = `${baseUrl}?q=${encodeURIComponent(city)}`;
        if (stateCode) {
            url += `,${encodeURIComponent(stateCode)}`;
        }
        if (countryCode) {
            url += `,${encodeURIComponent(countryCode)}`;
        }
        url += `&appid=${apiKey}&limit=5`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`OpenWeather API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Geocoding API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch geocoding information" },
            { status: 500 }
        );
    }
}
