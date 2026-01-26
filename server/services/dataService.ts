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

import { fetchWeatherFromKMA } from "./apiClient";

/**
 * 날씨 데이터 조회 (샘플 데이터 + 실제 API)
 */
export async function getWeatherData(location: string): Promise<WeatherData> {
  const realData = await fetchWeatherFromKMA(location);

  if (realData && realData.ncst) {
    const { ncst, short, midLand, midTemp } = realData;

    // 1. 실황(NCST) 데이터
    const items = ncst?.response?.body?.items?.item || [];
    const findItem = (cat: string) => items.find((i: any) => i.category === cat)?.obsrValue;
    const temperature = findItem("T1H");

    if (temperature !== undefined) {
      // 2. 단기 예보(SHORT)로 시간별 데이터 및 오늘/내일 예보 추출
      const shortItems = short?.response?.body?.items?.item || [];
      const hourlyMap: Record<string, { time: string; temp: number; feelsLike: number; humidity: number }> = {};

      // 요일 구하기 유틸
      const getDayName = (offset: number) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
      };

      const dailyMinMax: Record<string, { high: number; low: number; condition: string }> = {};

      shortItems.forEach((item: any) => {
        // 시간별 데이터 (24시간)
        const timeStr = `${item.fcstTime.substring(0, 2)}:00`;
        if (!hourlyMap[timeStr]) hourlyMap[timeStr] = { time: timeStr, temp: 0, feelsLike: 0, humidity: 0 };
        if (item.category === "TMP") {
          hourlyMap[timeStr].temp = parseFloat(item.fcstValue);
          hourlyMap[timeStr].feelsLike = parseFloat(item.fcstValue);
        } else if (item.category === "REH") {
          hourlyMap[timeStr].humidity = parseFloat(item.fcstValue);
        }

        // 일별 최저/최고 추출 (오늘, 내일, 모레)
        const dateStr = item.fcstDate; // YYYYMMDD
        if (!dailyMinMax[dateStr]) dailyMinMax[dateStr] = { high: -99, low: 99, condition: "맑음" };
        if (item.category === "TMN") dailyMinMax[dateStr].low = parseFloat(item.fcstValue);
        if (item.category === "TMX") dailyMinMax[dateStr].high = parseFloat(item.fcstValue);
        if (item.category === "SKY") {
          const sky = parseInt(item.fcstValue);
          dailyMinMax[dateStr].condition = sky >= 3 ? "흐림" : "맑음";
        }
      });

      // 3. 중기 예보(MID)와 병합하여 7일 예보 완성
      const weeklyForecast: any[] = [];
      const sortedDates = Object.keys(dailyMinMax).sort();

      // Day 0, 1, 2 (Short)
      sortedDates.slice(0, 3).forEach((date, idx) => {
        weeklyForecast.push({
          day: getDayName(idx),
          icon: dailyMinMax[date].condition === "비" ? "🌧️" : (dailyMinMax[date].condition === "흐림" ? "☁️" : "☀️"),
          condition: dailyMinMax[date].condition,
          high: dailyMinMax[date].high === -99 ? (parseFloat(temperature) + 2) : dailyMinMax[date].high,
          low: dailyMinMax[date].low === 99 ? (parseFloat(temperature) - 3) : dailyMinMax[date].low,
        });
      });

      // Day 3 ~ 7 (Mid)
      const midLandData = midLand?.response?.body?.items?.item?.[0] || {};
      const midTempData = midTemp?.response?.body?.items?.item?.[0] || {};

      for (let i = 3; i <= 7; i++) {
        if (midLandData[`wf${i}`]) {
          weeklyForecast.push({
            day: getDayName(i),
            icon: midLandData[`wf${i}`]?.includes("비") ? "🌧️" : (midLandData[`wf${i}`]?.includes("구름") ? "☁️" : "☀️"),
            condition: midLandData[`wf${i}`] || "맑음",
            high: midTempData[`taMax${i}`] || 15,
            low: midTempData[`taMin${i}`] || 5,
          });
        }
      }

      return {
        location: location + ", 대한민국",
        temperature: parseFloat(temperature || "0"),
        humidity: parseFloat(findItem("REH") || "0"),
        windSpeed: parseFloat(findItem("WSD") || "0"),
        condition: "맑음",
        description: "기상청 실시간 정보",
        feelsLike: parseFloat(temperature || "0"),
        precipitation: parseFloat(findItem("RN1") || "0"),
        hourlyData: Object.values(hourlyMap).sort((a, b) => a.time.localeCompare(b.time)).slice(0, 24),
        weeklyForecast: weeklyForecast,
      };
    }
  }

  // 4. 실패 시 Mock (겨울철 반영)
  const isWinter = [11, 0, 1].includes(new Date().getMonth());
  const baseTemp = isWinter ? -5 : 15;

  return {
    location: location + ", 대한민국",
    temperature: baseTemp,
    humidity: 55,
    windSpeed: 3.2,
    condition: "맑음",
    description: "데이터 통신 지연 (Mock)",
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, "0")}:00`,
      temp: baseTemp + Math.sin(i / 4) * 4,
      feelsLike: baseTemp - 2,
      humidity: 50 + Math.cos(i / 4) * 10
    })),
    weeklyForecast: ["일", "월", "화", "수", "목", "금", "토"].map((d, i) => ({
      day: d,
      icon: "☀️",
      condition: "맑음",
      high: baseTemp + 2,
      low: baseTemp - 5
    }))
  };
}


import { fetchRealtimeEnergy, fetchKpxRealtimePower, fetchKepcoMonthlyPower, fetchGasYearlyUsage } from "./apiClient";

/**
 * 에너지 데이터 조회
 * 12개월 통계 확보
 */
export async function getEnergyData(facility: string): Promise<EnergyData> {
  const metroMapping: Record<string, string> = { "서울": "11", "부산": "26", "경기": "41" };
  const metroCd = metroMapping[facility] || "11";

  try {
    const [kpx, kepco, gas] = await Promise.all([
      fetchKpxRealtimePower(),
      fetchKepcoMonthlyPower("2020", "11", metroCd),
      fetchGasYearlyUsage("2020", facility)
    ]);

    // 12개월 생성 (계절성 반영)
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const isSummerOrWinter = [1, 2, 7, 8, 12].includes(month);
      return {
        month: `${month}월`,
        electric: Math.round((isSummerOrWinter ? 1200 : 800) + Math.random() * 200),
        gas: Math.round((month <= 3 || month >= 11 ? 500 : 100) + Math.random() * 100),
      };
    });

    if (kpx && kpx.ok) {
      const kpxData = kpx.data;
      const kepcoData = kepco?.data?.data?.[0];

      // KEPCO 11월 데이터 반영
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
        consumption: Math.round(kpxData.demand ?? 1540),
        cost: Math.round((kpxData.demand ?? 1540) * 150),
        efficiency: 88,
        carbonEmission: Math.round((kpxData.demand ?? 1540) * 0.42),
        peakUsage: Math.round(kpxData.supply ?? 1800),
        averageUsage: Math.round(kepcoData?.powerUsage ? parseFloat(kepcoData.powerUsage) : 1200),
        trend: "안정",
        notes: gas?.ok ? "도시가스 연동됨" : "실시간 수급 중",
        recordDate: new Date(),
        monthlyStats: monthlyStats,
      };
    }
  } catch (err) {
    console.warn("[DataService] Error fetching energy, using detailed fallback.");
  }

  // Final 12-month Fallback
  return {
    facility: facility + " 지점",
    energyType: "전기",
    consumption: 1540,
    cost: 231000,
    efficiency: 85,
    carbonEmission: 646,
    peakUsage: 1800,
    averageUsage: 1200,
    trend: "안정",
    recordDate: new Date(),
    monthlyStats: Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}월`,
      electric: [1050, 980, 850, 780, 720, 910, 1250, 1420, 950, 880, 960, 1100][i],
      gas: [620, 580, 450, 320, 280, 240, 220, 230, 290, 380, 510, 650][i]
    }))
  };
}

export async function getMultipleWeatherData(locations: string[]): Promise<WeatherData[]> {
  return Promise.all(locations.map((location) => getWeatherData(location)));
}

export async function getMultipleEnergyData(facilities: string[]): Promise<EnergyData[]> {
  return Promise.all(facilities.map((facility) => getEnergyData(facility)));
}
