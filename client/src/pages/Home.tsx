import { useAuth } from "@/_core/hooks/useAuth";
import { Cloud, Zap, Calendar, Wind } from "lucide-react";
import { WeatherCard } from "@/components/WeatherCard";
import { EnergyCard } from "@/components/EnergyCard";
import { DashboardStats } from "@/components/DashboardStats";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { fetchUltraWeather } from "@/services/weatherApi";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // 통합 데이터 호출 (tRPC)
  const { data: homeData, isLoading: dataLoading } =
    trpc.dashboard.getHomeData.useQuery(
      { location: "서울" },
      { enabled: !!user }
    );

  const weather = homeData?.weather;
  const energy = homeData?.energy;

  const today = new Date();
  const dateString = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const stats = [
    {
      label: "현재 기온",
      value: weather?.temperature !== undefined ? Math.round(weather.temperature).toString() : "-",
      unit: "°C",
      trend: "up" as const,
      icon: <Cloud className="w-5 h-5" />,
      color: "primary" as const,
    },
    {
      label: "습도",
      value: weather?.humidity !== undefined ? Math.round(weather.humidity).toString() : "-",
      unit: "%",
      trend: "stable" as const,
      icon: <Wind className="w-5 h-5" />,
      color: "success" as const,
    },
    {
      label: "실시간 전력 사용",
      value: energy?.consumption !== undefined ? Math.round(energy.consumption).toString() : "-",
      unit: "kWh",
      trend: "down" as const,
      icon: <Zap className="w-5 h-5" />,
      color: "warning" as const,
    },
    {
      label: "에너지 효율",
      value: energy?.efficiency !== undefined ? Math.round(energy.efficiency).toString() : "-",
      unit: "%",
      trend: "up" as const,
      icon: <Calendar className="w-5 h-5" />,
      color: "accent" as const,
    },
  ];

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-card/30 backdrop-blur-sm border-b border-primary/10 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="tech-text text-2xl font-semibold">
              안녕하세요, {user?.name}님 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {dateString}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <section>
              <h3 className="tech-text text-lg mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                오늘의 주요 지표
              </h3>
              <DashboardStats stats={stats} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 날씨 모니터링 카드 (클릭 시 이동) */}
              <div
                className="space-y-4 h-full flex flex-col cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => setLocation("/analysis/weather")}
              >
                <h3 className="tech-text text-lg">날씨 모니터링</h3>
                <WeatherCard data={weather} isLoading={dataLoading} />
              </div>

              {/* 에너지 관리 카드 (클릭 시 이동) */}
              <div
                className="space-y-4 h-full flex flex-col cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => setLocation("/analysis/energy")}
              >
                <h3 className="tech-text text-lg">에너지 관리</h3>
                <EnergyCard data={energy} isLoading={dataLoading} />
              </div>
            </section>

            <footer className="pt-8 text-center text-xs text-muted-foreground/40 pb-8">
              Integrated Dashboard System v2.0 • Data refreshed automatically
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
