import { Home, CloudSun, Zap, Settings, LogOut, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";

export function Sidebar() {
    const [location] = useLocation();
    const { logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const menuItems = [
        { icon: <Home className="w-5 h-5" />, label: "홈 대시보드", path: "/" },
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
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all">
                            <Settings className="w-5 h-5" />
                            설정
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>환경 설정</DialogTitle>
                            <DialogDescription>
                                대시보드의 환경을 설정할 수 있습니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="theme-mode">다크 모드</Label>
                                    <span className="text-xs text-muted-foreground">어두운 테마를 사용하여 눈의 피로를 줄입니다.</span>
                                </div>
                                <Switch
                                    id="theme-mode"
                                    checked={theme === "dark"}
                                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

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
