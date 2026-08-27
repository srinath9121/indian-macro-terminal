import { useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import Badge from "../components/ui/Badge";
import Sparkline from "../components/charts/Sparkline";
import { useTerminalStore } from "../store/useTerminalStore";

const HOME_KPIS = [
  { name: "NIFTY 50", value: "24,117.65", change: "+181.95 (0.76%)", up: true, tone: "green", spark: [23800, 23920, 23890, 24050, 24117.65] },
  { name: "SENSEX", value: "77,496.36", change: "+609.45 (0.79%)", up: true, tone: "green", spark: [76500, 76900, 76800, 77200, 77496.36] },
  { name: "BANKNIFTY", value: "55,403.60", change: "+3.25 (0.01%)", up: true, tone: "yellow", spark: [55200, 55350, 55100, 55390, 55403.60] },
  { name: "INDIA VIX", value: "14.20", change: "-0.40 (-2.74%)", up: true, tone: "green", spark: [15.2, 14.9, 14.6, 14.4, 14.2] },
  { name: "MACRO CONFIDENCE", value: "52 / 100", change: "Neutral Bias", up: undefined, tone: "yellow", spark: [54, 53, 55, 51, 52] },
];

const MACRO_COMPOSITION = [
  { label: "Growth Momentum", pct: 38, value: "Strong (6.8%)", tone: "green", barColor: "var(--accent-teal)" },
  { label: "Inflation Pressure", pct: 27, value: "Elevated (5.1%)", tone: "red", barColor: "var(--accent-red)" },
  { label: "Liquidity Buffer", pct: 20, value: "Surplus (₹1.62L Cr)", tone: "green", barColor: "var(--accent-teal)" },
  { label: "FII Institutional Flow", pct: 15, value: "-₹3,247 Cr", tone: "red", barColor: "var(--accent-amber)" },
];

const WHAT_CHANGED = [
  { bearish: true, text: "FII turned net sellers (-₹3,247 Cr session net)", time: "Today" },
  { bearish: true, text: "Brent crude holding elevated above $85/bbl", time: "1d ago" },
  { bearish: true, text: "RBI commentary highlights sticky food inflation", time: "2d ago" },
  { bearish: false, text: "India GDP growth continues at 6.8% YoY pace", time: "This week" },
  { bearish: false, text: "GST revenue collections reach new monthly high", time: "This week" },
];

const ADANI_SIGNALS = [
  { tick: "ADANIENT", price: "₹3,142.25", chg: "+1.36%", up: true, tag: "BULLISH", tone: "green", spark: [3080, 3100, 3110, 3142] },
  { tick: "ADANIPORTS", price: "₹1,341.10", chg: "+1.40%", up: true, tag: "NEUTRAL", tone: "yellow", spark: [1310, 1325, 1330, 1341] },
  { tick: "ADANIGREEN", price: "₹1,062.70", chg: "+2.48%", up: true, tag: "BULLISH", tone: "green", spark: [1020, 1040, 1050, 1062] },
  { tick: "ADANIPOWER", price: "₹597.85", chg: "-0.73%", up: false, tag: "DEFENSIVE", tone: "red", spark: [608, 604, 600, 597.85] },
  { tick: "ATGL", price: "₹1,012.45", chg: "+1.39%", up: true, tag: "NEUTRAL", tone: "yellow", spark: [990, 1005, 1008, 1012] },
];

const SECTORS = [
  { name: "NIFTY IT", pct: "+1.42%", up: true },
  { name: "NIFTY FMCG", pct: "+1.18%", up: true },
  { name: "NIFTY BANK", pct: "+0.83%", up: true },
  { name: "NIFTY AUTO", pct: "+0.55%", up: true },
  { name: "NIFTY METAL", pct: "-0.24%", up: false },
  { name: "NIFTY PHARMA", pct: "+0.12%", up: true },
  { name: "NIFTY REALTY", pct: "+0.97%", up: true },
  { name: "NIFTY ENERGY", pct: "-1.05%", up: false },
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

const ALERTS = [
  { title: "ADANI POWER ▼ 1.60%", body: "Crossed −1.5% intraday alert threshold", meta: "09:14 IST", tone: "red" },
  { title: "Terminal Operational", body: "Live data pipelines nominal across NSE & RBI feeds", meta: "09:32 IST", tone: "green" },
  { title: "FII Selling Alert Active", body: "Triggers when institutional net exceeds ₹2,000 Cr", meta: "Standing Rule", tone: "yellow" },
];

export default function Home() {
  const [moverTab, setMoverTab] = useState("gainers");
  const moverList = moverTab === "gainers" ? GAINERS : LOSERS;

  return (
    <Layout>
      {/* ── TOP KPI ROW (5 CARDS) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 16 }}>
        {HOME_KPIS.map((k) => (
          <Card key={k.name} className="card-hover">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="type-label" style={{ fontSize: 9, color: "var(--text-muted)" }}>{k.name}</div>
              <Badge tone={k.tone}>{k.up === false ? "DOWN" : k.up === true ? "UP" : "NEUTRAL"}</Badge>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--text-primary)", marginTop: 6, lineHeight: 1.1 }}>
              {k.value}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              {k.up !== undefined && (
                <span style={{ color: k.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 10, fontWeight: 700 }}>
                  {k.up ? "▲" : "▼"}
                </span>
              )}
              <span style={{ color: k.up === undefined ? "var(--text-muted)" : k.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600 }}>
                {k.change}
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <Sparkline color={k.up ? "var(--accent-teal)" : k.up === false ? "var(--accent-red)" : "var(--accent-amber)"} points={k.spark} height={20} width={120} />
            </div>
          </Card>
        ))}
      </div>

      {/* ── MIDDLE ROW: 3 COLUMNS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
        {/* COLUMN 1: MACRO COMPOSITION */}
        <Section title="MACRO HEALTH & COMPOSITION">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0" }}>
            {MACRO_COMPOSITION.map((m) => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ color: "var(--text-primary)", fontSize: 11, fontWeight: 600 }}>{m.label}</span>
                  <span style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{m.value}</span>
                </div>
                <div style={{ height: 4, background: "var(--border-default)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${m.pct * 2}%`, height: "100%", background: m.barColor, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* COLUMN 2: WHAT CHANGED */}
        <Section title="CATALYSTS & WHAT CHANGED">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "2px 0" }}>
            {WHAT_CHANGED.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border-default)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: w.bearish ? "var(--accent-red)" : "var(--accent-teal)", marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: 11, lineHeight: 1.4 }}>{w.text}</div>
                  <div style={{ color: "var(--text-micro)", fontSize: 9, fontFamily: "var(--mono)", marginTop: 1 }}>{w.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* COLUMN 3: ADANI SIGNALS */}
        <Section title="ADANI GROUP INTELLIGENCE">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ADANI_SIGNALS.map((a) => (
              <div key={a.tick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border-default)" }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{a.tick}</div>
                  <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)" }}>{a.price}</div>
                </div>
                <div style={{ width: 45, height: 16 }}>
                  <Sparkline color={a.up ? "var(--accent-teal)" : "var(--accent-red)"} points={a.spark} height={16} width={45} />
                </div>
                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: a.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600 }}>{a.chg}</span>
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
        <Section title="SECTOR PERFORMANCE">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
            {SECTORS.map((s) => (
              <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border-default)" }}>
                <span style={{ color: "var(--text-primary)", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: s.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700 }}>
                  {s.up ? "▲" : "▼"} {s.pct}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* COLUMN 2: TOP MOVERS (WITH TABS) */}
        <Section
          title="MARKET MOVERS"
          action={() => setMoverTab(moverTab === "gainers" ? "losers" : "gainers")}
          actionLabel={moverTab === "gainers" ? "Show Losers" : "Show Gainers"}
        >
          {moverList.map((m) => (
            <div key={m.sym} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border-default)" }}>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{m.sym}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 9 }}>{m.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{m.price}</div>
                <div style={{ color: moverTab === "gainers" ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600 }}>
                  {m.chg}
                </div>
              </div>
            </div>
          ))}
        </Section>

        {/* COLUMN 3: SYSTEM ALERTS */}
        <Section title="LIVE SYSTEM & RISK ALERTS">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "2px 0" }}>
            {ALERTS.map((al, i) => (
              <div key={i} style={{ background: "var(--bg-card)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-default)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>{al.title}</span>
                  <Badge tone={al.tone}>{al.meta}</Badge>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 10, marginTop: 3, lineHeight: 1.4 }}>{al.body}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </Layout>
  );
}
