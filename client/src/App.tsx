import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import History from "@/pages/History";
import WeatherAnalysis from "@/pages/WeatherAnalysis";
import EnergyAnalysis from "@/pages/EnergyAnalysis";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import RequireAuth from "./components/RequireAuth";
import PageFade from "./components/PageFade";
import { useEffect } from "react";


function Router() {
  return (
    <>
      <Switch>
        {/* 로그인 */}
        <Route path="/login">
          <PageFade>
            <Login />
          </PageFade>
        </Route>

        {/* 보호된 라우트들 */}
        <Route path="/history">
          <RequireAuth>
            <PageFade>
              <History />
            </PageFade>
          </RequireAuth>
        </Route>

        <Route path="/analysis/weather">
          <RequireAuth>
            <PageFade>
              <WeatherAnalysis />
            </PageFade>
          </RequireAuth>
        </Route>


        <Route path="/analysis/energy">
          <RequireAuth>
            <PageFade>
              <EnergyAnalysis />
            </PageFade>
          </RequireAuth>
        </Route>

        {/* 홈 */}
        <Route path="/">
          <RequireAuth>
            <PageFade>
              <Home />
            </PageFade>
          </RequireAuth>
        </Route>

        {/* fallback */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" switchable={true}>
      <Router />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
// Final Build 1.0.1
