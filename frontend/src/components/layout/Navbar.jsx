import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useTerminalStore } from "../../store/useTerminalStore";

const PAGE_NAMES = {
  "/": "Overview & Executive Dashboard",
  "/pulse": "Macro Scoreboard & Real-Time Pulse",
  "/macro": "Macroeconomic Indicators & RBI Analytics",
  "/markets": "Multi-Asset Markets & Sector Heatmaps",
  "/adani-intel": "Adani Group Volatility & Flow Intelligence",
  "/geo-map": "3D Geopolitical Risk Globe & Energy Corridors",
  "/commodities": "Global Commodities & Import Sensitivities",
  "/risk-radar": "Multi-Factor India Stress Index (IMSI)",
  "/alerts": "Real-Time Telemetry & Parametric Alerts",
  "/backtest": "Hindenburg Risk Backtest Engine",
};

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }) + " IST"
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--mono)" }}>{time}</span>;
}

export default function Navbar() {
  const location  = useLocation();
  const pageTitle  = PAGE_NAMES[location.pathname] || "Terminal View";
  const lastUpdated = useTerminalStore((s) => s.lastUpdated);
  const wsConnected = useTerminalStore((s) => s.wsConnected);

  // Connection indicator colours
  const connColor = wsConnected ? "#22c55e" : "#f59e0b";
  const connBg    = wsConnected ? "rgba(34,197,94,0.08)"  : "rgba(245,158,11,0.08)";
  const connBrd   = wsConnected ? "rgba(34,197,94,0.25)"  : "rgba(245,158,11,0.25)";
  const connLabel = wsConnected ? "WS LIVE" : "REST POLL";

  return (
    <nav
      style={{
        background: "var(--nav)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: 50,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* ── CURRENT BREADCRUMB / ACTIVE VIEW ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          TERMINAL /
        </span>
        <span style={{ color: "var(--text-primary)", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-sans)", letterSpacing: "0.02em" }}>
          {pageTitle}
        </span>
      </div>

      {/* ── RIGHT TELEMETRY & UTILITIES ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Connection Status — honest WS vs REST indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: connBg, padding: "3px 8px", borderRadius: 4, border: `1px solid ${connBrd}`, transition: "all 0.4s ease" }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: connColor,
              display: "inline-block",
              boxShadow: wsConnected ? `0 0 6px ${connColor}` : "none",
              animation: wsConnected ? "_pulse 2s ease-in-out infinite" : "none",
            }}
          />
          <span style={{ color: connColor, fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "0.05em", transition: "color 0.4s" }}>{connLabel}</span>
        </div>

        <LiveClock />

        {lastUpdated && (
          <span style={{ color: "var(--text-micro)", fontSize: 9, fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>
            UPD {new Date(lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })}
          </span>
        )}

        <div style={{ width: 1, height: 18, background: "var(--border-default)" }} />

        {/* Global Quick Action Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-muted)", fontSize: 14 }}>
          <span style={{ cursor: "pointer" }} title="Quick Search">🔍</span>
          <span style={{ position: "relative", cursor: "pointer" }} title="Alert Center">
            🔔
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#ef4444",
                borderRadius: "50%",
                fontSize: 8,
                color: "#fff",
                width: 13,
                height: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              3
            </span>
          </span>
          <span style={{ cursor: "pointer" }} title="User Profile">👤</span>
        </div>
      </div>
    </nav>
  );
}
