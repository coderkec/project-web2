import { Home, CloudSun, Zap, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export function Sidebar() {
    const [location] = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { icon: <Home className="w-5 h-5" />, label: "홈 대시보드", path: "/home" },
        { icon: <CloudSun className="w-5 h-5" />, label: "날씨 모니터링", path: "/analysis/weather" },
        { icon: <Zap className="w-5 h-5" />, label: "에너지 관리", path: "/analysis/energy" },
    ];

    const isActive = (path: string) => location === path;

    return (
        <div className="w-64 h-screen bg-card border-r border-primary/20 flex flex-col sticky top-0">
            {/* 로고 영역 */}
            <div className="p-6 border-b border-primary/20">
                <h1 className="tech-text text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                    Integrated<br />Dashboard
                </h1>
            </div>

            {/* 메뉴 리스트 */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                        <a
                            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group text-sm font-medium
                ${isActive(item.path)
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                        >
                            <span className={`transition-colors duration-200 ${isActive(item.path) ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </a>
                    </Link>
                ))}
            </nav>

            {/* 하단 설정 및 로그아웃 */}
            <div className="p-4 border-t border-primary/20 space-y-2">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all">
                    <Settings className="w-5 h-5" />
                    설정
                </button>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                </button>
            </div>
        </div>
    );
}
