import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Eager load — always needed
import Home from "./pages/Home";

// Lazy load — only when navigated to
const Pulse       = lazy(() => import("./pages/Pulse"));
const Macro       = lazy(() => import("./pages/Macro"));
const Markets     = lazy(() => import("./pages/Markets"));
const GeoMap      = lazy(() => import("./pages/GeoMap"));
const Commodities = lazy(() => import("./pages/Commodities"));
const RiskRadar   = lazy(() => import("./pages/RiskRadar"));
const AdaniIntel  = lazy(() => import("./pages/AdaniIntel"));
const Alerts      = lazy(() => import("./pages/Alerts"));
const Backtest    = lazy(() => import("./pages/Backtest"));

/** Animated loading skeleton while lazy chunks hydrate */
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "60vh",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent-teal)",
              display: "inline-block",
              animation: `_pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <span
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Loading Module
      </span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/pulse"        element={<Pulse />} />
          <Route path="/macro"        element={<Macro />} />
          <Route path="/markets"      element={<Markets />} />
          <Route path="/geo-map"      element={<GeoMap />} />
          <Route path="/commodities"  element={<Commodities />} />
          <Route path="/risk-radar"   element={<RiskRadar />} />
          <Route path="/adani-intel"  element={<AdaniIntel />} />
          <Route path="/alerts"       element={<Alerts />} />
          <Route path="/backtest"     element={<Backtest />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

