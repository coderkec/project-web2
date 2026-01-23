import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// 외부 API 기본 URL (환경 변수 또는 기본값)
const PC3_API_URL = process.env.PC3_API_URL || "http://pc3-api-placeholder";
const WORKER_NODE_API_URL = process.env.WORKER_NODE_API_URL || "http://worker-node-placeholder";

// Axios 인스턴스 생성 (타임아웃 등 설정)
const pc3Client = axios.create({
    baseURL: PC3_API_URL,
    timeout: 5000,
});

const workerClient = axios.create({
    baseURL: WORKER_NODE_API_URL,
    timeout: 5000,
});

// 에러 처리 헬퍼
const handleApiError = (error: any, source: string) => {
    console.error(`[API Error] Failed to fetch from ${source}:`, error.message);
    return null; // 에러 발생 시 null 반환 (Mock 데이터로 폴백하기 위함)
};

// [아이디어 1] 글로벌 에너지 동향 (환율/유가) - PC3
export async function fetchGlobalEnergyTrends() {
    try {
        // 실제 엔드포인트는 연동 시 수정 필요
        const response = await pc3Client.get("/api/energy/trends");
        return response.data;
    } catch (error) {
        return handleApiError(error, "PC3 (Global Trends)");
    }
}

// [아이디어 2] 사내 공지사항 - PC3
export async function fetchCompanyNotices() {
    try {
        const response = await pc3Client.get("/api/notices");
        return response.data;
    } catch (error) {
        return handleApiError(error, "PC3 (Notices)");
    }
}



// [아이디어 3] 상세 대기질 - PC3 or Public API
export async function fetchDetailedAirQuality(location: string) {
    try {
        const response = await pc3Client.get(`/api/weather/air-quality?location=${location}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, "PC3 (Air Quality)");
    }
}

// [Real] 기상청/에너지 컨테이너 연동
// .env에 설정된 URL을 통해 Kubernetes 서비스(또는 NodePort)를 호출합니다.

// 지역 매핑 정보 (NX/NY 좌표 및 중기 예보용 구역 코드)
const REGION_MAPPING: Record<string, { nx: number, ny: number, landRegId: string, tempRegId: string }> = {
    "서울": { nx: 60, ny: 127, landRegId: "11B00000", tempRegId: "11B10101" },
    "인천": { nx: 55, ny: 124, landRegId: "11B00000", tempRegId: "11B20201" },
    "부산": { nx: 98, ny: 76, landRegId: "11H20000", tempRegId: "11H20201" },
    "대구": { nx: 89, ny: 90, landRegId: "11H10000", tempRegId: "11H10701" },
    "대전": { nx: 67, ny: 100, landRegId: "11C20000", tempRegId: "11C20401" },
    "광주": { nx: 58, ny: 74, landRegId: "11F20000", tempRegId: "11F20501" },
    "울산": { nx: 102, ny: 84, landRegId: "11H20000", tempRegId: "11H20101" },
};

// 안전한 숫자 파싱 유틸리티
const safeParseFloat = (val: any, fallback = 0) => {
    if (val === undefined || val === null || val === "강수없음" || val === "적설없음") return fallback;
    const valStr = String(val).replace(/[^0-9.-]/g, ""); // 숫자와 소수점만 남김
    const parsed = parseFloat(valStr);
    return isNaN(parsed) ? fallback : parsed;
};

export async function fetchWeatherFromKMA(location: string) {
    const KMA_API_URL = process.env.KMA_API_URL;
    const KMA_SERVICE_KEY = process.env.KMA_SERVICE_KEY;

    if (!KMA_API_URL) {
        console.warn("[API Client] KMA_API_URL not defined. Using mock/fallback.");
        return null;
    }

    const region = REGION_MAPPING[location] || REGION_MAPPING["서울"];
    const baseParams = KMA_SERVICE_KEY ? { serviceKey: KMA_SERVICE_KEY } : {};

    try {
        console.log(`[KMA API] Using URL: ${KMA_API_URL}`);
        console.log(`[KMA API] Fetching weather for ${location} (nx=${region.nx}, ny=${region.ny}, land=${region.landRegId}, temp=${region.tempRegId})`);

        // 4대 API 병렬 호출 (timeout 설정 추가 및 인증키 포함)
        // 슬래시(/)를 제거하여 사용자 curl 명령어와 주소를 정확히 일치시킵니다.
        const [ncstRes, shortRes, midTempRes, midLandRes] = await Promise.all([
            axios.get(`${KMA_API_URL}/weather`, { params: { ...baseParams, nx: region.nx, ny: region.ny }, timeout: 15000 }).catch(e => { console.error("[KMA API] ncst failed:", e.code || e.message, `URL: ${KMA_API_URL}/weather`); return null; }),
            axios.get(`${KMA_API_URL}/weather/short`, { params: { ...baseParams, nx: region.nx, ny: region.ny }, timeout: 15000 }).catch(e => { console.error("[KMA API] short failed:", e.code || e.message, `URL: ${KMA_API_URL}/weather/short`); return null; }),
            axios.get(`${KMA_API_URL}/weather/mid/temp`, { params: { ...baseParams, regId: region.tempRegId }, timeout: 15000 }).catch(e => { console.error("[KMA API] mid-temp failed:", e.code || e.message, `URL: ${KMA_API_URL}/weather/mid/temp`); return null; }),
            axios.get(`${KMA_API_URL}/weather/mid/land`, { params: { ...baseParams, regId: region.landRegId }, timeout: 15000 }).catch(e => { console.error("[KMA API] mid-land failed:", e.code || e.message, `URL: ${KMA_API_URL}/weather/mid/land`); return null; })
        ]);

        console.log("[KMA API] Response Received Status:", {
            ncst: !!ncstRes?.data,
            short: !!shortRes?.data,
            midTemp: !!midTempRes?.data,
            midLand: !!midLandRes?.data
        });

        // 1. 초단기 실황 (ncst)
        const ncstData = ncstRes?.data;
        const ncstItems = ncstData?.response?.body?.items?.item || [];

        // 평면 구조와 중첩 구조 모두 지원하는 헬퍼
        const findNcst = (cat: string) => {
            if (ncstItems.length > 0) {
                return ncstItems.find((i: any) => i.category === cat)?.obsrValue;
            }
            // 평면 구조 매핑 (사용자 curl 결과 기반)
            const map: Record<string, any> = {
                "T1H": ncstData?.temperature_c,
                "REH": ncstData?.humidity_pct,
                "WSD": ncstData?.wind_speed_ms,
                "RN1": ncstData?.rain_1h_mm,
                "PTY": ncstData?.precip_type
            };
            return map[cat];
        };

        // 2. 단기 예보 (short) -> 오늘/내일/모레 요약 정보 추출
        const shortData = shortRes?.data;
        const shortItems = Array.isArray(shortData) ? shortData : (shortData?.response?.body?.items?.item || []);

        const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
        const todayIdx = new Date().getDay();

        // 날짜별로 그룹화 (평면 구조인 경우 fcstDate, fcstTime 등이 루트에 있을 수 있음)
        let shortForecasts: { day: string, high: number, low: number, condition: string, icon: string }[] = [];
        if (shortItems.length > 0 && shortItems[0].fcstDate) {
            const shortDates = Array.from(new Set(shortItems.map((i: any) => i.fcstDate))).sort() as string[];
            shortForecasts = shortDates.slice(0, 3).map((date, idx) => {
                const dayItems = shortItems.filter((i: any) => i.fcstDate === date);
                const temps = dayItems.filter((i: any) => i.category === "TMP" || i.category === "T1H").map((i: any) => safeParseFloat(i.fcstValue || i.obsrValue));
                const sky = dayItems.find((i: any) => (i.category === "SKY") && (i.fcstTime === "1200" || i.fcstTime === "1500"))?.fcstValue ||
                    dayItems.find((i: any) => i.category === "SKY")?.fcstValue || "1";
                const pty = dayItems.find((i: any) => (i.category === "PTY") && parseFloat(i.fcstValue || i.obsrValue) > 0)?.fcstValue || "0";

                let cond = "맑음";
                if (pty !== "0") cond = "비";
                else if (sky === "3") cond = "구름많음";
                else if (sky === "4") cond = "흐림";

                return {
                    day: weekDays[(todayIdx + idx) % 7],
                    high: temps.length > 0 ? Math.max(...temps) : 18,
                    low: temps.length > 0 ? Math.min(...temps) : 10,
                    condition: cond,
                    icon: cond.includes("비") ? "🌧️" : cond.includes("구름") ? "☁️" : "☀️"
                };
            });
        }

        // 시간별 데이터 (그래프용)
        const hourlyData = shortItems
            .filter((i: any) => i.category === "TMP")
            .slice(0, 12)
            .map((i: any) => ({
                time: `${i.fcstTime.substring(0, 2)}:00`,
                temp: safeParseFloat(i.fcstValue, 15),
                feelsLike: safeParseFloat(i.fcstValue, 15),
                humidity: safeParseFloat(shortItems.find((s: any) => s.fcstTime === i.fcstTime && s.category === "REH")?.fcstValue, 60)
            }));

        // 3. 중기 예보 -> Day 3 ~ 7 정보 추출
        const midTempItem = midTempRes?.data?.response?.body?.items?.item?.[0];
        const midLandItem = midLandRes?.data?.response?.body?.items?.item?.[0];

        const midForecasts = [];
        // 3일 후부터 7일 후까지 5일치 추가 (총 3+5=8일이지만 나중에 7개로 자름)
        for (let i = 3; i <= 7; i++) {
            const high = midTempItem ? safeParseFloat(midTempItem[`taMax${i}`], 18) : 18;
            const low = midTempItem ? safeParseFloat(midTempItem[`taMin${i}`], 10) : 10;
            const cond = midLandItem ? (midLandItem[`wf${i}Pm`] || midLandItem[`wf${i}`]) : "맑음";

            midForecasts.push({
                day: weekDays[(todayIdx + i) % 7],
                high: high,
                low: low,
                condition: cond,
                icon: cond?.includes("비") ? "🌧️" : cond?.includes("구름") ? "☁️" : "☀️"
            });
        }

        // 4. 최종 병합 및 7개로 제한 (오늘 포함 일주일)
        const combinedForecast = [...shortForecasts, ...midForecasts].slice(0, 7);

        return {
            location: location + ", 대한민국",
            temperature: safeParseFloat(findNcst("T1H"), 15),
            humidity: safeParseFloat(findNcst("REH"), 60),
            windSpeed: safeParseFloat(findNcst("WSD"), 0),
            condition: shortForecasts[0]?.condition || midLandItem?.wf3Am || "맑음",
            precipitation: safeParseFloat(findNcst("RN1"), 0),
            hourlyData: hourlyData.length > 0 ? hourlyData : [
                { time: "09:00", temp: 15, feelsLike: 14, humidity: 60 },
                { time: "12:00", temp: 18, feelsLike: 17, humidity: 55 }
            ],
            weeklyForecast: combinedForecast.length > 0 ? combinedForecast : [
                { day: "오늘", high: 18, low: 10, condition: "맑음", icon: "☀️" },
                { day: "내일", high: 17, low: 9, condition: "흐림", icon: "☁️" }
            ]
        };
    } catch (error: any) {
        console.error("[KMA API] Comprehensive Error:", error.message);
        return null; // This will trigger the global fallback in dataService.ts
    }
}

export async function fetchRealtimeEnergy(facilityId: string) {
    const ENERGY_API_URL = process.env.ENERGY_API_URL;

    if (!ENERGY_API_URL) {
        console.warn("[API Client] ENERGY_API_URL not defined. Using mock/fallback.");
        return null;
    }

    try {
        const response = await axios.get(`${ENERGY_API_URL}/energy/realtime/${facilityId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, "Energy API Container");
    }
}
