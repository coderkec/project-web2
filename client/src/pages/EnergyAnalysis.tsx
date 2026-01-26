import { ArrowLeft, Zap, Clock, TrendingDown, DollarSign, Leaf, Activity, BarChart3, Radio } from "lucide-react";
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

/* =========================
   컴포넌트
 ========================= */
export default function EnergyAnalysis() {
  const [, setLocation] = useLocation();
  const [region, setRegion] = useState<Region>("서울");

  // 차트 렌더링 버그 수정 (ResponsiveContainer 초기 높이 0 문제 해결)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // 부모의 height 계산이 완료된 시점에 강제로 resize 이벤트를 발생시켜 차트를 그리라고 지시함
    requestAnimationFrame(() => {
      setIsMounted(true);
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 50);
    });
  }, []);

  // 개별 카드 토글 상태
  const [toggledCards, setToggledCards] = useState<Record<number, boolean>>({});

  const toggleCard = (idx: number) => {
    setToggledCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

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

  const monthlyEnergyData = energyData.monthlyStats || [];
  const regionMultiplier: Record<string, number> = {
    "서울": 1.0, "부산": 0.85, "대구": 0.78, "인천": 0.92, "광주": 0.72,
    "대전": 0.75, "울산": 1.1, "경기": 1.25, "강원": 0.65, "충청": 0.8,
    "전라": 0.7, "경상": 0.95, "제주": 0.6
  };
  const mult = regionMultiplier[region] || 1.0;

  const adjustedConsumption = Math.round(energyData.consumption * mult);
  const adjustedAvg = Number(((energyData.averageUsage || energyData.consumption / 30) * mult).toFixed(1));

  const dailyUsageData = [
    { time: "00:00", usage: Math.round(adjustedConsumption * 0.1) },
    { time: "06:00", usage: Math.round(adjustedConsumption * 0.15) },
    { time: "12:00", usage: Math.round(adjustedConsumption * 0.25) },
    { time: "18:00", usage: Math.round(adjustedConsumption * 0.3) },
    { time: "24:00", usage: Math.round(adjustedConsumption * 0.2) },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="bg-card/50 border-b border-primary/20 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="tech-text text-2xl">에너지 분석</h1>
              {energyData.isRealData ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full border border-green-500/30 animate-pulse">
                  <Radio className="w-3 h-3" /> LIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold rounded-full border border-white/5">
                  SIMULATED
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">전국 지역 전력 · 가스 사용 현황</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <Card className="blueprint-card p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-muted-foreground">지역 선택</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="bg-background border border-primary/30 px-3 py-1 text-sm outline-none focus:border-primary rounded"
            >
              {["서울", "부산", "경기", "강원", "대구", "인천", "광주", "대전", "울산", "충청", "전라", "경상", "제주"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="ml-auto text-xs text-muted-foreground">📍 현재 분석 지역: <b className="text-primary">{region}</b></div>
          </div>
        </Card>

        {/* 시간별 전력 사용량 */}
        <div>
          <h2 className="tech-text text-lg mb-4">시간대별 전력 사용량</h2>
          <Card className="blueprint-card p-6 min-h-[350px]">
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyUsageData}>
                    <defs>
                      <linearGradient id="dailyUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis
                      dataKey="time"
                      stroke="#ffffff80"
                      tick={{ fill: "#ffffffcc", fontSize: 12, fontWeight: "bold" }}
                      interval={0}
                      dy={5}
                      height={40}
                    />
                    <YAxis stroke="#ffffff80" tick={{ fill: "#ffffffaa", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0a1428", borderColor: "#ffffff20" }} itemStyle={{ color: "#3b82f6" }} />
                    <Area type="monotone" dataKey="usage" stroke="#3b82f6" fill="url(#dailyUsage)" name="전력 사용량 (kWh)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* 월별 전력 / 가스 */}
        <div>
          <h2 className="tech-text text-lg mb-4">연간 에너지 사용 분석 (1월 - 12월)</h2>
          <Card className="blueprint-card p-6 min-h-[400px]">
            <div className="h-[350px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyEnergyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#ffffff80"
                      tick={{ fill: "white", fontSize: 13, fontWeight: 900 }}
                      interval={0}
                      dy={10}
                      height={50}
                    />
                    <YAxis stroke="#ffffff60" tick={{ fill: "#ffffff80", fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: "#0a1428", borderColor: "#ffffff20", borderRadius: "4px" }} itemStyle={{ fontSize: '12px' }} />
                    <Legend verticalAlign="top" align="right" height={36} iconType="circle" formatter={(value) => <span className="text-xs text-muted-foreground ml-1">{value === 'electric' ? '전력 (kWh)' : '가스 (MJ)'}</span>} />
                    <Bar dataKey="electric" fill="#3b82f6" name="electric" radius={[2, 2, 0, 0]} barSize={20} />
                    <Bar dataKey="gas" fill="#f59e0b" name="gas" radius={[2, 2, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "총 전력 사용량", flipLabel: "예상 누적 비용", unit: "kWh", flipUnit: "KRW", icon: Zap, flipIcon: DollarSign, color: "text-yellow-400", flipColor: "text-green-400", value: adjustedConsumption, flipValue: (adjustedConsumption * 185).toLocaleString() },
            { label: "평균 일일 사용", flipLabel: "월간 예상 총량", unit: "kWh", flipUnit: "kWh", icon: Clock, flipIcon: BarChart3, color: "text-blue-400", flipColor: "text-indigo-400", value: adjustedAvg, flipValue: Math.round(adjustedAvg * 30).toLocaleString() },
            { label: "피크 시간대", flipLabel: "에너지 효율 점수", icon: Clock, flipIcon: Activity, color: "text-purple-400", flipColor: "text-pink-400", value: (energyData.peakUsage ? "16:00" : "12:00"), flipValue: (88 * mult).toFixed(0) + " pts" },
            { label: "전월 대비 변동", flipLabel: "탄소 배출량 (CO₂)", icon: TrendingDown, flipIcon: Leaf, color: "text-green-400", flipColor: "text-emerald-400", value: (mult > 1 ? "+5%" : "-2%"), flipValue: (adjustedConsumption * 0.424).toFixed(1) + " kg" }
          ].map((item, idx) => {
            const isToggled = toggledCards[idx];
            const Icon = isToggled ? item.flipIcon : item.icon;
            return (
              <Card
                key={idx}
                onClick={() => toggleCard(idx)}
                className="blueprint-card p-4 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer relative overflow-hidden group select-none"
              >
                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {isToggled ? item.flipLabel : item.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <p className={`tech-text text-xl font-bold ${isToggled ? item.flipColor : item.color}`}>
                      {isToggled ? item.flipValue : item.value}
                    </p>
                    {(!isToggled && item.unit) && <span className="text-[10px] text-muted-foreground">{item.unit}</span>}
                  </div>
                  <Icon className={`w-5 h-5 mt-2 opacity-60 ${isToggled ? item.flipColor : item.color}`} />
                </div>
                <div className="absolute bottom-1 right-2 text-[8px] text-muted-foreground/30 italic group-hover:text-primary transition-colors">Tap to flip</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
