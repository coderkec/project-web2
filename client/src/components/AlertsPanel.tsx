import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export interface Alert {
  id: string;
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/30",
    textColor: "text-red-400",
    label: "오류",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    textColor: "text-yellow-400",
    label: "경고",
  },
  info: {
    icon: Info,
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    textColor: "text-primary",
    label: "정보",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    textColor: "text-green-400",
    label: "성공",
  },
};

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    onDismiss?.(id);
  };

  const visibleAlerts = alerts.filter((alert) => !dismissedIds.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <Card
            key={alert.id}
            className={`${config.bgColor} border ${config.borderColor} p-4 flex items-start gap-4`}
          >
            <div className={`p-2 rounded-none flex-shrink-0 ${config.textColor}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={`font-bold text-sm ${config.textColor} mb-1`}>
                    {config.label}: {alert.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                  <p className="text-xs text-muted-foreground/60 font-mono">
                    {alert.timestamp.toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>

              {alert.actionLabel && alert.onAction && (
                <button
                  onClick={alert.onAction}
                  className={`mt-2 text-xs px-3 py-1 ${config.bgColor} border ${config.borderColor} ${config.textColor} hover:opacity-80 transition-opacity rounded-none`}
                >
                  {alert.actionLabel}
                </button>
              )}
            </div>

            <button
              onClick={() => handleDismiss(alert.id)}
              className="p-1 hover:bg-black/20 rounded-none transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </Card>
        );
      })}
    </div>
  );
}
