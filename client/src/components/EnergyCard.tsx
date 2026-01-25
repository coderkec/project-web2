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
      <Card className="blueprint-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary/20 w-1/3"></div>
          <div className="h-8 bg-primary/20 w-1/2"></div>
        </div>
      </Card>
    );
  }

  // 데이터가 없을 때 기본값 (데모용)
  const displayData = data || {
    facility: "본사 빌딩",
    energyType: "전기",
    consumption: 450,
    cost: 125000,
    efficiency: 92,
    carbonEmission: 12.5,
    peakUsage: 520,
    averageUsage: 430,
    trend: "전주 대비 5% 감소",
  };

  return (
    <Card className="blueprint-card p-6 hover:border-primary/50 transition-colors cursor-pointer group h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="tech-text text-xl font-bold mb-1">전국 전력 현황</h3>
          <p className="text-sm text-primary/80 font-mono">일별 전력 사용 패턴 요약</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
          <Zap className="w-8 h-8 text-yellow-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-primary/5 p-4 rounded border border-primary/10">
          <p className="text-sm text-muted-foreground mb-1">전일 대비 사용 변화</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tech-text text-green-500">-5</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <div className="bg-primary/5 p-4 rounded border border-primary/10">
          <p className="text-sm text-muted-foreground mb-1">주간 평균 대비 부하</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tech-text text-red-400">+12</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      {/* 상세 지표 */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-2">
          <div className="flex justify-center mb-2 text-green-400">
            <Leaf className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">탄소 배출량</p>
          <p className="font-bold font-mono">{displayData.carbonEmission} kg</p>
        </div>

        <div className="p-2 border-l border-primary/10">
          <div className="flex justify-center mb-2 text-yellow-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">에너지 효율</p>
          <p className="font-bold font-mono">{displayData.efficiency}% (우수)</p>
        </div>

        <div className="p-2 border-l border-primary/10">
          <div className="flex justify-center mb-2 text-primary">
            <Gauge className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">피크 부하</p>
          <p className="font-bold font-mono">{displayData.peakUsage} kW</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-primary/10 text-center">
        <p className={`text-sm font-medium ${getTrendColor(displayData.trend)}`}>
          {displayData.trend?.includes("전주 대비") ?
            `🍀 ${displayData.trend} 중입니다` :
            `🍀 현재 사용량이 ${displayData.trend || "안정"} 상태입니다`}
        </p>
      </div>
    </Card>
  );
}
