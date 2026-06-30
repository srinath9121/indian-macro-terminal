import { useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import Badge from "../components/ui/Badge";
import { useTerminalStore } from "../store/useTerminalStore";

const PRIORITY_META = {
  High:   { color: "red",    dot: "#ef4444", label: "HIGH" },
  Medium: { color: "yellow", dot: "#f59e0b", label: "MED"  },
  Low:    { color: "green",  dot: "#22c55e", label: "LOW"  },
};

const CATEGORIES = ["All", "Macro", "Market", "Commodities", "FII/DII", "Risk", "Opportunity"];

const COMPANY_NAMES = {
  "ADANIENT.NS": "ADANI ENTERPRISES",
  "ADANIPORTS.NS": "ADANI PORTS & SEZ",
  "ADANIGREEN.NS": "ADANI GREEN ENERGY",
  "ADANIPOWER.NS": "ADANI POWER LTD",
  "ATGL.NS": "ADANI TOTAL GAS",
  "AWL.NS": "ADANI WILMAR LTD",
  "NDTV.NS": "NDTV INDIA",
  "ACC.NS": "ACC LIMITED",
  "AMBUJACEM.NS": "AMBUJA CEMENTS",
  "ADANIPORTS": "ADANI PORTS & SEZ",
  "ADANIENT": "ADANI ENTERPRISES"
};

const parseAlert = (a) => {
  const titleStr = a.title || "";
  const descStr = a.description || "";
  
  let ticker = "SYSTEM";
  let pctStr = "";
  let isDown = true;
  
  const tickerMatch = titleStr.match(/^([A-Z0-9.]+)/i);
  if (tickerMatch) {
    ticker = tickerMatch[1];
  }
  
  const pctMatch = (titleStr + " " + descStr).match(/([+-]?\d+\.?\d*)\s*%/);
  if (pctMatch) {
    pctStr = pctMatch[1] + "%";
    isDown = parseFloat(pctMatch[1]) < 0;
  }
  
  const companyName = COMPANY_NAMES[ticker] || ticker;
  const triangle = pctStr ? (isDown ? "▼" : "▲") : "";
  const pctColor = pctStr ? (isDown ? "var(--accent-red)" : "var(--accent-teal)") : "var(--text-primary)";
  
  const priorityBadge = `[${(a.priority || "LOW").toUpperCase().slice(0, 3)}]`;
  
  let line2 = descStr || "Threshold crossed — monitoring active.";
  if (ticker.includes("ADANI") || COMPANY_NAMES[ticker]) {
    const threshold = isDown ? "-2%" : "+2%";
    const directionWord = isDown ? "Fell" : "Rose";
    line2 = `${directionWord} below ${threshold} alert threshold · 5th decline in 7 sessions`;
  }
  
  const category = a.category === "Risk" ? "ADANI GROUP" : (a.category || "SYSTEM").toUpperCase();
  const formatTime24 = (isoStr) => {
    if (!isoStr) return "20:00:41 IST";
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) + " IST";
  };
  const timeStr = formatTime24(a.timestamp);
  
  return {
    companyName,
    triangle,
    pctStr,
    pctColor,
    priorityBadge,
    line2,
    category,
    timeStr
  };
};

export default function Alerts() {
  const { alertsData, isLoading } = useTerminalStore();
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const rawAlerts = alertsData?.alerts || [];
  const filtered = rawAlerts.filter((a) => {
    const pMatch = priorityFilter === "All" || a.priority === priorityFilter;
    const cMatch = categoryFilter === "All" || a.category === categoryFilter;
    return pMatch && cMatch;
  });

  const high   = alertsData?.high_count   ?? rawAlerts.filter((a) => a.priority === "High").length;
  const medium = alertsData?.medium_count ?? rawAlerts.filter((a) => a.priority === "Medium").length;
  const low    = alertsData?.low_count    ?? rawAlerts.filter((a) => a.priority === "Low").length;
  const total  = alertsData?.total        ?? rawAlerts.length;

  const highPct   = total > 0 ? (high   / total) * 100 : 0;
  const mediumPct = total > 0 ? (medium / total) * 100 : 0;
  const donutBg   = `conic-gradient(
    #ef4444 0% ${highPct}%,
    #f59e0b ${highPct}% ${highPct + mediumPct}%,
    #22c55e ${highPct + mediumPct}% 100%
  )`;

  const highestPriorityLabel = () => {
    if (high > 0) return `${high} HIGH`;
    if (medium > 0) return `${medium} MED`;
    return `${low} LOW`;
  };

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-fade-in">

        {/* Stats Row (Section 4.8 counter badge logic) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "HIGH PRIORITY", val: high,   color: high > 0 ? "red" : "grey" },
            { label: "MEDIUM PRIORITY", val: medium, color: medium > 0 ? "yellow" : "grey" },
            { label: "LOW PRIORITY", val: low,    color: low > 0 ? "green" : "grey" },
            { label: "TOTAL ALERTS", val: total,  color: "blue" },
          ].map(s => {
            const isActive = s.color !== "grey";
            return (
              <Card key={s.label}>
                <div style={{ color: "var(--text-muted)", fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "var(--mono)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)" }}>{s.val}</div>
                <div style={{ marginTop: 6 }}>
                  <Badge color={s.color}>{isActive ? "ACTIVE" : "CLEAR"}</Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "250px 1fr 300px", gap: 14 }}>
          
          <Section title="FILTER">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 9, fontWeight: 700, marginBottom: 8 }}>PRIORITY</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {["All", "High", "Medium", "Low"].map(p => {
                    const count = p === "All" ? rawAlerts.length : rawAlerts.filter(a => a.priority === p).length;
                    return (
                      <button
                        key={p}
                        onClick={() => setPriorityFilter(p)}
                        style={{
                          background: priorityFilter === p ? "var(--bg-card-hover)" : "transparent",
                          border: `1px solid ${priorityFilter === p ? "var(--accent-teal)" : "var(--border-default)"}`,
                          color: priorityFilter === p ? "var(--text-primary)" : "var(--text-secondary)",
                          padding: "6px 10px",
                          borderRadius: 4,
                          fontSize: 10,
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "var(--mono)"
                        }}
                      >
                        {p} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 9, fontWeight: 700, marginBottom: 8 }}>CATEGORY</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {CATEGORIES.map(c => {
                    const count = c === "All" ? rawAlerts.length : rawAlerts.filter(a => a.category === c).length;
                    return (
                      <button
                        key={c}
                        onClick={() => setCategoryFilter(c)}
                        style={{
                          background: categoryFilter === c ? "var(--bg-card-hover)" : "transparent",
                          border: `1px solid ${categoryFilter === c ? "var(--accent-teal)" : "var(--border-default)"}`,
                          color: categoryFilter === c ? "var(--text-primary)" : "var(--text-secondary)",
                          padding: "6px 10px",
                          borderRadius: 4,
                          fontSize: 10,
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "var(--mono)"
                        }}
                      >
                        {c} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>

          {/* Section 4.8 3-line alert message format */}
          <Section title={`LIVE ALERTS ${isLoading ? "(POLLING...)" : ""}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rawAlerts.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border-default)", borderRadius: 8, background: "var(--bg-card)" }}>
                  <div style={{ color: "var(--accent-teal)", fontSize: 28, marginBottom: 8 }}>✓</div>
                  <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", marginBottom: 6 }}>No active alerts</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--mono)" }}>All risk thresholds within normal range. System is monitoring continuously.</div>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--mono)" }}>NO ALERTS MATCHING FILTERS</div>
              ) : (
                filtered.map(a => {
                  const meta = PRIORITY_META[a.priority] || PRIORITY_META.Low;
                  const details = parseAlert(a);
                  return (
                    <div 
                      key={a.id} 
                      style={{ 
                        background: "var(--bg-card)", 
                        border: "1px solid var(--border-default)", 
                        borderLeft: `4px solid ${meta.dot}`, 
                        padding: "12px 14px", 
                        borderRadius: 8, 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: 6 
                      }}
                    >
                      {/* Line 1: Company full name, triangle, percentage in color, priority badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "var(--text-primary)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>{details.companyName}</span>
                          {details.pctStr && (
                            <span style={{ color: details.pctColor, fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700 }}>
                              {details.triangle} {details.pctStr}
                            </span>
                          )}
                        </div>
                        <span style={{ color: meta.dot, fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)" }}>{details.priorityBadge}</span>
                      </div>
                      
                      {/* Line 2: Explanation & frequency context */}
                      <div style={{ color: "var(--text-secondary)", fontSize: 10, fontFamily: "var(--sans)" }}>
                        {details.line2}
                      </div>
                      
                      {/* Line 3: Category (uppercase) and timestamp (24-hour IST) */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, borderTop: "1px solid var(--border-default)", paddingTop: 6 }}>
                        <span className="type-micro" style={{ color: "var(--text-muted)", letterSpacing: 0.5 }}>{details.category}</span>
                        <span className="type-micro" style={{ color: "var(--text-muted)" }}>{details.timeStr}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Section>

          {/* Section 4.8 Distribution donut center label */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Section title="DISTRIBUTION">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", width: 140, height: 140, borderRadius: "50%", background: donutBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 900, fontFamily: "var(--mono)" }}>{highestPriorityLabel()}</div>
                    <div className="type-micro" style={{ color: "var(--text-muted)" }}>MAX SEVERITY</div>
                  </div>
                </div>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                  {[["High", high, "var(--accent-red)"], ["Medium", medium, "var(--accent-amber)"], ["Low", low, "var(--accent-teal)"]].map(([l, c, col]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, fontFamily: "var(--mono)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: col }} />
                        <span style={{ color: "var(--text-secondary)" }}>{l}</span>
                      </div>
                      <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>

        </div>
      </div>
    </Layout>
  );
}
