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

const KMA_API_URL = process.env.KMA_API_URL || "http://10.2.2.5:3000";
const ENERGY_BASE = process.env.ENERGY_API_URL || "http://10.2.2.6:8000";

const LOC_TO_GRID: Record<string, { nx: number; ny: number; regIdLand: string; regIdTemp: string; metroCd: string }> = {
    "서울": { nx: 60, ny: 127, regIdLand: "11B00000", regIdTemp: "11B10101", metroCd: "11" },
    "부산": { nx: 98, ny: 76, regIdLand: "11H20000", regIdTemp: "11H20201", metroCd: "26" },
    "인천": { nx: 55, ny: 124, regIdLand: "11B00000", regIdTemp: "11B20201", metroCd: "28" },
    "경기": { nx: 60, ny: 120, regIdLand: "11B00000", regIdTemp: "11B20601", metroCd: "41" },
};

export async function fetchWeatherFromKMA(location: string) {
    const grid = LOC_TO_GRID[location] || LOC_TO_GRID["서울"];

    // 개별 호출을 독립적으로 처리하여 하나가 실패해도 나머지는 살립니다.
    const fetchSafe = async (url: string, params: any, name: string) => {
        try {
            console.log(`[Weather API] Requesting ${name} from: ${url}`);
            const r = await axios.get(url, { params, timeout: 4000 });
            return r.data;
        } catch (e: any) {
            console.error(`[Weather API] ${name} fetch failed:`, e.message);
            return null;
        }
    };

    // 사용자의 피드백을 반영하여 초단기 실황 엔드포인트를 /weather/ultra로 수정
    const [ncst, short, midLand, midTemp] = await Promise.all([
        fetchSafe(`${KMA_API_URL}/weather/ultra`, { nx: grid.nx, ny: grid.ny }, "Current NCST (Ultra)"),
        fetchSafe(`${KMA_API_URL}/weather/short`, { nx: grid.nx, ny: grid.ny }, "Short Forecast"),
        fetchSafe(`${KMA_API_URL}/weather/mid/land`, { regId: grid.regIdLand }, "Mid Land"),
        fetchSafe(`${KMA_API_URL}/weather/mid/temp`, { regId: grid.regIdTemp }, "Mid Temp")
    ]);

    return { location, ncst, short, midLand, midTemp };
}

// 에너지 API 전용 클라이언트 함수들
export async function fetchKpxRealtimePower() {
    try {
        const response = await axios.get(`${ENERGY_BASE}/kpx/now`, {
            params: { page: 1, perPage: 100 }
        });
        return response.data;
    } catch (error) {
        return handleApiError(error, "Energy API (KPX Now)");
    }
}

export async function fetchKepcoMonthlyPower(year: string, month: string, metroCd: string) {
    try {
        const response = await axios.get(`${ENERGY_BASE}/power/monthly`, {
            params: { year, month, metroCd }
        });
        return response.data;
    } catch (error) {
        return handleApiError(error, "Energy API (KEPCO Monthly)");
    }
}

export async function fetchGasYearlyUsage(year: string, sido: string) {
    try {
        const response = await axios.get(`${ENERGY_BASE}/gas/sido/year`, {
            params: { year, sido }
        });
        return response.data;
    } catch (error) {
        return handleApiError(error, "Energy API (GAS Yearly)");
    }
}

export async function fetchRealtimeEnergy(facilityId: string) {
    try {
        const response = await axios.get(`${ENERGY_BASE}/energy/realtime/${facilityId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, "Energy API Container");
    }
}
