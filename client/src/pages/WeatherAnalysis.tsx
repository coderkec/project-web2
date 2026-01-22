import { ArrowLeft, Cloud, Droplets, Wind, Eye, Gauge, Sun, CloudRain } from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

export default function WeatherAnalysis() {
  const [, setLocation] = useLocation();

  // 샘플 온도 추이 데이터
  const temperatureData = [
    { time: "00:00", temp: 8, feelsLike: 5 },
    { time: "04:00", temp: 6, feelsLike: 2 },
    { time: "08:00", temp: 10, feelsLike: 7 },
    { time: "12:00", temp: 15, feelsLike: 13 },
    { time: "16:00", temp: 18, feelsLike: 16 },
    { time: "20:00", temp: 14, feelsLike: 11 },
    { time: "24:00", temp: 10, feelsLike: 7 },
  ];

  // 샘플 습도 데이터
  const humidityData = [
    { time: "00:00", humidity: 75 },
    { time: "04:00", humidity: 82 },
    { time: "08:00", humidity: 68 },
    { time: "12:00", humidity: 65 },
    { time: "16:00", humidity: 58 },
    { time: "20:00", humidity: 70 },
    { time: "24:00", humidity: 78 },
  ];

  // 샘플 주간 예보
  const weeklyForecast = [
    { day: "월", high: 16, low: 8, condition: "맑음", icon: "☀️" },
    { day: "화", high: 14, low: 6, condition: "흐림", icon: "☁️" },
    { day: "수", high: 12, low: 5, condition: "비", icon: "🌧️" },
    { day: "목", high: 13, low: 6, condition: "흐림", icon: "☁️" },
    { day: "금", high: 17, low: 9, condition: "맑음", icon: "☀️" },
    { day: "토", high: 19, low: 11, condition: "맑음", icon: "☀️" },
    { day: "일", high: 18, low: 10, condition: "맑음", icon: "☀️" },
  ];

  // 현재 상세 정보
  const currentDetails = [
    { label: "온도", value: "15°C", icon: Cloud, color: "text-primary/60" },
    { label: "체감 온도", value: "13°C", icon: Cloud, color: "text-primary/60" },
    { label: "습도", value: "65%", icon: Droplets, color: "text-primary/60" },
    { label: "풍속", value: "12 km/h", icon: Wind, color: "text-primary/60" },
    { label: "시정", value: "10000 m", icon: Eye, color: "text-primary/60" },
    { label: "기압", value: "1013 hPa", icon: Gauge, color: "text-primary/60" },
    { label: "자외선", value: "5", icon: Sun, color: "text-primary/60" },
    { label: "강수량", value: "0 mm", icon: CloudRain, color: "text-primary/60" },
    { label: "미세먼지", value: "85 (나쁨)", icon: Wind, color: "text-red-400" },
    { label: "초미세먼지", value: "34 (나쁨)", icon: Wind, color: "text-orange-400" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="bg-card/50 border-b border-primary/20 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-primary/10 rounded-none transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="tech-text text-2xl">날씨 분석</h1>
            <p className="text-muted-foreground text-sm">서울, 대한민국</p>
          </div>
        </div>
      </div>

      {/* 미세먼지 경고 배너 */}
      <div className="px-6 pt-6">
        <Card className="blueprint-card p-4 bg-gradient-to-r from-red-900/40 to-background border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-red-500/20 p-2 rounded-full">
                <Wind className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-red-200">미세먼지 나쁨 주의</h3>
                <p className="text-sm text-muted-foreground">오늘은 마스크 착용이 권장됩니다.</p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-2xl font-bold text-red-400">85 µg/m³</div>
              <div className="text-xs text-muted-foreground">PM10 (현재)</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 p-6 space-y-6">
        {/* 현재 상세 정보 */}
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

        {/* 온도 추이 차트 */}
        <div>
          <h2 className="tech-text text-lg mb-4">온도 추이 (24시간)</h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <YAxis stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a1428",
                    border: "1px solid #ffffff30",
                    borderRadius: "0px",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#3b82f6"
                  name="온도"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="feelsLike"
                  stroke="#60a5fa"
                  name="체감온도"
                  strokeWidth={2}
                  dot={{ fill: "#60a5fa", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 습도 추이 차트 */}
        <div>
          <h2 className="tech-text text-lg mb-4">습도 추이 (24시간)</h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={humidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <YAxis stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a1428",
                    border: "1px solid #ffffff30",
                    borderRadius: "0px",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                />
                <Bar dataKey="humidity" fill="#06b6d4" name="습도 (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 주간 예보 */}
        <div>
          <h2 className="tech-text text-lg mb-4">7일 예보</h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weeklyForecast.map((day, idx) => (
              <Card key={idx} className="blueprint-card p-4 text-center">
                <p className="font-bold text-sm mb-2">{day.day}</p>
                <p className="text-2xl mb-2">{day.icon}</p>
                <p className="text-xs text-muted-foreground mb-2">{day.condition}</p>
                <div className="flex justify-center gap-2 text-xs">
                  <span className="text-primary/80 font-bold">{day.high}°</span>
                  <span className="text-muted-foreground">{day.low}°</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="blueprint-card p-6">
            <h3 className="tech-text text-sm mb-3">오늘 통계</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">최고 온도</span>
                <span className="font-bold">18°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">최저 온도</span>
                <span className="font-bold">6°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">평균 습도</span>
                <span className="font-bold">70%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">강수 확률</span>
                <span className="font-bold">10%</span>
              </div>
            </div>
          </Card>

          <Card className="blueprint-card p-6">
            <h3 className="tech-text text-sm mb-3">주간 통계</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">평균 온도</span>
                <span className="font-bold">15°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">최고 온도</span>
                <span className="font-bold">19°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">최저 온도</span>
                <span className="font-bold">5°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">맑은 날</span>
                <span className="font-bold">4일</span>
              </div>
            </div>
          </Card>

          <Card className="blueprint-card p-6">
            <h3 className="tech-text text-sm mb-3">예보 정보</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">현재 상태</span>
                <span className="font-bold">맑음</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">풍향</span>
                <span className="font-bold">북동풍</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">자외선 지수</span>
                <span className="font-bold">5 (중간)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">체감 온도</span>
                <span className="font-bold">13°C</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
