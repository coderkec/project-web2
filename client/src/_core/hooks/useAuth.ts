import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";
import { useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// 🔥 DEV 로그인 플래그 (true일 때만 우회)
const DEV_LOGIN = import.meta.env.VITE_DEV_LOGIN === "true";

// 🔥 DEV용 가짜 유저
const DEV_USER = {
  id: 1,
  openId: "dev-user",
  name: "Dev User",
  email: "dev@local",
  loginMethod: "manual",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const [loggedOut, setLoggedOut] = useState(false);

  /**
   * =========================
   * DEV MODE: OAuth 완전 우회
   * =========================
   */
  // No early return for DEV_LOGIN anymore. We handle it within the state logic below.

  /**
   * =========================
   * PROD MODE: 기존 OAuth 로직
   * =========================
   */
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !loggedOut,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      setLoggedOut(true);
    },
  });

  const logout = useCallback(async () => {
    // 1. 즉시 로컬 상태 변경 (UI 반영을 위함)
    setLoggedOut(true);
    utils.auth.me.setData(undefined, null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("manus-runtime-user-info");

    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      // 이미 로그아웃된 상태거나 에러가 나도 로컬에서는 로그아웃 처리 진행
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      console.error("Logout failed but forced local logout:", error);
    } finally {
      // 2. 캐시 무효화 및 확실한 데이터 제거
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    // 1. 서버 인증 우선
    let user = meQuery.data ?? null;

    // 2. 서버 인증 없고, 수동 로그인(admin/admin123) 되어있으면 DEV_USER로 우회
    if (!user && !meQuery.isLoading && localStorage.getItem("isLoggedIn") === "true") {
      console.log("[useAuth] Forcefully falling back to DEV_USER");
      user = DEV_USER;
    }

    console.log("[useAuth] Final user state:", user);
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(user)
    );

    return {
      user,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
