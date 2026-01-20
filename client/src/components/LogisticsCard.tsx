import { Package, MapPin, Truck, Calendar, DollarSign, Weight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LogisticsData {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  carrier?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  weight?: number;
  distance?: number;
  cost?: number;
}

interface LogisticsCardProps {
  data?: LogisticsData;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  const lower = status.toLowerCase();
  if (lower.includes("완료") || lower.includes("delivered")) return "text-green-400";
  if (lower.includes("배송중") || lower.includes("shipping")) return "text-blue-400";
  if (lower.includes("대기") || lower.includes("pending")) return "text-yellow-400";
  return "text-primary";
};

const getStatusIcon = (status: string) => {
  const lower = status.toLowerCase();
  if (lower.includes("완료") || lower.includes("delivered")) return "✓";
  if (lower.includes("배송중") || lower.includes("shipping")) return "→";
  if (lower.includes("대기") || lower.includes("pending")) return "⏳";
  return "📦";
};

export function LogisticsCard({ data, isLoading }: LogisticsCardProps) {
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
          <p className="text-muted-foreground">물류 데이터를 불러오는 중입니다...</p>
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
            <h3 className="tech-text text-2xl mb-2">배송 추적</h3>
            <p className="text-muted-foreground text-sm font-mono">{data.trackingNumber}</p>
          </div>
          <div className={`text-3xl ${getStatusColor(data.status)}`}>
            {getStatusIcon(data.status)}
          </div>
        </div>

        {/* 상태 */}
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-none">
          <p className="text-xs text-muted-foreground mb-2 font-mono">배송 상태</p>
          <p className={`tech-text text-xl ${getStatusColor(data.status)}`}>{data.status}</p>
        </div>

        {/* 경로 정보 */}
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <MapPin className="w-5 h-5 text-primary/60 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">출발지</p>
              <p className="font-mono text-sm">{data.origin}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-gradient-to-b from-primary/40 to-transparent"></div>
          </div>

          <div className="flex gap-3 items-start">
            <MapPin className="w-5 h-5 text-primary/60 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">목적지</p>
              <p className="font-mono text-sm">{data.destination}</p>
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.carrier && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Truck className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">배송사</p>
                <p className="font-mono text-sm font-bold">{data.carrier}</p>
              </div>
            </div>
          )}

          {data.estimatedDelivery && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Calendar className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">예상 배송</p>
                <p className="font-mono text-sm font-bold">
                  {new Date(data.estimatedDelivery).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          )}

          {data.actualDelivery && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Calendar className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">실제 배송</p>
                <p className="font-mono text-sm font-bold">
                  {new Date(data.actualDelivery).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          )}

          {data.weight && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <Weight className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">무게</p>
                <p className="font-mono text-sm font-bold">{data.weight} g</p>
              </div>
            </div>
          )}

          {data.distance && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <MapPin className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">거리</p>
                <p className="font-mono text-sm font-bold">{data.distance} km</p>
              </div>
            </div>
          )}

          {data.cost && (
            <div className="flex items-center gap-2 bg-card/50 p-3 rounded-none border border-primary/10">
              <DollarSign className="w-4 h-4 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground">배송비</p>
                <p className="font-mono text-sm font-bold">{data.cost.toLocaleString()} 원</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
