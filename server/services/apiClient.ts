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

export async function fetchWeatherFromKMA(location: string) {
    // 컨테이너 API 주소 (예: http://192.168.x.x:30080)
    const KMA_API_URL = process.env.KMA_API_URL;

    if (!KMA_API_URL) {
        console.warn("[API Client] KMA_API_URL not defined. Using mock/fallback.");
        return null;
    }

    try {
        // 컨테이너가 제공하는 API 명세에 따라 수정 필요
        // 가정: GET /weather?city={location} 또는 /current
        const response = await axios.get(`${KMA_API_URL}/weather`, {
            params: { city: location }
        });

        // 데이터 구조가 다르다면 여기서 매핑 로직 필요
        return response.data;
    } catch (error: any) {
        return handleApiError(error, "KMA API Container");
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
