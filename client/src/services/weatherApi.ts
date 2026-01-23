import { WEATHER_GRID, RegionKey } from "./weatherGrid";

export async function fetchUltraWeather(region: RegionKey) {
    const { nx, ny } = WEATHER_GRID[region];

    const res = await fetch(
        `/api/weather/ultra?nx=${nx}&ny=${ny}`,
        {
            headers: { Accept: "application/json" },
            credentials: "include", // 🔥 로그인 쿠키 포함
        }
    );

    if (!res.ok) {
        throw new Error(`ultra weather fetch failed: ${res.status}`);
    }

    return res.json();
}

export async function fetchShortWeather(region: RegionKey) {
    const { nx, ny } = WEATHER_GRID[region];

    const res = await fetch(
        `/api/weather/short?nx=${nx}&ny=${ny}`,
        {
            headers: { Accept: "application/json" },
            credentials: "include", // 🔥 로그인 쿠키 포함
        }
    );

    if (!res.ok) {
        throw new Error(`short weather fetch failed: ${res.status}`);
    }

    return res.json();
}
