import { useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import Badge from "../components/ui/Badge";
import Sparkline from "../components/charts/Sparkline";

const HOME_KPIS = [
  { name: "NIFTY 50", value: "24,117.65", change: "+181.95 (+0.76%)", up: true, tag: "UP", tone: "green", spark: [23800, 23920, 23890, 24050, 24117.65], timeframe: "Intraday" },
  { name: "SENSEX", value: "77,496.36", change: "+609.45 (+0.79%)", up: true, tag: "UP", tone: "green", spark: [76500, 76900, 76800, 77200, 77496.36], timeframe: "Intraday" },
  { name: "BANKNIFTY", value: "55,403.60", change: "+3.25 (+0.01%)", up: true, tag: "FLAT", tone: "yellow", spark: [55200, 55350, 55100, 55390, 55403.60], timeframe: "Intraday" },
  { name: "INDIA VIX", value: "14.20", change: "-0.40 (-2.74%)", up: false, isVix: true, tag: "COOLING", tone: "green", spark: [15.2, 14.9, 14.6, 14.4, 14.2], timeframe: "Low Vol" },
  { name: "MACRO CONFIDENCE", value: "52 / 100", change: "Neutral Bias", up: undefined, tag: "NEUTRAL", tone: "yellow", spark: [54, 53, 55, 51, 52], timeframe: "Grade B" },
];

const MACRO_COMPOSITION = [
  { label: "GDP Growth Rate", pct: 75, value: "6.8% YoY", subtext: "Target: 6.5–7.0%", status: "Strong", tone: "green", barColor: "var(--accent-teal)" },
  { label: "CPI Inflation", pct: 60, value: "5.1% YoY", subtext: "RBI Tolerance Band: 2–6%", status: "Sticky", tone: "yellow", barColor: "var(--accent-amber)" },
  { label: "System Liquidity", pct: 85, value: "+₹1.62L Cr", subtext: "RBI Net LAF Surplus", status: "Surplus", tone: "green", barColor: "var(--accent-teal)" },
  { label: "FII Net Flow (MTD)", pct: 40, value: "-₹3,247 Cr", subtext: "DII Absorption: +₹4,102 Cr", status: "Outflow", tone: "red", barColor: "var(--accent-red)" },
];

const WHAT_CHANGED = [
  { bearish: true, title: "FII Outflow Surge", text: "FII turned net sellers (-₹3,247 Cr session net)", time: "10 mins ago" },
  { bearish: true, title: "Energy Pressure", text: "Brent crude holding elevated above $85/bbl", time: "1 hr ago" },
  { bearish: true, title: "RBI Policy Stance", text: "RBI commentary highlights sticky food inflation risk", time: "3 hrs ago" },
  { bearish: false, title: "Economic Resilience", text: "India GDP growth prints steady at 6.8% YoY pace", time: "Yesterday" },
  { bearish: false, title: "Fiscal Revenue", text: "GST revenue collections cross record monthly target", time: "2 days ago" },
];

const ADANI_SIGNALS = [
  { tick: "ADANIENT", name: "Adani Enterprises", price: "₹3,142.25", chg: "+1.36%", up: true, tag: "BULLISH", tone: "bullish", spark: [3080, 3100, 3110, 3142] },
  { tick: "ADANIPORTS", name: "Adani Ports & SEZ", price: "₹1,341.10", chg: "+1.40%", up: true, tag: "NEUTRAL", tone: "neutral", spark: [1310, 1325, 1330, 1341] },
  { tick: "ADANIGREEN", name: "Adani Green Energy", price: "₹1,062.70", chg: "+2.48%", up: true, tag: "BULLISH", tone: "bullish", spark: [1020, 1040, 1050, 1062] },
  { tick: "ADANIPOWER", name: "Adani Power", price: "₹597.85", chg: "-0.73%", up: false, tag: "DEFENSIVE", tone: "defensive", spark: [608, 604, 600, 597.85] },
  { tick: "ATGL", name: "Adani Total Gas", price: "₹1,012.45", chg: "+1.39%", up: true, tag: "NEUTRAL", tone: "neutral", spark: [990, 1005, 1008, 1012] },
];

const SECTORS = [
  { name: "NIFTY IT", pct: "+1.42%", up: true, score: 85 },
  { name: "NIFTY FMCG", pct: "+1.18%", up: true, score: 72 },
  { name: "NIFTY REALTY", pct: "+0.97%", up: true, score: 65 },
  { name: "NIFTY BANK", pct: "+0.83%", up: true, score: 58 },
  { name: "NIFTY AUTO", pct: "+0.55%", up: true, score: 48 },
  { name: "NIFTY PHARMA", pct: "+0.12%", up: true, score: 32 },
  { name: "NIFTY METAL", pct: "-0.24%", up: false, score: -24 },
  { name: "NIFTY ENERGY", pct: "-1.05%", up: false, score: -65 },
];

const GAINERS = [
  { name: "Tata Technologies", sym: "TATATECH", price: "₹1,142.50", chg: "+4.12%" },
  { name: "Infosys Limited", sym: "INFY", price: "₹1,542.10", chg: "+2.12%" },
  { name: "HCL Technologies", sym: "HCLTECH", price: "₹1,341.50", chg: "+1.84%" },
  { name: "Wipro Limited", sym: "WIPRO", price: "₹482.40", chg: "+1.72%" },
  { name: "Tata Consultancy", sym: "TCS", price: "₹3,842.00", chg: "+1.10%" },
];

const LOSERS = [
  { name: "Mahindra & Mahindra", sym: "M&M", price: "₹1,942.50", chg: "-2.12%" },
  { name: "Adani Ports & SEZ", sym: "ADANIPORTS", price: "₹1,341.10", chg: "-0.92%" },
  { name: "JSW Steel", sym: "JSWSTEEL", price: "₹842.40", chg: "-0.96%" },
  { name: "BPCL", sym: "BPCL", price: "₹612.30", chg: "-0.68%" },
  { name: "Titan Company", sym: "TITAN", price: "₹3,242.00", chg: "-0.55%" },
];

const VOLUME_SHOCKERS = [
  { name: "Adani Power", sym: "ADANIPOWER", price: "₹597.85", chg: "3.4x Vol" },
  { name: "Tata Motors", sym: "TATAMOTORS", price: "₹982.10", chg: "2.8x Vol" },
  { name: "State Bank of India", sym: "SBIN", price: "₹812.40", chg: "2.5x Vol" },
  { name: "Reliance Industries", sym: "RELIANCE", price: "₹2,980.00", chg: "2.1x Vol" },
  { name: "HDFC Bank", sym: "HDFCBANK", price: "₹1,640.20", chg: "1.9x Vol" },
];

const ALERTS = [
  { title: "ADANI POWER ▼ 1.60%", body: "Crossed −1.5% intraday volatility threshold", meta: "09:14 IST", category: "HIGH RISK", tone: "red" },
  { title: "NSE Pipelines Synchronized", body: "Live telemetry nominal across NSE tick & RBI liquidity feeds", meta: "09:32 IST", category: "SYSTEM OK", tone: "green" },
  { title: "FII Net Outflow Trigger", body: "Active Rule: Notifies when institutional selling exceeds ₹2,000 Cr", meta: "PARAMETRIC", category: "RULE", tone: "yellow" },
];

export default function Home() {
  const [moverTab, setMoverTab] = useState("gainers");

  const moverList = 
    moverTab === "gainers" 
      ? GAINERS 
      : moverTab === "losers" 
      ? LOSERS 
      : VOLUME_SHOCKERS;

  return (
    <Layout>
      {/* ── TOP KPI ROW (5 CARDS) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 16 }}>
        {HOME_KPIS.map((k) => {
          // Color logic: For VIX, dropping is cooling (green), rising is heightened risk (red)
          const isPositive = k.up === true;
          const isNegative = k.up === false;
          const deltaColor = k.isVix 
            ? (isNegative ? "var(--accent-teal)" : "var(--accent-red)")
            : (isPositive ? "var(--accent-teal)" : isNegative ? "var(--accent-red)" : "var(--text-muted)");

          return (
            <Card key={k.name} className="card-hover">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {k.name}
                </span>
                <Badge tone={k.tone}>{k.tag}</Badge>
              </div>

              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--text-primary)", marginTop: 8, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {k.value}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {k.up !== undefined && (
                    <span style={{ color: deltaColor, fontSize: 10, fontWeight: 700 }}>
                      {k.up ? "▲" : "▼"}
                    </span>
                  )}
                  <span style={{ color: deltaColor, fontSize: 11, fontFamily: "var(--mono)", fontWeight: 600 }}>
                    {k.change}
                  </span>
                </div>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, color: "var(--text-micro)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {k.timeframe}
                </span>
              </div>

              <div style={{ marginTop: 10, paddingTop: 4 }}>
                <Sparkline 
                  color={k.tone === "green" ? "var(--accent-teal)" : k.tone === "red" ? "var(--accent-red)" : "var(--accent-amber)"} 
                  points={k.spark} 
                  height={22} 
                  width={140} 
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── MIDDLE ROW: 3 COLUMNS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
        {/* COLUMN 1: MACRO COMPOSITION */}
        <Section title="Macro Health & Fundamental Composition">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
            {MACRO_COMPOSITION.map((m) => (
              <div key={m.label} style={{ background: "rgba(255, 255, 255, 0.02)", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border-default)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontFamily: "var(--font-sans)", color: "var(--text-primary)", fontSize: 12, fontWeight: 600 }}>{m.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--text-primary)", fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700 }}>{m.value}</span>
                    <Badge tone={m.tone}>{m.status}</Badge>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--text-micro)" }}>{m.subtext}</span>
                </div>

                <div style={{ height: 5, background: "rgba(0, 0, 0, 0.2)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${m.pct}%`, height: "100%", background: m.barColor, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* COLUMN 2: WHAT CHANGED */}
        <Section title="Catalysts & Market Shifters">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "2px 0" }}>
            {WHAT_CHANGED.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-default)" }}>
                <span 
                  style={{ 
                    width: 7, 
                    height: 7, 
                    borderRadius: "50%", 
                    background: w.bearish ? "var(--accent-red)" : "var(--accent-teal)", 
                    marginTop: 4, 
                    flexShrink: 0,
                    boxShadow: w.bearish ? "0 0 8px rgba(239, 68, 68, 0.4)" : "0 0 8px rgba(0, 229, 255, 0.4)"
                  }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-sans)", color: "var(--text-primary)", fontSize: 11, fontWeight: 700 }}>{w.title}</span>
                    <span style={{ color: "var(--text-micro)", fontSize: 9, fontFamily: "var(--mono)" }}>{w.time}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", color: "var(--text-secondary)", fontSize: 11, lineHeight: 1.45, marginTop: 2 }}>{w.text}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* COLUMN 3: ADANI SIGNALS */}
        <Section title="Adani Group Intelligence">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ADANI_SIGNALS.map((a) => (
              <div key={a.tick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: 6, borderBottom: "1px solid var(--border-default)" }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "0.02em" }}>{a.tick}</div>
                  <div style={{ color: "var(--text-micro)", fontSize: 10, fontFamily: "var(--font-sans)" }}>{a.name}</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--text-primary)", fontSize: 12, fontFamily: "var(--mono)", fontWeight: 600 }}>{a.price}</div>
                  <div style={{ width: 45, height: 12, marginTop: 2 }}>
                    <Sparkline color={a.up ? "var(--accent-teal)" : "var(--accent-red)"} points={a.spark} height={12} width={45} />
                  </div>
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <span style={{ color: a.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>
                    {a.chg}
                  </span>
                  <Badge tone={a.tone}>{a.tag}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── BOTTOM ROW: 3 COLUMNS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {/* COLUMN 1: SECTOR PERFORMANCE */}
        <Section title="Sector Heat & Relative Strength">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 10px" }}>
            {SECTORS.map((s) => {
              const isLead = s.score > 50;
              const isLag = s.score < 0;
              const bgTint = isLead 
                ? "rgba(0, 229, 255, 0.05)" 
                : isLag 
                ? "rgba(239, 68, 68, 0.05)" 
                : "rgba(255, 255, 255, 0.02)";

              return (
                <div 
                  key={s.name} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "8px 10px", 
                    borderRadius: 6,
                    background: bgTint,
                    border: "1px solid var(--border-default)" 
                  }}
                >
                  <span style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>
                    {s.name}
                  </span>
                  <span style={{ color: s.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>
                    {s.up ? "▲" : "▼"} {s.pct}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* COLUMN 2: TOP MOVERS (WITH SEGMENTED PILL TOGGLES) */}
        <Section
          title="Market Movers & Liquidity"
          actionNode={
            <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.25)", padding: "2px 3px", borderRadius: 6, border: "1px solid var(--border-default)" }}>
              {["gainers", "losers", "volume"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMoverTab(tab)}
                  style={{
                    border: "none",
                    background: moverTab === tab ? "var(--accent-teal)" : "transparent",
                    color: moverTab === tab ? "#05070B" : "var(--text-muted)",
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontSize: 9,
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {moverList.map((m) => (
              <div 
                key={m.sym} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "6px 8px", 
                  borderRadius: 6, 
                  borderBottom: "1px solid var(--border-default)" 
                }}
              >
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{m.sym}</div>
                  <div style={{ color: "var(--text-micro)", fontSize: 10, fontFamily: "var(--font-sans)" }}>{m.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{m.price}</div>
                  <div style={{ 
                    color: moverTab === "gainers" ? "var(--accent-teal)" : moverTab === "losers" ? "var(--accent-red)" : "var(--accent-amber)", 
                    fontSize: 10, 
                    fontFamily: "var(--mono)", 
                    fontWeight: 600 
                  }}>
                    {m.chg}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* COLUMN 3: SYSTEM ALERTS */}
        <Section title="Real-Time Risk & Telemetry Alerts">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "2px 0" }}>
            {ALERTS.map((al, i) => (
              <div key={i} style={{ background: "var(--bg-card)", padding: "10px", borderRadius: 8, border: "1px solid var(--border-default)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-sans)" }}>{al.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Badge tone={al.tone}>{al.category}</Badge>
                    <span style={{ color: "var(--text-micro)", fontSize: 9, fontFamily: "var(--mono)" }}>{al.meta}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-sans)", color: "var(--text-secondary)", fontSize: 11, marginTop: 4, lineHeight: 1.45 }}>
                  {al.body}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </Layout>
  );
}
