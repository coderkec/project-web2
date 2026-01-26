import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const isLoggedInLocal = localStorage.getItem("isLoggedIn") === "true";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // user가 없더라도 로컬 스토리지에 로그인 이력이 있으면 잠시 대기 (리다이렉트 방지)
  if (!user && !isLoggedInLocal) {
    return <Redirect to="/login" />;
  }

  // user가 없는데 로컬엔 있으면 아직 refetch 중일 수 있으므로 로딩 표시
  if (!user && isLoggedInLocal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">세션 갱신 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
