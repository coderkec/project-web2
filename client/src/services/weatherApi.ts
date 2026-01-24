// client/src/services/weatherApi.ts

import { WEATHER_GRID, RegionKey } from "./weatherGrid";

const BASE_API = "http://172.16.6.61";

export async function fetchUltraWeather(region: RegionKey) {
    const { nx, ny } = WEATHER_GRID[region];

    const res = await fetch(
        `${BASE_API}/api/weather/ultra?nx=${nx}&ny=${ny}`,
        {
            headers: { Accept: "application/json" },
            credentials: "include",
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
        `${BASE_API}/api/weather/short?nx=${nx}&ny=${ny}`,
        {
            headers: { Accept: "application/json" },
            credentials: "include",
        }
    );

    if (!res.ok) {
        throw new Error(`short weather fetch failed: ${res.status}`);
    }

    return res.json();
}
