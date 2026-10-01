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
  const location = useLocation();
  const pageTitle = PAGE_NAMES[location.pathname] || "Terminal View";
  const lastUpdated = useTerminalStore((s) => s.lastUpdated);

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
        {/* Live Feed Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(34, 197, 94, 0.08)", padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(34, 197, 94, 0.2)" }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              boxShadow: "0 0 6px #22c55e",
            }}
          />
          <span style={{ color: "#22c55e", fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>LIVE FEED</span>
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
