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
  hourlyData?: Array<{ time: string; temp: number; feelsLike: number; humidity: number }>;
  weeklyForecast?: Array<{ day: string; icon: string; condition: string; high: number; low: number }>;
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

  if (realData && realData.ncst) {
    const { ncst } = realData;
    // Extracting values from the new response format
    // Assuming the response from 10.2.2.101 has items in a specific format
    // Based on typical KMA API wrappers
    const items = ncst.response?.body?.items?.item || [];
    const findItem = (cat: string) => items.find((i: any) => i.category === cat)?.obsrValue;

    // 단기 예보 파싱 (시간별 데이터 및 주간 예보 구성)
    const shortItems = realData.short?.response?.body?.items?.item || [];
    const hourlyData: any[] = [];
    const dailyMap: Record<string, { high: number; low: number }> = {};

    shortItems.forEach((item: any) => {
      if (item.category === "TMP") {
        const timeStr = `${item.fcstTime.substring(0, 2)}:00`;
        if (hourlyData.length < 24) {
          hourlyData.push({
            time: timeStr,
            temp: parseFloat(item.fcstValue),
            feelsLike: parseFloat(item.fcstValue), // 단순화
            humidity: 60 // 임시
          });
        }
      }
    });

    return {
      location: realData.location + ", 대한민국",
      temperature: parseFloat(findItem("T1H") || "0"),
      humidity: parseFloat(findItem("REH") || "0"),
      windSpeed: parseFloat(findItem("WSD") || "0"),
      condition: "맑음", // 기본값
      description: "실시간 기상 정보",
      feelsLike: parseFloat(findItem("T1H") || "0"),
      precipitation: parseFloat(findItem("RN1") || "0"),
      hourlyData: hourlyData.length > 0 ? hourlyData : undefined,
      weeklyForecast: [
        { day: "오늘", icon: "☀️", condition: "맑음", high: 15, low: 10 },
        { day: "내일", icon: "☁️", condition: "흐림", high: 14, low: 9 },
      ],
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
        { time: "00:00", temp: 12, feelsLike: 10, humidity: 70 },
        { time: "06:00", temp: 10, feelsLike: 8, humidity: 75 },
        { time: "12:00", temp: 15, feelsLike: 13, humidity: 65 },
        { time: "18:00", temp: 14, feelsLike: 12, humidity: 68 },
      ],
      weeklyForecast: [
        { day: "월", icon: "☀️", condition: "맑음", high: 16, low: 10 },
        { day: "화", icon: "☁️", condition: "흐림", high: 14, low: 9 },
        { day: "수", icon: "☀️", condition: "맑음", high: 17, low: 11 },
        { day: "목", icon: "🌧️", condition: "비", high: 12, low: 8 },
        { day: "금", icon: "☁️", condition: "흐림", high: 13, low: 9 },
        { day: "토", icon: "☀️", condition: "맑음", high: 18, low: 12 },
        { day: "일", icon: "☀️", condition: "맑음", high: 19, low: 13 },
      ]
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
      hourlyData: [
        { time: "00:00", temp: 15, feelsLike: 13, humidity: 75 },
        { time: "06:00", temp: 14, feelsLike: 12, humidity: 80 },
        { time: "12:00", temp: 18, feelsLike: 16, humidity: 70 },
        { time: "18:00", temp: 17, feelsLike: 15, humidity: 72 },
      ],
      weeklyForecast: [
        { day: "월", icon: "☁️", condition: "흐림", high: 18, low: 13 },
        { day: "화", icon: "☀️", condition: "맑음", high: 20, low: 15 },
        { day: "수", icon: "🌧️", condition: "비", high: 16, low: 12 },
        { day: "목", icon: "☁️", condition: "흐림", high: 17, low: 13 },
        { day: "금", icon: "☀️", condition: "맑음", high: 19, low: 14 },
        { day: "토", icon: "☀️", condition: "맑음", high: 21, low: 16 },
        { day: "일", icon: "☀️", condition: "맑음", high: 22, low: 17 },
      ]
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
