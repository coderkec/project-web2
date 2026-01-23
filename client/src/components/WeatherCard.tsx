import { Cloud, CloudRain, Sun, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  airQuality?: string;
  yesterdayTemp?: number;
  tomorrowTemp?: number;
}

interface WeatherCardProps {
  data?: WeatherData;
  isLoading?: boolean;
  isError?: boolean;
}

export function WeatherCard({ data, isLoading, isError }: WeatherCardProps) {
  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("rain") || lower.includes("비")) {
      return <CloudRain className="w-12 h-12" />;
    }
    if (lower.includes("cloud") || lower.includes("흐림")) {
      return <Cloud className="w-12 h-12" />;
    }
    return <Sun className="w-12 h-12" />;
  };

  const today = new Date();
  const dateString = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  /* ===============================
     로딩 상태
  =============================== */
  if (isLoading) {
    return (
      <Card className="blueprint-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary/20 w-1/3"></div>
          <div className="h-8 bg-primary/20 w-1/2"></div>
        </div>
      </Card>
    );
  }

  /* ===============================
     에러 상태
  =============================== */
  if (isError || !data) {
    return (
      <Card className="blueprint-card p-6 flex items-center justify-center text-sm text-red-500">
        날씨 데이터를 불러올 수 없습니다.
      </Card>
    );
  }

  /* ===============================
     정상 데이터
  =============================== */
  const tempDiff =
    data.temperature - (data.yesterdayTemp ?? data.temperature);

  const diffText =
    tempDiff > 0
      ? `어제보다 ${tempDiff}°C 높아요`
      : tempDiff < 0
        ? `어제보다 ${Math.abs(tempDiff)}°C 낮아요`
        : "어제와 비슷해요";

  return (
    <Card className="blueprint-card p-6 hover:border-primary/50 transition-colors cursor-pointer group h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="tech-text text-xl font-bold mb-1">오늘의 날씨</h3>
          <p className="text-sm text-primary/80 font-mono">{dateString}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
          {getWeatherIcon(data.condition)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tech-text">
              {data.temperature}
            </span>
            <span className="text-lg text-muted-foreground">°C</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {data.condition}
          </p>
        </div>

        <div className="flex flex-col justify-center space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">습도</span>
            <span className="font-mono font-bold">{data.humidity}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">미세먼지</span>
            <span className="font-bold text-green-400">
              {data.airQuality ?? "보통"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">풍속</span>
            <span className="font-mono font-bold">
              {data.windSpeed} m/s
            </span>
          </div>
        </div>
      </div>

      {/* 비교 섹션 */}
      <div className="pt-4 border-t border-primary/20">
        <p className="text-sm font-medium mb-3 text-center bg-primary/5 py-1 rounded">
          {diffText}
        </p>
        <div className="grid grid-cols-3 text-center text-xs divide-x divide-primary/10">
          <div className="px-2">
            <p className="text-muted-foreground mb-1">어제</p>
            <p className="font-bold">{data.yesterdayTemp ?? "-"}</p>
          </div>
          <div className="px-2">
            <p className="text-primary font-bold mb-1">오늘</p>
            <p className="font-bold">{data.temperature}°</p>
          </div>
          <div className="px-2">
            <p className="text-muted-foreground mb-1">내일</p>
            <p className="font-bold">{data.tomorrowTemp ?? "-"}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
