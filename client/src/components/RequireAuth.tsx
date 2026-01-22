import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

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

  if (!user) {
    if (window.location.search.includes("oauth=success")) {
      console.warn("[RequireAuth] OAuth success param detected, but user is null. Cookie might be missing.");
      // Optional: You could show an error message instead of immediate redirect to help debugging
    }
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
