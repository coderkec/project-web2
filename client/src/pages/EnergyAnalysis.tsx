import {
  ArrowLeft,
  Zap,
  Clock,
  Leaf,
  Activity,
  BarChart3,
  Info,
} from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useState, useMemo } from "react";
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

/* ===============================
   타입
=============================== */
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

export default function EnergyAnalysis() {
  const [, setLocation] = useLocation();
  const [region, setRegion] = useState<Region>("서울");

  const { data: energyData, isLoading, error } =
    trpc.energy.fetch.useQuery({
      facility: region,
    });

  /* ===============================
     지역 보정 계수
  =============================== */
  const regionMultiplier = useMemo(
    () => ({
      서울: 1.0,
      부산: 0.85,
      대구: 0.78,
      인천: 0.92,
      광주: 0.72,
      대전: 0.75,
      울산: 1.1,
      경기: 1.25,
      강원: 0.65,
      충청: 0.8,
      전라: 0.7,
      경상: 0.95,
      제주: 0.6,
    }),
    []
  );

  /* ===============================
     로딩 / 에러
  =============================== */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error || !energyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl tech-text text-red-500 mb-2">
            데이터 로드 실패
          </h2>
          <p className="text-muted-foreground mb-6">
            {error?.message || "서버 오류"}
          </p>
          <button
            onClick={() => setLocation("/")}
            className="px-6 py-2 bg-primary/10 border border-primary/20 rounded"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  /* ===============================
     🔥 숫자 안전 처리
  =============================== */
  const mult = regionMultiplier[region];
  const base = Number(energyData.consumption ?? 0);
  const adjusted = Math.round(base * mult);
  const safeAdjusted = adjusted || 0;

  /* ===============================
     시간대별 사용량 (가공)
  =============================== */
  const dailyUsageData = [
    { time: "00:00", usage: Math.round(safeAdjusted * 0.1) },
    { time: "06:00", usage: Math.round(safeAdjusted * 0.15) },
    { time: "12:00", usage: Math.round(safeAdjusted * 0.25) },
    { time: "18:00", usage: Math.round(safeAdjusted * 0.3) },
    { time: "24:00", usage: Math.round(safeAdjusted * 0.2) },
  ];

  /* ===============================
     🔥 연간 데이터 숫자 캐스팅
  =============================== */
  const monthlyData =
    energyData.monthlyStats?.map((m: any) => ({
      month: m.month,
      electric: Number(m.electric ?? 0),
      gas: Number(m.gas ?? 0),
    })) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card/50 border-b border-primary/20 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-primary/10 rounded"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="tech-text text-2xl">에너지 분석</h1>
            <p className="text-muted-foreground text-sm">
              전국 전력 소비 현황
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 space-y-6">
        {/* Region selector */}
        <Card className="blueprint-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="bg-background border border-primary/30 px-3 py-1.5 rounded"
            >
              {Object.keys(regionMultiplier).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Info className="w-4 h-4 text-primary" />
              Base({base}) × Ratio({mult}) =
              <span className="text-primary ml-1">
                {safeAdjusted} kWh
              </span>
            </div>
          </div>
        </Card>

        {/* ===============================
            시간대별 전력 사용량 (🔴 색상 수정)
        =============================== */}
        <Card className="blueprint-card p-6 overflow-x-auto overflow-y-visible">
          <h2 className="tech-text text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            시간대별 전력 사용량
          </h2>

          <div className="h-[330px] w-full min-w-[600px] overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyUsageData}>
                <defs>
                  <linearGradient
                    id="usageGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                <XAxis
                  dataKey="time"
                  tick={{ fill: "#0f172a", fontSize: 11, fontWeight: 700 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: "#0f172a", fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    border: "1px solid #cbd5f5",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#3b82f6"
                  fill="url(#usageGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ===============================
            연간 에너지 소비 (🔴 색상 수정)
        =============================== */}
        <Card className="blueprint-card p-6 overflow-x-auto overflow-y-visible">
          <h2 className="tech-text text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            연간 에너지 소비
          </h2>

          <div className="h-[380px] w-full min-w-[600px] overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                <XAxis
                  dataKey="month"
                  interval={0}
                  tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 800 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: "#0f172a", fontSize: 11 }}
                  stroke="#94a3b8"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    border: "1px solid #cbd5f5",
                  }}
                />
                <Legend />

                <Bar
                  dataKey="electric"
                  fill="#3b82f6"
                  name="전력 (kWh)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="gas"
                  fill="#f59e0b"
                  name="가스 (MJ)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="blueprint-card p-5">
            <Zap className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-xs text-muted-foreground">총 사용량</p>
            <p className="tech-text text-xl">
              {safeAdjusted || "--"} kWh
            </p>
          </Card>

          <Card className="blueprint-card p-5">
            <Clock className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-xs text-muted-foreground">일 평균</p>
            <p className="tech-text text-xl">
              {safeAdjusted ? (safeAdjusted / 30).toFixed(1) : "--"} kWh
            </p>
          </Card>

          <Card className="blueprint-card p-5">
            <Leaf className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-xs text-muted-foreground">효율 지수</p>
            <p className="tech-text text-xl">
              {safeAdjusted ? Math.round(88 * mult) : "--"} pts
            </p>
          </Card>

          <Card className="blueprint-card p-5">
            <Activity className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-xs text-muted-foreground">탄소 배출</p>
            <p className="tech-text text-xl">
              {safeAdjusted
                ? (safeAdjusted * 0.424).toFixed(1)
                : "--"}{" "}
              kg
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}