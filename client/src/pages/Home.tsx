import { useAuth } from "@/_core/hooks/useAuth";
import { Cloud, Zap, Calendar, Wind } from "lucide-react";
import { useLocation } from "wouter";
import { WeatherCard } from "@/components/WeatherCard";
import { EnergyCard } from "@/components/EnergyCard";
import { DashboardStats } from "@/components/DashboardStats";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Handle OAuth token from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      console.log('[Home] Received OAuth token from URL, storing as cookie');
      // Store token as cookie with correct name
      document.cookie = `app_session_id=${token}; path=/; max-age=31536000; SameSite=Lax`;
      // Remove token from URL
      window.history.replaceState({}, '', '/');
      // Force reload to pick up the new cookie
      window.location.reload();
    }
  }, []);

  const today = new Date();
  const dateString = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });

  // 날씨 & 에너지 중심 통계 데이터
  const stats = [
    {
      label: "현재 기온",
      value: "22",
      unit: "°C",
      trend: "up" as const,
      trendValue: 2, // 어제보다 2도 높음
      icon: <Cloud className="w-5 h-5" />,
      color: "primary" as const,
    },
    {
      label: "대기질 (미세먼지)",
      value: "좋음",
      unit: "PM2.5",
      trend: "stable" as const,
      icon: <Wind className="w-5 h-5" />,
      color: "success" as const,
    },
    {
      label: "전국 일일 전력 사용",
      value: "450",
      unit: "kWh",
      trend: "down" as const,
      trendValue: 5,
      icon: <Zap className="w-5 h-5" />,
      color: "warning" as const,
    },
    {
      label: "전력 피크 시간",
      value: "14:00 - 15:00",
      unit: "",
      trend: "up" as const,
      trendValue: 0,
      icon: <Calendar className="w-5 h-5" />,
      color: "accent" as const,
    },
  ];

  if (loading) {
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
      {/* 1. 사이드바 추가 */}
      <Sidebar />

      {/* 2. 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 헤더 */}
        <header className="bg-card/30 backdrop-blur-sm border-b border-primary/10 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="tech-text text-2xl font-semibold">안녕하세요, {user?.name}님 👋</h2>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {dateString}
            </p>
          </div>

          {/* 시계 등 유틸리티 버튼은 Sidebar 하단 설정이나 별도 컴포넌트로 이동 가능, 여기선 깔끔하게 유지 */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-primary/5 rounded-full border border-primary/10 text-xs text-primary font-mono">
              System Status: Online
            </div>
          </div>
        </header>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* 상단 통계 위젯 */}
            <section>
              <h3 className="tech-text text-lg mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                오늘의 주요 지표
              </h3>
              <DashboardStats stats={stats} />
            </section>

            {/* 메인 대시보드 그리드 */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 날씨 카드 */}
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="tech-text text-lg">날씨 모니터링</h3>
                  <button onClick={() => setLocation("/analysis/weather")} className="text-xs text-primary hover:underline">
                    상세보기 &rarr;
                  </button>
                </div>
                <div onClick={() => setLocation("/analysis/weather")} className="cursor-pointer hover:opacity-95 transition-all flex-1">
                  <WeatherCard />
                </div>
              </div>

              {/* 에너지 카드 */}
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="tech-text text-lg">에너지 관리</h3>
                  <button onClick={() => setLocation("/analysis/energy")} className="text-xs text-primary hover:underline">
                    상세보기 &rarr;
                  </button>
                </div>
                <div onClick={() => setLocation("/analysis/energy")} className="cursor-pointer hover:opacity-95 transition-all flex-1">
                  <EnergyCard />
                </div>
              </div>
            </section>

            {/* 하단 여백 및 정보 */}
            <footer className="pt-8 text-center text-xs text-muted-foreground/40 pb-8">
              Integrated Dashboard System v2.0 • Data refreshed automatically
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
