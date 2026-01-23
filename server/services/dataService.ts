/**
 * 데이터 서비스
 * 날씨, 물류, 에너지 데이터를 제공하는 서비스
 * 실제 환경에서는 외부 API에서 데이터를 가져옵니다.
 */

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description?: string;
  feelsLike?: number;
  uvIndex?: number;
  visibility?: number;
  pressure?: number;
  precipitation?: number;
  hourlyData?: { time: string; temp: number; feelsLike: number; humidity: number }[];
  weeklyForecast?: { day: string; high: number; low: number; condition: string; icon: string }[];
}

export interface LogisticsData {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  carrier?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  weight?: number;
  distance?: number;
  cost?: number;
  notes?: string;
}

export interface EnergyData {
  facility: string;
  energyType: string;
  consumption: number;
  cost: number;
  efficiency?: number;
  carbonEmission?: number;
  peakUsage?: number;
  averageUsage?: number;
  trend?: string;
  notes?: string;
  recordDate: Date;
}

/**
 * 날씨 데이터 조회 (샘플 데이터)
 * 실제 환경: OpenWeatherMap, WeatherAPI 등의 외부 API 호출
 */
import { fetchWeatherFromKMA } from "./apiClient";

/**
 * 날씨 데이터 조회 (샘플 데이터 + 실제 API)
 * 실제 환경: KMA API (기상청) 호출 -> 실패 시 샘플 데이터 반환
 */
export async function getWeatherData(location: string): Promise<WeatherData> {
  // 1. 기상청 API 호출 시도
  const realData = await fetchWeatherFromKMA(location);

  if (realData) {
    return {
      location: realData.location,
      temperature: realData.temperature,
      humidity: realData.humidity,
      windSpeed: realData.windSpeed,
      condition: realData.condition,
      description: realData.condition, // 간단하게 condition 사용
      feelsLike: realData.temperature, // 체감온도는 별도 계산 필요하지만 일단 기온으로 대체
      uvIndex: 0, // 초단기실황에는 없음
      visibility: 10000,
      pressure: 1013,
      precipitation: realData.precipitation,
      hourlyData: realData.hourlyData || [],
      weeklyForecast: realData.weeklyForecast || [],
    };
  }

  // 2. 실패 시 Mock 데이터 반환 (Fallback)
  const sampleWeatherData: Record<string, WeatherData> = {
    "서울": {
      location: "서울, 대한민국",
      temperature: 15,
      humidity: 65,
      windSpeed: 12,
      condition: "맑음",
      description: "맑은 하늘",
      feelsLike: 13,
      uvIndex: 5,
      visibility: 10000,
      pressure: 1013,
      precipitation: 0,
      hourlyData: [
        { time: "00:00", temp: 8, feelsLike: 5, humidity: 75 },
        { time: "04:00", temp: 6, feelsLike: 2, humidity: 82 },
        { time: "08:00", temp: 10, feelsLike: 7, humidity: 68 },
        { time: "12:00", temp: 15, feelsLike: 13, humidity: 65 },
        { time: "16:00", temp: 18, feelsLike: 16, humidity: 58 },
        { time: "20:00", temp: 14, feelsLike: 11, humidity: 70 },
        { time: "24:00", temp: 10, feelsLike: 7, humidity: 78 },
      ],
      weeklyForecast: [
        { day: "월", high: 16, low: 8, condition: "맑음", icon: "☀️" },
        { day: "화", high: 14, low: 6, condition: "흐림", icon: "☁️" },
        { day: "수", high: 12, low: 5, condition: "비", icon: "🌧️" },
        { day: "목", high: 13, low: 6, condition: "흐림", icon: "☁️" },
        { day: "금", high: 17, low: 9, condition: "맑음", icon: "☀️" },
        { day: "토", high: 19, low: 11, condition: "맑음", icon: "☀️" },
        { day: "일", high: 18, low: 10, condition: "맑음", icon: "☀️" },
      ],
    },
    "부산": {
      location: "부산, 대한민국",
      temperature: 18,
      humidity: 70,
      windSpeed: 15,
      condition: "흐림",
      description: "구름이 많음",
      feelsLike: 16,
      uvIndex: 3,
      visibility: 8000,
      pressure: 1012,
      precipitation: 2,
    },
  };

  return sampleWeatherData[location] || sampleWeatherData["서울"];
}

/**
 * 물류 데이터 조회 (샘플 데이터)
 * 실제 환경: 쿠팡, CJ대한통운, 롯데택배 등의 API 호출
 */
export async function getLogisticsData(trackingNumber: string): Promise<LogisticsData> {
  const sampleLogisticsData: Record<string, LogisticsData> = {
    "CJ123456789": {
      trackingNumber: "CJ123456789",
      status: "배송중",
      origin: "서울 강남구",
      destination: "부산 해운대구",
      carrier: "CJ대한통운",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      weight: 2500,
      distance: 450,
      cost: 5000,
      notes: "안전 배송 중입니다",
    },
    "LOTTE987654321": {
      trackingNumber: "LOTTE987654321",
      status: "배송완료",
      origin: "인천 남동구",
      destination: "서울 마포구",
      carrier: "롯데택배",
      actualDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      weight: 1800,
      distance: 30,
      cost: 3000,
      notes: "배송이 완료되었습니다",
    },
  };

  return sampleLogisticsData[trackingNumber] || sampleLogisticsData["CJ123456789"];
}

import { fetchRealtimeEnergy } from "./apiClient";

/**
 * 에너지 데이터 조회
 * 실제 환경: Worker Node(API) 호출 -> 실패 시 샘플 데이터 반환 (Hybrid)
 */
export async function getEnergyData(facility: string): Promise<EnergyData> {
  // 1. 외부 API 호출 시도
  const realData = await fetchRealtimeEnergy(facility);

  if (realData) {
    // API 응답 구조를 EnergyData 인터페이스에 맞게 변환해야 함 (매핑 로직)
    // 여기서는 API가 우리 DB 구조와 비슷하게 준다고 가정하거나, 필요한 필드만 매핑
    return {
      facility: realData.facility || facility,
      energyType: realData.energyType || "전기",
      consumption: realData.consumption ?? 0,
      cost: realData.cost ?? 0,
      efficiency: realData.efficiency,
      carbonEmission: realData.carbonEmission,
      peakUsage: realData.peakUsage,
      averageUsage: realData.averageUsage,
      trend: realData.trend,
      notes: realData.notes,
      recordDate: new Date(realData.recordDate || Date.now()),
    };
  }

  // 2. 실패(또는 아직 연동 전) 시 기존 샘플 데이터 반환 (Fallback)
  const sampleEnergyData: Record<string, EnergyData> = {
    "본사빌딩": {
      facility: "본사 빌딩",
      energyType: "전기",
      consumption: 1250,
      cost: 187500,
      efficiency: 78,
      carbonEmission: 625,
      peakUsage: 1800,
      averageUsage: 1100,
      trend: "하강",
      notes: "효율성이 개선되고 있습니다",
      recordDate: new Date(),
    },
    "공장": {
      facility: "공장",
      energyType: "전기",
      consumption: 3500,
      cost: 525000,
      efficiency: 65,
      carbonEmission: 1750,
      peakUsage: 5000,
      averageUsage: 3200,
      trend: "상승",
      notes: "생산량 증가로 인한 사용량 증가",
      recordDate: new Date(),
    },
  };

  return sampleEnergyData[facility] || sampleEnergyData["본사빌딩"];
}

/**
 * 여러 위치의 날씨 데이터 조회
 */
export async function getMultipleWeatherData(locations: string[]): Promise<WeatherData[]> {
  return Promise.all(locations.map((location) => getWeatherData(location)));
}

/**
 * 여러 배송 번호의 물류 데이터 조회
 */
export async function getMultipleLogisticsData(trackingNumbers: string[]): Promise<LogisticsData[]> {
  return Promise.all(trackingNumbers.map((trackingNumber) => getLogisticsData(trackingNumber)));
}

/**
 * 여러 시설의 에너지 데이터 조회
 */
export async function getMultipleEnergyData(facilities: string[]): Promise<EnergyData[]> {
  return Promise.all(facilities.map((facility) => getEnergyData(facility)));
}
