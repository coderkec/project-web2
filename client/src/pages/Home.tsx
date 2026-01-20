import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Cloud, Package, Zap, History, Settings, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { WeatherCard } from "@/components/WeatherCard";
import { LogisticsCard } from "@/components/LogisticsCard";
import { EnergyCard } from "@/components/EnergyCard";
import { DashboardStats } from "@/components/DashboardStats";
import { AlertsPanel, type Alert } from "@/components/AlertsPanel";
import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { logout } from "@/auth";


export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // 샘플 통계 데이터
  const stats = [
    {
      label: "평균 온도",
      value: "15",
      unit: "°C",
      trend: "down" as const,
      trendValue: 2.5,
      icon: <Cloud className="w-5 h-5" />,
      color: "primary" as const,
    },
    {
      label: "배송 진행 중",
      value: "3",
      unit: "건",
      trend: "up" as const,
      trendValue: 15,
      icon: <Package className="w-5 h-5" />,
      color: "accent" as const,
    },
    {
      label: "에너지 효율",
      value: "78",
      unit: "%",
      trend: "up" as const,
      trendValue: 5,
      icon: <Zap className="w-5 h-5" />,
      color: "warning" as const,
    },
    {
      label: "오늘 기록",
      value: "12",
      unit: "건",
      trend: "stable" as const,
      icon: <History className="w-5 h-5" />,
      color: "success" as const,
    },
  ];

  // 샘플 알림 데이터
  useEffect(() => {
    setAlerts([
      {
        id: "alert-1",
        type: "warning",
        title: "배송 지연",
        message: "CJ123456789 배송이 예정시간보다 2시간 지연되었습니다.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        actionLabel: "추적하기",
        onAction: () => setLocation("/history"),
      },
      {
        id: "alert-2",
        type: "info",
        title: "에너지 사용량 증가",
        message: "본사 빌딩의 에너지 사용량이 어제 대비 12% 증가했습니다.",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
    ]);
  }, [setLocation]);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="bg-card/50 border-b border-primary/20 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="tech-text text-2xl">통합 서비스 대시보드</h1>
            <p className="text-muted-foreground text-xs mt-1">
              {user?.name} • {new Date().toLocaleDateString("ko-KR")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/history")}
              className="p-2 hover:bg-primary/10 rounded-none transition-colors"
              title="히스토리"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              className="p-2 hover:bg-primary/10 rounded-none transition-colors"
              title="설정"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                logout();
                setLocation("/login");
              }}
              className="p-2 hover:bg-red-400/10 rounded-none transition-colors text-red-400/60 hover:text-red-400"
              title="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-6">
        {/* 알림 */}
        <AlertsPanel alerts={alerts} onDismiss={(id) => setAlerts(alerts.filter((a) => a.id !== id))} />

        {/* 통계 위젯 */}
        <DashboardStats stats={stats} />

        {/* 실시간 모니터링 섹션 */}
        <div className="mb-6">
          <h2 className="tech-text text-lg mb-4">실시간 모니터링</h2>
          <p className="text-muted-foreground text-xs mb-4">
            날씨, 물류, 에너지 데이터를 실시간으로 확인하세요
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <button onClick={() => setLocation("/analysis/weather")} className="text-left hover:opacity-90 transition-opacity">
              <WeatherCard />
            </button>
            <button onClick={() => setLocation("/analysis/logistics")} className="text-left hover:opacity-90 transition-opacity">
              <LogisticsCard />
            </button>
            <button onClick={() => setLocation("/analysis/energy")} className="text-left hover:opacity-90 transition-opacity">
              <EnergyCard />
            </button>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* 최근 활동 */}
          <div className="blueprint-card p-6">
            <h3 className="tech-text text-sm mb-4">최근 활동</h3>
            <div className="space-y-3">
              {[
                { time: "2시간 전", action: "서울 날씨 조회" },
                { time: "3시간 전", action: "CJ123456789 배송 추적" },
                { time: "5시간 전", action: "본사 빌딩 에너지 조회" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.action}</span>
                  <span className="text-muted-foreground/60 font-mono">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 빠른 작업 */}
          <div className="blueprint-card p-6">
            <h3 className="tech-text text-sm mb-4">빠른 작업</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-xs bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors rounded-none text-left font-bold">
                + 새 배송 추적
              </button>
              <button className="w-full px-4 py-2 text-xs bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors rounded-none text-left font-bold">
                + 날씨 정보 조회
              </button>
              <button className="w-full px-4 py-2 text-xs bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors rounded-none text-left font-bold">
                + 에너지 리포트
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
