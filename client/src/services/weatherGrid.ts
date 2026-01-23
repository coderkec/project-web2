export const WEATHER_GRID = {
    seoul: { nx: 60, ny: 127 },
    daejeon: { nx: 67, ny: 100 },
    gwangju: { nx: 58, ny: 74 },
    daegu: { nx: 89, ny: 90 },
    busan: { nx: 98, ny: 76 },
    jeju: { nx: 52, ny: 38 },
} as const;

export type RegionKey = keyof typeof WEATHER_GRID;
