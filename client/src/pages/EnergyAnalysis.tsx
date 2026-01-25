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
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

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

  // tRPC를 통해 실제 데이터 페칭 (지역명을 facility로 사용)
  const { data: energyData, isLoading, error } = trpc.energy.fetch.useQuery({
    facility: region
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error || !energyData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h2 className="text-xl tech-text text-red-400 mb-4">에너지 데이터를 불러올 수 없습니다.</h2>
        <p className="text-muted-foreground mb-6">{error?.message || "서버 연결 오류"}</p>
        <button onClick={() => setLocation("/")} className="px-4 py-2 border border-primary/40 hover:bg-primary/10 transition-colors">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // 백엔드에서 내려온 12개월 통계 데이터 사용
  const monthlyEnergyData = energyData.monthlyStats || [];

  // 일일 사용량 데이터 구성 (API 데이터가 없으면 자동 생성)
  const dailyUsageData = [
    { time: "00:00", usage: Math.round(energyData.consumption * 0.1) },
    { time: "06:00", usage: Math.round(energyData.consumption * 0.15) },
    { time: "12:00", usage: Math.round(energyData.consumption * 0.25) },
    { time: "18:00", usage: Math.round(energyData.consumption * 0.3) },
    { time: "24:00", usage: Math.round(energyData.consumption * 0.2) },
  ];

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
            연간 에너지 사용 분석 (1월 - 12월)
          </h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyEnergyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#ffffff60"
                  tick={{ fill: "#ffffff80", fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  stroke="#ffffff60"
                  tick={{ fill: "#ffffff80", fontSize: 11 }}
                  label={{ value: '사용량 (Units)', angle: -90, position: 'insideLeft', fill: '#ffffff40', fontSize: 12, offset: -10 }}
                />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: "#0a1428", borderColor: "#ffffff20", borderRadius: "4px" }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-muted-foreground ml-1">{value === 'electric' ? '전력 (kWh)' : '가스 (MJ)'}</span>}
                />
                <Bar dataKey="electric" fill="#3b82f6" name="electric" radius={[2, 2, 0, 0]} barSize={20} />
                <Bar dataKey="gas" fill="#f59e0b" name="gas" radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
                <span className="text-xs text-muted-foreground">파란색: 전력 사용량 (kWh)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#f59e0b] rounded-full"></div>
                <span className="text-xs text-muted-foreground">주황색: 가스 사용량 (MJ)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground">총 전력 사용량</p>
            <p className="tech-text text-xl font-bold">
              {energyData.consumption} kWh
            </p>
            <Zap className="w-5 h-5 text-yellow-400/60 mt-2" />
          </Card>

          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground">평균 일일 사용</p>
            <p className="tech-text text-xl font-bold">
              {energyData.averageUsage ?? (energyData.consumption / 30).toFixed(1)} kWh
            </p>
            <Clock className="w-5 h-5 text-blue-400/60 mt-2" />
          </Card>

          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground">피크 시간</p>
            <p className="tech-text text-xl font-bold">
              {energyData.peakUsage ? "16:00" : "12:00"}
            </p>
            <Clock className="w-5 h-5 text-purple-400/60 mt-2" />
          </Card>

          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground">전월 대비</p>
            <p className="tech-text text-xl font-bold text-green-400">
              {energyData.trend?.includes("하강") ? "-5%" : "+2%"}
            </p>
            <TrendingDown className="w-5 h-5 text-green-400/60 mt-2" />
          </Card>
        </div>
      </div>
    </div>
  );
}
