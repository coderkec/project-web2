// Force redeploy - Google Icon Fix
import { useState } from "react";
import { useLocation } from "wouter";
import { login } from "@/auth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const manualLogin = trpc.auth.manualLogin.useMutation();
  const utils = trpc.useUtils();

  const handleLogin = async () => {
    try {
      setError("");
      const result = await manualLogin.mutateAsync({ id, pw });

      // ✅ 세션 토큰 저장 (헤더용)
      if (result.sessionToken) {
        localStorage.setItem("app_session_token", result.sessionToken);
      }

      // ✅ 세션 쿠키가 발급되었으므로 meQuery 무효화
      await utils.auth.me.invalidate();

      localStorage.setItem("isLoggedIn", "true");

      // ✅ 세션이 확실히 브라우저에 반영될 시간을 갖기 위해 약간의 지연 추가
      setTimeout(() => {
        setLocation("/");
      }, 100);
    } catch (err: any) {
      setError(err.message || "아이디 또는 비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT */}
      <div className="relative flex flex-col justify-center px-16 text-white
        bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800">

        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,white,transparent_60%)]" />

        <div className="relative z-10">
          <div className="text-5xl font-extrabold mb-6 leading-tight">
            Hello<br />
            <span className="flex items-center gap-2">
              Integrated Dashboard <span>👋</span>
            </span>
          </div>

          <p className="max-w-md text-lg text-white/80">
            Skip repetitive and manual monitoring tasks.
            Get highly productive through automation and save tons of time.
          </p>

          <p className="mt-12 text-sm text-white/50">
            © 2026 Integrated Dashboard. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-center bg-background">
        <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please sign in to continue
          </p>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <input
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />

            <input
              type="password"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-black/90"
            >
              Login Now
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              className="w-full rounded-md border py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Login with Google
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Forgot password?{" "}
            <span className="underline cursor-pointer">Click here</span>
          </div>
        </div>
      </div>
    </div>
  );
}
