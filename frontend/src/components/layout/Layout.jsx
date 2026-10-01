import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SidebarNav from "./SidebarNav";
import { useTerminalStore } from "../../store/useTerminalStore";
import { useLocation } from "react-router-dom";
import { useWebSocketFeed } from "../../hooks/useWebSocketFeed";

/**
 * Layout — wraps every page.
 * Starts data polling on mount.
 * Option 3: Collapsible Left Sidebar Rail + Top status bar.
 */
export default function Layout({ children, noPadding = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const startPolling = useTerminalStore((s) => s.startPolling);
  const location = useLocation();
  const [fadeIn, setFadeIn] = useState(false);

  // PRIMARY data feed: WebSocket push from backend
  useWebSocketFeed();

  useEffect(() => {
    const id = startPolling(15000);
    return () => clearInterval(id);
  }, []);

  // Trigger fade-in when route changes
  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 30);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── OPTION 3: VERTICAL LEFT SIDEBAR ── */}
      <SidebarNav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* ── RIGHT MAIN CONTENT AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar />
        <main
          style={{
            ...(noPadding ? { padding: 0 } : { padding: "16px 20px" }),
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
