import { useState } from "react";
import { useLocation } from "wouter";
import { login } from "@/auth";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (id === "admin" && pw === "admin123") {
      login();
      window.location.href = "/";
    } else {
      setError("아이디 또는 비밀번호가 틀렸습니다.");
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

          <div className="space-y-4">
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
              onClick={handleLogin}
              className="w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-black/90"
            >
              Login Now
            </button>

            <button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              className="w-full rounded-md border py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-4 h-4"
              />
              Login with Google
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Forgot password?{" "}
            <span className="underline cursor-pointer">Click here</span>
          </div>
        </div>
      </div>
    </div>
  );
}
