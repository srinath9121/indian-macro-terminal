import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

const NAV_ITEMS = [
  { path: "/",            label: "Home",         code: "HOM", icon: "⌂" },
  { path: "/pulse",       label: "Pulse",        code: "PUL", icon: "⚡" },
  { path: "/macro",       label: "Macro",        code: "MAC", icon: "📊" },
  { path: "/markets",     label: "Markets",      code: "MKT", icon: "📈" },
  { path: "/adani-intel", label: "Adani Intel",  code: "ADA", icon: "⬡" },
  { path: "/geo-map",     label: "Geo Map",      code: "GEO", icon: "🌍" },
  { path: "/commodities", label: "Commodities",  code: "COM", icon: "🛢" },
  { path: "/risk-radar",  label: "Risk Radar",   code: "RSK", icon: "🎯" },
  { path: "/alerts",      label: "Alerts",       code: "ALT", icon: "🔔" },
  { path: "/backtest",    label: "Backtest",     code: "BKT", icon: "🔬" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();

  // Keyboard shortcut: press [ to toggle sidebar
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "[" && !e.target.matches("input,textarea")) {
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCollapsed]);

  return (
    <aside
      style={{
        width: collapsed ? 64 : 210,
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "var(--nav)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRight: "1px solid var(--border-default)",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 110,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {/* ── SIDEBAR TOP: BRAND / LOGO ── */}
      <div
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 12,
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <img
          src="/logo.png"
          alt="India Macro Terminal"
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle Sidebar"
          style={{
            width: 32,
            height: 32,
            borderRadius: 7,
            objectFit: "cover",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 0 10px rgba(0, 229, 255, 0.35)",
            border: "1px solid rgba(0, 229, 255, 0.4)",
          }}
        />

        {!collapsed && (
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 800, fontFamily: "var(--font-sans)", letterSpacing: "0.04em", lineHeight: 1.2 }}>
              MACRO TERMINAL
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-sans)", fontWeight: 500, letterSpacing: "0.02em", marginTop: 1 }}>
              India Capital Markets
            </div>
          </div>
        )}
      </div>

      {/* ── NAVIGATION LIST ── */}
      <div
        style={{
          flex: 1,
          padding: "10px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            color: "var(--text-micro)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: collapsed ? "4px 0" : "4px 10px",
            textAlign: collapsed ? "center" : "left",
          }}
        >
          {collapsed ? "•••" : "TERMINAL VIEWS"}
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "9px 0" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 6,
                background: isActive ? "rgba(0, 229, 255, 0.09)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                borderLeft: isActive ? "3px solid var(--accent-teal)" : "3px solid transparent",
                transition: "all 0.15s ease",
              }}
              className="hover:bg-white/5"
            >
              <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>
                {item.icon}
              </span>

              {!collapsed && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <span style={{ fontSize: 11.5, fontFamily: "var(--font-sans)", fontWeight: isActive ? 700 : 500, letterSpacing: "0.02em" }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--text-micro)", fontWeight: 600 }}>
                    {item.code}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* ── SIDEBAR FOOTER: COLLAPSE & THEME ── */}
      <div
        style={{
          borderTop: "1px solid var(--border-default)",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            border: "1px solid var(--border-default)",
            background: "var(--bg-card)",
            borderRadius: 6,
            padding: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 8,
            cursor: "pointer",
            color: "var(--text-primary)",
            width: "100%",
          }}
          className="card-hover"
        >
          <span style={{ fontSize: 13 }}>{isDark ? "🌙" : "☀️"}</span>
          {!collapsed && (
            <span style={{ fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700, color: "var(--text-secondary)" }}>
              {isDark ? "DARK MODE" : "LIGHT MODE"}
            </span>
          )}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            border: "none",
            background: "transparent",
            padding: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 8,
            cursor: "pointer",
            color: "var(--text-muted)",
            width: "100%",
            fontSize: 11,
            fontFamily: "var(--mono)",
          }}
          title="Toggle sidebar  [  ]"
        >
          <span>{collapsed ? "⇥" : "⇤"}</span>
          {!collapsed && (
            <span style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span>COLLAPSE RAIL</span>
              <span style={{ fontSize: 9, opacity: 0.45, fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>[ ]</span>
            </span>
          )}
        </button>

        {/* Version stamp */}
        {!collapsed && (
          <div
            style={{
              textAlign: "center",
              paddingTop: 4,
              color: "var(--text-micro)",
              fontSize: 9,
              fontFamily: "var(--mono)",
              letterSpacing: "0.06em",
              opacity: 0.55,
            }}
          >
            IMT v2.0 · IN
          </div>
        )}
      </div>
    </aside>
  );
}
