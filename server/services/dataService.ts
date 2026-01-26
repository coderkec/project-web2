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
  monthlyStats?: Array<{ month: string; electric: number; gas: number }>;
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
  // 1. 기상청 API 통합 호출 시도
  const realData = await fetchWeatherFromKMA(location);

  if (realData && realData.ncst) {
    const { ncst, short, midLand, midTemp } = realData;
    const items = ncst.response?.body?.items?.item || [];
    const findItem = (cat: string) => items.find((i: any) => i.category === cat)?.obsrValue;

    // 단기 예보 파싱 (시간별 데이터)
    const shortItems = short?.response?.body?.items?.item || [];
    const hourlyMap: Record<string, { time: string; temp: number; feelsLike: number; humidity: number }> = {};

    shortItems.forEach((item: any) => {
      const timeStr = `${item.fcstTime.substring(0, 2)}:00`;
      if (!hourlyMap[timeStr]) hourlyMap[timeStr] = { time: timeStr, temp: 0, feelsLike: 0, humidity: 0 };
      if (item.category === "TMP") {
        hourlyMap[timeStr].temp = parseFloat(item.fcstValue);
        hourlyMap[timeStr].feelsLike = parseFloat(item.fcstValue);
      } else if (item.category === "REH") {
        hourlyMap[timeStr].humidity = parseFloat(item.fcstValue);
      }
    });

    // 중기 예보 파싱 (7일 예보 구성)
    const weeklyForecast: any[] = [];
    const midLandData = midLand?.response?.body?.items?.item?.[0] || {};
    const midTempData = midTemp?.response?.body?.items?.item?.[0] || {};

    for (let i = 3; i <= 7; i++) {
      weeklyForecast.push({
        day: `+${i}일`,
        icon: midLandData[`wf${i}`]?.includes("비") ? "🌧️" : "☀️",
        condition: midLandData[`wf${i}`] || "맑음",
        high: midTempData[`taMax${i}`] || 15,
        low: midTempData[`taMin${i}`] || 5,
      });
    }

    return {
      location: location + ", 대한민국",
      temperature: parseFloat(findItem("T1H") || "0"),
      humidity: parseFloat(findItem("REH") || "0"),
      windSpeed: parseFloat(findItem("WSD") || "0"),
      condition: "맑음",
      description: "실시간 기상 정보",
      feelsLike: parseFloat(findItem("T1H") || "0"),
      precipitation: parseFloat(findItem("RN1") || "0"),
      hourlyData: Object.values(hourlyMap).sort((a, b) => a.time.localeCompare(b.time)).slice(0, 24),
      weeklyForecast: weeklyForecast.length > 0 ? weeklyForecast : undefined,
    };
  }

  // 2. 실패 시 완벽한 24시간 Mock 데이터 생성
  const hourlyData: any[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0") + ":00";
    hourlyData.push({
      time: hour,
      temp: 10 + Math.sin(i / 4) * 5,
      feelsLike: 8 + Math.sin(i / 4) * 5,
      humidity: 60 + Math.cos(i / 4) * 10
    });
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
      hourlyData: hourlyData, // 24시간 데이터 사용
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


import { fetchRealtimeEnergy, fetchKpxRealtimePower, fetchKepcoMonthlyPower, fetchGasYearlyUsage } from "./apiClient";

/**
 * 에너지 데이터 조회
 * KPX(실시간) + KEPCO(월별) + GAS(연도별) 통합
 */
export async function getEnergyData(facility: string): Promise<EnergyData> {
  const metroMapping: Record<string, string> = { "서울": "11", "부산": "26", "경기": "41" };
  const metroCd = metroMapping[facility] || "11";

  try {
    // 1. 실시간/통계 데이터 병렬 호출
    const [kpx, kepco, gas] = await Promise.all([
      fetchKpxRealtimePower(),
      fetchKepcoMonthlyPower("2020", "11", metroCd),
      fetchGasYearlyUsage("2020", facility)
    ]);

    if (kpx && kpx.ok) {
      const kpxData = kpx.data;
      const kepcoData = kepco?.data?.data?.[0];

      // 월별 통계 데이터 매핑 (API에서 12개월 데이터를 가져올 수 없으므로 우선 10~11월만 있는 경우 처리)
      // 실제 구현 시에는 루프를 돌려 API 데이터를 채워넣어야 함
      const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
        month: `${i + 1}월`,
        electric: Math.round(800 + Math.random() * 400),
        gas: Math.round(300 + Math.random() * 200),
      }));

      // KEPCO 데이터 반영 (예: 11월)
      if (kepcoData) {
        monthlyStats[10] = {
          month: "11월",
          electric: Math.round(parseFloat(kepcoData.powerUsage || "0")),
          gas: monthlyStats[10].gas
        };
      }

      return {
        facility: facility + " 에너지 현황",
        energyType: "전기/가스",
        consumption: Math.round(kpxData.demand ?? 0),
        cost: Math.round((kpxData.demand ?? 0) * 150),
        efficiency: 88,
        carbonEmission: Math.round((kpxData.demand ?? 0) * 0.42),
        peakUsage: Math.round(kpxData.supply ?? 0),
        averageUsage: Math.round(kepcoData?.powerUsage ? parseFloat(kepcoData.powerUsage) : (kpxData.demand ?? 0) * 0.8),
        trend: (kpxData.supply - kpxData.demand) > 5000 ? "안정" : "주의",
        notes: gas?.ok ? "도시가스 데이터 연동됨" : "실시간 전력 수급 중",
        recordDate: new Date(),
        monthlyStats: monthlyStats,
      };
    }
  } catch (err) {
    console.warn("[DataService] Failed to fetch real energy data, using fallback.");
  }

  // 3. 실패(또는 아직 연동 전) 시 기존 샘플 데이터 반환 (Fallback)
  const monthlyStats = [
    { month: '1월', electric: 1050, gas: 620 },
    { month: '2월', electric: 980, gas: 580 },
    { month: '3월', electric: 850, gas: 450 },
    { month: '4월', electric: 780, gas: 320 },
    { month: '5월', electric: 720, gas: 280 },
    { month: '6월', electric: 910, gas: 240 },
    { month: '7월', electric: 1250, gas: 220 },
    { month: '8월', electric: 1420, gas: 230 },
    { month: '9월', electric: 950, gas: 290 },
    { month: '10월', electric: 880, gas: 380 },
    { month: '11월', electric: 960, gas: 510 },
    { month: '12월', electric: 1100, gas: 650 },
  ];

  const defaultBase = {
    energyType: "전기",
    consumption: 1200 + Math.random() * 500,
    cost: 180000,
    efficiency: 80 + Math.random() * 10,
    carbonEmission: 600,
    peakUsage: 1500,
    averageUsage: 1100,
    trend: "안정",
    recordDate: new Date(),
    monthlyStats,
  };

  const sampleEnergyData: Record<string, EnergyData> = {
    "서울": { ...defaultBase, facility: "서울 오피스", consumption: 1540, cost: 231000, trend: "하강" },
    "부산": { ...defaultBase, facility: "부산 팩토리", consumption: 3820, cost: 573000, trend: "상승" },
    "경기": { ...defaultBase, facility: "경기 인프라", consumption: 2100, cost: 315000, trend: "안정" },
  };

  return sampleEnergyData[facility] || { ...defaultBase, facility: `${facility} 지점`, monthlyStats };
}

/**
 * 여러 위치의 날씨 데이터 조회
 */
export async function getMultipleWeatherData(locations: string[]): Promise<WeatherData[]> {
  return Promise.all(locations.map((location) => getWeatherData(location)));
}


/**
 * 여러 시설의 에너지 데이터 조회
 */
export async function getMultipleEnergyData(facilities: string[]): Promise<EnergyData[]> {
  return Promise.all(facilities.map((facility) => getEnergyData(facility)));
}
