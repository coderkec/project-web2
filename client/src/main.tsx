// ✅ 가장 먼저 실행: URL에서 토큰을 낚아채서 저장 (레이스 컨디션 방지)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
if (token) {
  localStorage.setItem("app_session_token", token);
  localStorage.setItem("isLoggedIn", "true");
  document.cookie = `app_session_id=${token}; path=/; max-age=31536000; SameSite=Lax`;
  // URL에서 토큰 파라미터 제거
  window.history.replaceState({}, "", window.location.pathname);
}

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { getLoginUrl } from "./const";
import App from "./App";

import "./index.css";

/* =========================
   Query Client
========================= */
const queryClient = new QueryClient();

/* =========================
   Unauthorized Handling
   - DEV : redirect ❌
   - PROD: redirect ⭕
========================= */
const isDev = import.meta.env.DEV;

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  if (error.message !== UNAUTHED_ERR_MSG) return;

  if (isDev) {
    console.warn("[DEV] Unauthorized – redirect skipped");
    return;
  }

  window.location.href = getLoginUrl();
};

/* =========================
   Global Error Subscribe
========================= */
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.mutation.state.error);
  }
});

/* =========================
   tRPC Client
========================= */
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // ✅ localStorage에서 토큰을 읽어 헤더에 담습니다. (쿠키 소실 대비)
        const token = localStorage.getItem("app_session_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      fetch(input, init) {
        return fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

/* =========================
   Render
========================= */
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <App />
    </trpc.Provider>
  </QueryClientProvider>
);
