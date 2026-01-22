import { ArrowLeft, Zap, Clock, TrendingDown } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* =========================
   타입 정의
========================= */
type Region =
  | "서울"
  | "부산"
  | "대구"
  | "인천"
  | "광주"
  | "대전"
  | "울산"
  | "경기"
  | "강원"
  | "충청"
  | "전라"
  | "경상"
  | "제주";

type EnergyApiResponse = {
  summary: {
    totalUsage: number;
    avgDailyUsage: number;
    peakHour: number;
    momChange: number;
  };
  dailyUsage: {
    hour: number;
    usage: number;
  }[];
  monthlyUsage: {
    month: number;
    electric: number;
    gas: number;
  }[];
};

/* =========================
   BASE 데이터 (1~12월)
========================= */
const BASE_ENERGY_DATA: EnergyApiResponse = {
  summary: {
    totalUsage: 1250,
    avgDailyUsage: 40.3,
    peakHour: 16,
    momChange: -10,
  },
  dailyUsage: [
    { hour: 0, usage: 45 },
    { hour: 6, usage: 60 },
    { hour: 12, usage: 95 },
    { hour: 18, usage: 110 },
    { hour: 24, usage: 55 },
  ],
  monthlyUsage: [
    { month: 1, electric: 980, gas: 520 },
    { month: 2, electric: 920, gas: 480 },
    { month: 3, electric: 850, gas: 420 },
    { month: 4, electric: 780, gas: 360 },
    { month: 5, electric: 720, gas: 300 },
    { month: 6, electric: 740, gas: 260 },
    { month: 7, electric: 820, gas: 240 },
    { month: 8, electric: 880, gas: 260 },
    { month: 9, electric: 850, gas: 300 },
    { month: 10, electric: 900, gas: 360 },
    { month: 11, electric: 940, gas: 420 },
    { month: 12, electric: 1000, gas: 520 },
  ],
};

/* =========================
   지역별 더미 생성기
========================= */
function makeRegionData(multiplier: number): EnergyApiResponse {
  return {
    summary: {
      totalUsage: Math.round(BASE_ENERGY_DATA.summary.totalUsage * multiplier),
      avgDailyUsage: Number(
        (BASE_ENERGY_DATA.summary.avgDailyUsage * multiplier).toFixed(1)
      ),
      peakHour: BASE_ENERGY_DATA.summary.peakHour,
      momChange: Number(
        (BASE_ENERGY_DATA.summary.momChange * multiplier).toFixed(1)
      ),
    },
    dailyUsage: BASE_ENERGY_DATA.dailyUsage.map((d) => ({
      hour: d.hour,
      usage: Math.round(d.usage * multiplier),
    })),
    monthlyUsage: BASE_ENERGY_DATA.monthlyUsage.map((m) => ({
      month: m.month,
      electric: Math.round(m.electric * multiplier),
      gas: Math.round(m.gas * multiplier),
    })),
  };
}

/* =========================
   전 지역 MOCK 데이터
========================= */
const MOCK_ENERGY_DATA: Record<Region, EnergyApiResponse> = {
  서울: makeRegionData(1.0),
  부산: makeRegionData(0.8),
  대구: makeRegionData(0.75),
  인천: makeRegionData(0.9),
  광주: makeRegionData(0.7),
  대전: makeRegionData(0.72),
  울산: makeRegionData(0.85),
  경기: makeRegionData(1.3),
  강원: makeRegionData(0.6),
  충청: makeRegionData(0.78),
  전라: makeRegionData(0.74),
  경상: makeRegionData(0.95),
  제주: makeRegionData(0.65),
};

/* =========================
   컴포넌트
========================= */
export default function EnergyAnalysis() {
  const [, setLocation] = useLocation();

  const [region, setRegion] = useState<Region>("서울");
  const [energyData, setEnergyData] = useState<EnergyApiResponse>(
    MOCK_ENERGY_DATA["서울"]
  );

  useEffect(() => {
    setEnergyData(MOCK_ENERGY_DATA[region]);
  }, [region]);

  const dailyUsageData = energyData.dailyUsage.map((d) => ({
    time: `${d.hour}:00`,
    usage: d.usage,
  }));

  const monthlyEnergyData = energyData.monthlyUsage.map((m) => ({
    month: `${m.month}월`,
    electric: m.electric,
    gas: m.gas,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="bg-card/50 border-b border-primary/20 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="tech-text text-2xl">에너지 분석</h1>
            <p className="text-muted-foreground text-sm">
              전국 지역 전력 · 가스 사용 현황
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* 지역 선택 */}
        <Card className="blueprint-card p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-muted-foreground">지역 선택</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="bg-background border border-primary/30 px-3 py-1 text-sm"
            >
              {Object.keys(MOCK_ENERGY_DATA).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="ml-auto text-xs text-muted-foreground">
              📍 현재 분석 지역: <b>{region}</b>
            </div>
          </div>
        </Card>

        {/* 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground">총 전력 사용량</p>
            <p className="tech-text text-xl font-bold">
              {energyData.summary.totalUsage} kWh
            </p>
            <Zap className="w-5 h-5 text-yellow-400/60 mt-2" />
          </Card>

          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground">평균 일일 사용</p>
            <p className="tech-text text-xl font-bold">
              {energyData.summary.avgDailyUsage} kWh
            </p>
            <Clock className="w-5 h-5 text-blue-400/60 mt-2" />
          </Card>

          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground">피크 시간</p>
            <p className="tech-text text-xl font-bold">
              {energyData.summary.peakHour}:00
            </p>
            <Clock className="w-5 h-5 text-purple-400/60 mt-2" />
          </Card>

          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground">전월 대비</p>
            <p className="tech-text text-xl font-bold text-green-400">
              {energyData.summary.momChange}%
            </p>
            <TrendingDown className="w-5 h-5 text-green-400/60 mt-2" />
          </Card>
        </div>

        {/* 시간별(일일) 전력 사용량 */}
        <div>
          <h2 className="tech-text text-lg mb-4">
            시간대별 전력 사용량
          </h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyUsageData}>
                <defs>
                  <linearGradient id="dailyUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#3b82f6"
                  fill="url(#dailyUsage)"
                  name="전력 사용량 (kWh)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>


        {/* 월별 전력 / 가스 */}
        <div>
          <h2 className="tech-text text-lg mb-4">
            월별 전력 및 가스 사용량 추이
          </h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyEnergyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis
                  dataKey="month"
                  stroke="#ffffff60"
                  tick={{ fill: "#ffffff", fontSize: 13, fontWeight: 500 }}
                  height={60}
                  angle={0}
                  textAnchor="middle"
                />
                <YAxis stroke="#ffffff60" tick={{ fill: "#ffffff80", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1e24", borderColor: "#ffffff20", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="electric" fill="#3b82f6" name="전력 (kWh)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gas" fill="#f59e0b" name="가스 (MJ)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
