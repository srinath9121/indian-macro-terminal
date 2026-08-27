import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

const LINKS = [
  { path: "/",            label: "HOME" },
  { path: "/pulse",       label: "PULSE" },
  { path: "/macro",       label: "MACRO" },
  { path: "/markets",     label: "MARKETS" },
  { path: "/adani-intel", label: "ADANI INTEL" },
  { path: "/geo-map",     label: "GEO MAP" },
  { path: "/commodities", label: "COMMODITIES" },
  { path: "/risk-radar",  label: "RISK RADAR" },
  { path: "/alerts",      label: "ALERTS" },
];

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
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <nav
      style={{
        background: "var(--nav)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        height: 52,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 32 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #0284C7, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 900,
            color: "#fff",
            boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
          }}
        >
          ⬡
        </div>
        <div>
          <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700, letterSpacing: 1, fontFamily: "var(--mono)" }}>
            INDIA MACRO TERMINAL
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 9, letterSpacing: 0.5 }}>
            Real-time Intelligence. Smarter Decisions.
          </div>
        </div>
      </div>

      {/* Nav Links */}
      {LINKS.map((l) => {
        const isActive = location.pathname === l.path;
        return (
          <NavLink
            key={l.path}
            to={l.path}
            style={{
              background: "none",
              textDecoration: "none",
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              letterSpacing: 0.8,
              padding: "0 14px",
              height: 52,
              display: "flex",
              alignItems: "center",
              borderBottom: isActive ? "2px solid var(--accent-blue)" : "2px solid transparent",
              transition: "all 0.15s",
              fontFamily: "var(--mono)",
            }}
          >
            {l.label}
          </NavLink>
        );
      })}

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        {/* Live Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              boxShadow: "0 0 6px #22c55e",
            }}
          />
          <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>LIVE</span>
        </div>

        <LiveClock />

        {/* ── Theme Switcher ── */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? "Light Glass" : "Dark Terminal"} mode`}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            color: "var(--text-primary)",
            fontFamily: "var(--mono)",
            fontSize: 11,
            fontWeight: 700,
            transition: "all 0.2s ease",
          }}
          className="card-hover"
        >
          <span style={{ fontSize: 12 }}>{isDark ? "🌙" : "☀️"}</span>
          <span style={{ fontSize: 9, letterSpacing: 0.5, color: "var(--text-muted)" }}>
            {isDark ? "DARK" : "LIGHT"}
          </span>
        </button>

        <span style={{ color: "var(--text-muted)", fontSize: 15, cursor: "pointer" }}>🔍</span>
        <span style={{ color: "var(--text-muted)", fontSize: 15, position: "relative", cursor: "pointer" }}>
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
              width: 14,
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            3
          </span>
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: 15, cursor: "pointer" }}>👤</span>
      </div>
    </nav>
  );
}
