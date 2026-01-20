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
export async function getWeatherData(location: string): Promise<WeatherData> {
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

/**
 * 에너지 데이터 조회 (샘플 데이터)
 * 실제 환경: 한국전력, 가스공사, 수도공사 등의 API 호출
 */
export async function getEnergyData(facility: string): Promise<EnergyData> {
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
