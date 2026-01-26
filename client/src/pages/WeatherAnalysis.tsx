import { ArrowLeft, Cloud, Droplets, Wind, Eye, Gauge, Sun, CloudRain } from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function WeatherAnalysis() {
  const [, setLocation] = useLocation();
  const locationName = "서울"; // 기본값

  const { data: weather, isLoading, error } = trpc.weather.fetch.useQuery({
    location: locationName
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h2 className="text-xl tech-text text-red-400 mb-4">날씨 데이터를 불러올 수 없습니다.</h2>
        <p className="text-muted-foreground mb-6">{error?.message || "서버 연결 오류"}</p>
        <button
          onClick={() => setLocation("/")}
          className="px-4 py-2 border border-primary/40 hover:bg-primary/10 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const temperatureData = weather.hourlyData || [];
  const humidityData = weather.hourlyData || [];
  const weeklyForecast = weather.weeklyForecast || [];

  const currentDetails = [
    { label: "온도", value: `${weather.temperature ? Math.round(weather.temperature) : 0}°C`, icon: Cloud, color: "text-primary/60" },
    { label: "체감 온도", value: `${weather.feelsLike ? Math.round(weather.feelsLike) : Math.round(weather.temperature)}°C`, icon: Cloud, color: "text-primary/60" },
    { label: "습도", value: `${weather.humidity}%`, icon: Droplets, color: "text-primary/60" },
    { label: "풍속", value: `${weather.windSpeed} km/h`, icon: Wind, color: "text-primary/60" },
    { label: "시정", value: `${weather.visibility ?? 15000} m`, icon: Eye, color: "text-primary/60" },
    { label: "기압", value: `${weather.pressure ?? 1020} hPa`, icon: Gauge, color: "text-primary/60" },
    { label: "자외선", value: `${weather.uvIndex ?? 2}`, icon: Sun, color: "text-primary/60" },
    { label: "강수량", value: `${weather.precipitation ?? 0} mm`, icon: CloudRain, color: "text-primary/60" },
    { label: "상태", value: weather.condition, icon: Wind, color: "text-primary/60" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card/50 border-b border-primary/20 px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setLocation("/")} className="p-2 hover:bg-primary/10 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
          <div>
            <h1 className="tech-text text-2xl">날씨 분석</h1>
            <p className="text-muted-foreground text-sm">{weather.location}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="tech-text text-lg mb-4">현재 상세 정보</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentDetails.map((detail, idx) => {
              const Icon = detail.icon;
              return (
                <Card key={idx} className="blueprint-card p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${detail.color}`} />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{detail.label}</p>
                      <p className="tech-text text-sm font-bold">{detail.value}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="tech-text text-lg mb-4">시간별 온도 변화 (24시간)</h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" style={{ fontSize: "10px" }} tick={{ fill: "#ffffff80" }} interval={2} />
                <YAxis stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0a1428", border: "1px solid #ffffff30" }} />
                <Legend />
                <Line type="monotone" dataKey="temp" stroke="#3b82f6" name="기온" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                <Line type="monotone" dataKey="feelsLike" stroke="#60a5fa" name="체감온도" strokeWidth={2} dot={{ fill: "#60a5fa", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div>
          <h2 className="tech-text text-lg mb-4">시간별 습도 변화 (24시간)</h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={humidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" style={{ fontSize: "10px" }} tick={{ fill: "#ffffffcc" }} interval={1} />
                <YAxis stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0a1428", border: "1px solid #ffffff30" }} />
                <Bar dataKey="humidity" fill="#06b6d4" name="습도 (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div>
          <h2 className="tech-text text-lg mb-4">7일 예보</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weeklyForecast.slice(0, 7).map((day, idx) => (
              <Card key={idx} className="blueprint-card p-4 text-center hover:border-primary/40 transition-colors">
                <p className="text-[10px] text-muted-foreground mb-1">{day.date}</p>
                <p className="font-bold text-sm mb-3 border-b border-primary/10 pb-2">{day.day}요일</p>
                <div className="py-2">
                  <span className="text-4xl block mb-2">{day.icon}</span>
                  <p className="text-xs text-muted-foreground font-medium">{day.condition}</p>
                </div>
                <div className="flex justify-center items-center gap-3 mt-3 pt-2 border-t border-primary/10">
                  <span className="text-primary font-bold">{Math.round(day.high)}°</span>
                  <span className="text-muted-foreground/60">{Math.round(day.low)}°</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="blueprint-card p-6">
            <h3 className="tech-text text-sm mb-3">오늘 통계</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">최고 온도</span><span className="font-bold">{Math.round(weeklyForecast[0]?.high ?? weather.temperature)}°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">최저 온도</span><span className="font-bold">{Math.round(weeklyForecast[0]?.low ?? weather.temperature - 5)}°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">현재 습도</span><span className="font-bold">{weather.humidity}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">강수량</span><span className="font-bold">{weather.precipitation ?? 0} mm</span></div>
            </div>
          </Card>

          <Card className="blueprint-card p-6">
            <h3 className="tech-text text-sm mb-3">주간 통계</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">평균 온도</span><span className="font-bold">{weeklyForecast.length > 0 ? (weeklyForecast.reduce((acc, curr) => acc + (curr.high + curr.low) / 2, 0) / weeklyForecast.length).toFixed(1) : Math.round(weather.temperature)}°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">주간 최고</span><span className="font-bold">{Math.round(Math.max(...weeklyForecast.map(d => d.high), weather.temperature))}°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">주간 최저</span><span className="font-bold">{Math.round(Math.min(...weeklyForecast.map(d => d.low), weather.temperature - 5))}°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">예보 기간</span><span className="font-bold">{weeklyForecast.length}일</span></div>
            </div>
          </Card>

          <Card className="blueprint-card p-6">
            <h3 className="tech-text text-sm mb-3">현재 상태 정보</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">날씨 상태</span><span className="font-bold">{weather.condition}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">풍속</span><span className="font-bold">{weather.windSpeed} m/s</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">자외선 지수</span><span className="font-bold">{weather.uvIndex ?? "정보없음"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">체감 온도</span><span className="font-bold">{Math.round(weather.feelsLike ?? weather.temperature)}°C</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
