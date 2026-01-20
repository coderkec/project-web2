import { ArrowLeft, Package, TrendingUp, MapPin, Truck, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

export default function LogisticsAnalysis() {
  const [, setLocation] = useLocation();

  // 배송사별 현황
  const carrierData = [
    { name: "CJ대한통운", value: 35, count: 12 },
    { name: "롯데택배", value: 28, count: 9 },
    { name: "한진택배", value: 22, count: 7 },
    { name: "우체국", value: 15, count: 5 },
  ];

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

  // 배송 상태별 현황
  const statusData = [
    { status: "배송완료", count: 45, percentage: 45 },
    { status: "배송중", count: 35, percentage: 35 },
    { status: "배송대기", count: 15, percentage: 15 },
    { status: "배송지연", count: 5, percentage: 5 },
  ];

  // 지역별 배송 현황
  const regionData = [
    { region: "서울", count: 28 },
    { region: "경기", count: 22 },
    { region: "부산", count: 18 },
    { region: "대구", count: 12 },
    { region: "인천", count: 10 },
    { region: "기타", count: 10 },
  ];

  // 최근 배송 목록
  const recentShipments = [
    { id: "CJ123456789", status: "배송완료", from: "서울", to: "부산", date: "2025-12-22" },
    { id: "LOTTE987654", status: "배송중", from: "서울", to: "대구", date: "2025-12-22" },
    { id: "HANJIN456789", status: "배송대기", from: "인천", to: "광주", date: "2025-12-21" },
    { id: "POST123456", status: "배송중", from: "대전", to: "대구", date: "2025-12-21" },
    { id: "CJ789456123", status: "배송완료", from: "부산", to: "서울", date: "2025-12-20" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "배송완료":
        return "text-green-400";
      case "배송중":
        return "text-primary";
      case "배송대기":
        return "text-yellow-400";
      case "배송지연":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

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
            <h1 className="tech-text text-2xl">물류 분석</h1>
            <p className="text-muted-foreground text-sm">배송 통계 및 현황</p>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 p-6 space-y-6">
        {/* 주요 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground mb-1">전체 배송</p>
            <p className="tech-text text-2xl font-bold">100</p>
            <p className="text-xs text-muted-foreground/60 mt-1">건</p>
          </Card>
          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground mb-1">배송완료</p>
            <p className="tech-text text-2xl font-bold text-green-400">45</p>
            <p className="text-xs text-green-400/60 mt-1">45%</p>
          </Card>
          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground mb-1">배송중</p>
            <p className="tech-text text-2xl font-bold text-primary">35</p>
            <p className="text-xs text-primary/60 mt-1">35%</p>
          </Card>
          <Card className="blueprint-card p-4">
            <p className="text-xs text-muted-foreground mb-1">평균 배송시간</p>
            <p className="tech-text text-2xl font-bold">2.3</p>
            <p className="text-xs text-muted-foreground/60 mt-1">일</p>
          </Card>
        </div>

        {/* 배송사별 현황 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="tech-text text-lg mb-4">배송사별 현황</h2>
            <Card className="blueprint-card p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={carrierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {carrierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a1428",
                      border: "1px solid #ffffff30",
                      borderRadius: "0px",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div>
            <h2 className="tech-text text-lg mb-4">배송사별 상세</h2>
            <div className="space-y-2">
              {carrierData.map((carrier, idx) => (
                <Card key={idx} className="blueprint-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-none"
                        style={{ backgroundColor: COLORS[idx] }}
                      ></div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold">{carrier.name}</p>
                        <p className="text-xs text-muted-foreground">{carrier.count}건</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold">{carrier.value}%</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* 배송 상태별 현황 */}
        <div>
          <h2 className="tech-text text-lg mb-4">배송 상태별 현황</h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="status" stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <YAxis stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a1428",
                    border: "1px solid #ffffff30",
                    borderRadius: "0px",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                />
                <Bar dataKey="count" fill="#3b82f6" name="배송 건수" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 지역별 배송 현황 */}
        <div>
          <h2 className="tech-text text-lg mb-4">지역별 배송 현황</h2>
          <Card className="blueprint-card p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis type="number" stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <YAxis dataKey="region" type="category" stroke="#ffffff60" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a1428",
                    border: "1px solid #ffffff30",
                    borderRadius: "0px",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                />
                <Bar dataKey="count" fill="#10b981" name="배송 건수" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 최근 배송 목록 */}
        <div>
          <h2 className="tech-text text-lg mb-4">최근 배송 목록</h2>
          <div className="space-y-2">
            {recentShipments.map((shipment) => (
              <Card key={shipment.id} className="blueprint-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Package className="w-5 h-5 text-accent/60 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold font-mono">{shipment.id}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{shipment.from} → {shipment.to}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-bold ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{shipment.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
