import { Zap, TrendingUp, TrendingDown, Leaf, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EnergyData {
  facility: string;
  energyType: string;
  consumption: number;
  cost: number;
  efficiency?: number;
  carbonEmission?: number;
  peakUsage?: number;
  averageUsage?: number;
  trend?: string;
}

interface EnergyCardProps {
  data?: EnergyData;
  isLoading?: boolean;
}

const getTrendIcon = (trend?: string) => {
  if (!trend) return null;
  const lower = trend.toLowerCase();
  if (lower.includes("상승") || lower.includes("up")) return <TrendingUp className="w-5 h-5 text-red-400" />;
  if (lower.includes("하강") || lower.includes("down")) return <TrendingDown className="w-5 h-5 text-green-400" />;
  return <Gauge className="w-5 h-5 text-yellow-400" />;
};

const getTrendColor = (trend?: string) => {
  if (!trend) return "text-muted-foreground";
  const lower = trend.toLowerCase();
  if (lower.includes("상승") || lower.includes("up")) return "text-red-400";
  if (lower.includes("하강") || lower.includes("down")) return "text-green-400";
  return "text-yellow-400";
};

export function EnergyCard({ data, isLoading }: EnergyCardProps) {
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
          <p className="text-muted-foreground">에너지 데이터를 불러오는 중입니다...</p>
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
            <h3 className="tech-text text-2xl mb-2">{data.facility}</h3>
            <p className="text-muted-foreground text-sm">{data.energyType} 에너지</p>
          </div>
          <div className="text-primary/60">
            <Zap className="w-12 h-12" />
          </div>
        </div>

        {/* 주요 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-none">
            <p className="text-xs text-muted-foreground mb-2 font-mono">사용량</p>
            <p className="tech-text text-3xl">{data.consumption}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.energyType === "전기" ? "kWh" : data.energyType === "가스" ? "m³" : "단위"}
            </p>
          </div>
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-none">
            <p className="text-xs text-muted-foreground mb-2 font-mono">비용</p>
            <p className="tech-text text-3xl">{data.cost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">원</p>
          </div>
        </div>

        {/* 효율성 지표 */}
        {data.efficiency !== undefined && (
          <div className="bg-accent/10 border border-accent/30 p-4 rounded-none">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-mono">효율성</p>
              <span className="tech-text text-lg text-accent">{data.efficiency}%</span>
            </div>
            <div className="w-full bg-card/50 rounded-none h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                style={{ width: `${Math.min(data.efficiency, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.peakUsage && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Zap className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">최대 사용</p>
                <p className="font-mono text-sm font-bold">{data.peakUsage}</p>
              </div>
            </div>
          )}

          {data.averageUsage && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Gauge className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">평균 사용</p>
                <p className="font-mono text-sm font-bold">{data.averageUsage}</p>
              </div>
            </div>
          )}

          {data.carbonEmission && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Leaf className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-xs text-muted-foreground">탄소 배출</p>
                <p className="font-mono text-sm font-bold">{data.carbonEmission} kg</p>
              </div>
            </div>
          )}

          {data.trend && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10 col-span-2 md:col-span-1">
              {getTrendIcon(data.trend)}
              <div>
                <p className="text-xs text-muted-foreground">추세</p>
                <p className={`font-mono text-sm font-bold ${getTrendColor(data.trend)}`}>
                  {data.trend}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
