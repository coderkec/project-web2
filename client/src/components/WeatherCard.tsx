import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike?: number;
  visibility?: number;
  pressure?: number;
  uvIndex?: number;
  precipitation?: number;
}

interface WeatherCardProps {
  data?: WeatherData;
  isLoading?: boolean;
}

export function WeatherCard({ data, isLoading }: WeatherCardProps) {
  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("rain") || lower.includes("비")) return <CloudRain className="w-12 h-12" />;
    if (lower.includes("cloud") || lower.includes("흐림")) return <Cloud className="w-12 h-12" />;
    return <Sun className="w-12 h-12" />;
  };

  if (isLoading) {
    return (
      <Card className="blueprint-card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-primary/20 rounded-none w-1/2"></div>
          <div className="h-16 bg-primary/20 rounded-none"></div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="blueprint-card">
        <div className="text-center py-8">
          <p className="text-muted-foreground">날씨 데이터를 불러오는 중입니다...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="blueprint-card">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between border-b border-primary/20 pb-4">
          <div>
            <h3 className="tech-text text-2xl mb-2">{data.location}</h3>
            <p className="text-muted-foreground text-sm">실시간 날씨 정보</p>
          </div>
          <div className="text-primary/60">{getWeatherIcon(data.condition)}</div>
        </div>

        {/* 주요 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-none">
            <p className="text-xs text-muted-foreground mb-2 font-mono">온도</p>
            <p className="tech-text text-3xl">{data.temperature}°C</p>
            {data.feelsLike && (
              <p className="text-xs text-muted-foreground mt-2">체감: {data.feelsLike}°C</p>
            )}
          </div>
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-none">
            <p className="text-xs text-muted-foreground mb-2 font-mono">상태</p>
            <p className="tech-text text-lg">{data.condition}</p>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
            <Droplets className="w-4 h-4 text-primary/60" />
            <div>
              <p className="text-xs text-muted-foreground">습도</p>
              <p className="font-mono text-sm font-bold">{data.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
            <Wind className="w-4 h-4 text-primary/60" />
            <div>
              <p className="text-xs text-muted-foreground">풍속</p>
              <p className="font-mono text-sm font-bold">{data.windSpeed} km/h</p>
            </div>
          </div>

          {data.visibility && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Eye className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">시정</p>
                <p className="font-mono text-sm font-bold">{data.visibility} m</p>
              </div>
            </div>
          )}

          {data.pressure && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Gauge className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">기압</p>
                <p className="font-mono text-sm font-bold">{data.pressure} hPa</p>
              </div>
            </div>
          )}

          {data.uvIndex !== undefined && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Sun className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">자외선</p>
                <p className="font-mono text-sm font-bold">{data.uvIndex}</p>
              </div>
            </div>
          )}

          {data.precipitation !== undefined && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <CloudRain className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">강수량</p>
                <p className="font-mono text-sm font-bold">{data.precipitation} mm</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
