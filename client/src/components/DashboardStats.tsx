import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  icon: React.ReactNode;
  color: "primary" | "accent" | "warning" | "success";
}

interface DashboardStatsProps {
  stats: StatItem[];
}

const colorClasses = {
  primary: "text-primary/80 bg-primary/5 border-primary/30",
  accent: "text-accent/80 bg-accent/5 border-accent/30",
  warning: "text-yellow-400/80 bg-yellow-400/5 border-yellow-400/30",
  success: "text-green-400/80 bg-green-400/5 border-green-400/30",
};

const getTrendIcon = (trend?: "up" | "down" | "stable") => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-red-400" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-green-400" />;
  return null;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="blueprint-card p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="tech-text text-2xl font-bold">{stat.value}</p>
                {stat.unit && <span className="text-xs text-muted-foreground">{stat.unit}</span>}
              </div>
              {stat.trend && stat.trendValue !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(stat.trend)}
                  <span
                    className={`text-xs font-mono ${
                      stat.trend === "up"
                        ? "text-red-400"
                        : stat.trend === "down"
                          ? "text-green-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stat.trend === "up" ? "+" : stat.trend === "down" ? "-" : ""}
                    {Math.abs(stat.trendValue)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-none border ${colorClasses[stat.color]}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
