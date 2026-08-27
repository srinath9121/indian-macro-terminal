import { useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import Badge from "../components/ui/Badge";
import Sparkline from "../components/charts/Sparkline";
import { useTerminalStore } from "../store/useTerminalStore";

const KPIS = [
  { name: "GDP GROWTH (YoY)", value: "6.8%", change: "+0.4%", up: true, sub: "Q4 FY24", tone: "green", spark: [5.2, 5.8, 6.1, 6.3, 6.8] },
  { name: "CPI INFLATION", value: "5.1%", change: "+0.2%", up: false, sub: "Apr 2024", tone: "red", spark: [4.2, 4.6, 4.9, 4.8, 5.1] },
  { name: "RBI REPO RATE", value: "6.50%", change: "0.0%", up: undefined, sub: "Current Rate", tone: "yellow", spark: [6.5, 6.5, 6.5, 6.5, 6.5] },
  { name: "IIP GROWTH", value: "3.2%", change: "+0.8%", up: true, sub: "Mar 2024", tone: "green", spark: [2.1, 2.4, 2.8, 2.9, 3.2] },
  { name: "SYSTEM LIQUIDITY", value: "₹1.62L Cr", change: "+12.4%", up: true, sub: "Surplus", tone: "green", spark: [1.1, 1.2, 1.4, 1.5, 1.62] },
];

const YIELDS = [
  { tenor: "3M G-SEC", current: "6.52%", chg: "+2 bps", up: false, spark: [6.48, 6.50, 6.51, 6.52] },
  { tenor: "1Y G-SEC", current: "6.63%", chg: "+2 bps", up: false, spark: [6.59, 6.61, 6.62, 6.63] },
  { tenor: "5Y G-SEC", current: "6.98%", chg: "+4 bps", up: false, spark: [6.92, 6.94, 6.96, 6.98] },
  { tenor: "10Y BENCHMARK", current: "7.12%", chg: "+6 bps", up: false, hot: true, spark: [7.04, 7.08, 7.10, 7.12] },
];

const FX_PAIRS = [
  { pair: "USD / INR", value: "83.24", chg: "+0.18%", up: false, rangePos: 78, low52: "82.80", high52: "83.65" },
  { pair: "EUR / INR", value: "90.12", chg: "+0.35%", up: false, rangePos: 55, low52: "88.20", high52: "92.40" },
  { pair: "GBP / INR", value: "105.42", chg: "-0.27%", up: true, rangePos: 40, low52: "103.50", high52: "108.10" },
  { pair: "JPY / INR (100)", value: "54.18", chg: "-0.45%", up: true, rangePos: 25, low52: "53.20", high52: "58.90" },
];

const CALENDAR = [
  { date: "JUL 14", name: "CPI Inflation Release", days: "15d left", dot: "var(--accent-teal)" },
  { date: "JUL 29", name: "US FOMC Rate Decision", days: "30d left", dot: "var(--accent-amber)" },
  { date: "JUL 30", name: "Nifty Monthly Expiry", days: "31d left", dot: "var(--accent-blue)" },
  { date: "AUG 06", name: "RBI MPC Policy Decision", days: "38d left", dot: "var(--accent-purple)" },
  { date: "AUG 13", name: "WPI & IIP Print", days: "45d left", dot: "var(--text-muted)" },
];

const MACRO_DRIVERS = [
  { label: "BRENT CRUDE OIL", value: "$85.12", chg: "-0.53%", up: true, impact: "FAVORABLE", tone: "green" },
  { label: "US 10Y YIELD", value: "4.42%", chg: "+4 bps", up: false, impact: "HEADWIND", tone: "red" },
  { label: "DOLLAR INDEX (DXY)", value: "104.85", chg: "+0.12%", up: false, impact: "NEUTRAL", tone: "yellow" },
  { label: "GOLD (10G / INR)", value: "₹71,850", chg: "+0.45%", up: true, impact: "STABLE", tone: "blue" },
];

export default function Macro() {
  const { macroData } = useTerminalStore();

  return (
    <Layout>
      {/* ── TOP KPI ROW (5 CARDS) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 16 }}>
        {KPIS.map((k) => (
          <Card key={k.name} className="card-hover">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="type-label" style={{ fontSize: 9, color: "var(--text-muted)" }}>{k.name}</div>
              <Badge tone={k.tone}>{k.sub}</Badge>
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
        {/* COLUMN 1: G-SEC YIELDS */}
        <Section title="SOVEREIGN BOND YIELDS">
          {YIELDS.map((y) => (
            <div key={y.tenor} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border-default)" }}>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{y.tenor}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 9, marginTop: 1 }}>Govt of India Security</div>
              </div>
              <div style={{ width: 45, height: 16 }}>
                <Sparkline color="var(--accent-blue)" points={y.spark} height={16} width={45} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)" }}>{y.current}</div>
                <div style={{ color: "var(--accent-red)", fontSize: 10, fontFamily: "var(--mono)" }}>{y.chg}</div>
              </div>
            </div>
          ))}
        </Section>

        {/* COLUMN 2: FOREIGN EXCHANGE */}
        <Section title="FOREIGN EXCHANGE (INR)">
          {FX_PAIRS.map((fx) => (
            <div key={fx.pair} style={{ padding: "8px 0", borderBottom: "1px solid var(--border-default)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{fx.pair}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)" }}>{fx.value}</span>
                  <span style={{ color: fx.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600 }}>
                    {fx.chg}
                  </span>
                </div>
              </div>
              {/* Range bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ color: "var(--text-micro)", fontSize: 8, fontFamily: "var(--mono)" }}>{fx.low52}</span>
                <div style={{ flex: 1, position: "relative", height: 3, background: "var(--border-default)", borderRadius: 2 }}>
                  <div style={{ position: "absolute", left: `${fx.rangePos}%`, top: -3, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-blue)", transform: "translateX(-50%)", boxShadow: "0 0 4px var(--accent-blue)" }} />
                </div>
                <span style={{ color: "var(--text-micro)", fontSize: 8, fontFamily: "var(--mono)" }}>{fx.high52}</span>
              </div>
            </div>
          ))}
        </Section>

        {/* COLUMN 3: MACRO SENTIMENT & LIQUIDITY */}
        <Section title="MACRO STANCE & SENTIMENT">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-default)" }}>
              <div>
                <div className="type-label" style={{ fontSize: 9 }}>COMPOSITE MACRO SCORE</div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--mono)", color: "var(--text-primary)", marginTop: 2 }}>
                  52<span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>/100</span>
                </div>
              </div>
              <Badge tone="yellow">NEUTRAL STANCE</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--mono)" }}>
                <span style={{ color: "var(--text-muted)" }}>Growth Factor</span>
                <span style={{ color: "var(--accent-teal)", fontWeight: 700 }}>STRONG (+6.8%)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--mono)" }}>
                <span style={{ color: "var(--text-muted)" }}>Inflation Factor</span>
                <span style={{ color: "var(--accent-red)", fontWeight: 700 }}>ELEVATED (5.1%)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--mono)" }}>
                <span style={{ color: "var(--text-muted)" }}>Liquidity Buffer</span>
                <span style={{ color: "var(--accent-teal)", fontWeight: 700 }}>SURPLUS (₹1.62L Cr)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--mono)" }}>
                <span style={{ color: "var(--text-muted)" }}>FX Resilience</span>
                <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>STABLE ($650B+ Res.)</span>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ── BOTTOM ROW: 3 COLUMNS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {/* COLUMN 1: EXTERNAL MACRO DRIVERS */}
        <Section title="GLOBAL SPILLOVER DRIVERS">
          {MACRO_DRIVERS.map((d) => (
            <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border-default)" }}>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{d.label}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 9, marginTop: 1 }}>{d.chg} today</div>
              </div>
              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)" }}>{d.value}</div>
                <Badge tone={d.tone}>{d.impact}</Badge>
              </div>
            </div>
          ))}
        </Section>

        {/* COLUMN 2: UPCOMING MACRO EVENTS */}
        <Section title="MACRO CALENDAR & CATALYSTS">
          {CALENDAR.map((c) => (
            <div key={c.date + c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border-default)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--sans)", fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 9, fontFamily: "var(--mono)", marginTop: 1 }}>{c.date}</div>
                </div>
              </div>
              <Badge tone="blue">{c.days}</Badge>
            </div>
          ))}
        </Section>

        {/* COLUMN 3: RBI POLICY & MONETARY TRAJECTORY */}
        <Section title="RBI POLICY TRAJECTORY">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--mono)" }}>Stance</span>
              <span style={{ color: "var(--text-primary)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>Withdrawal of Accommodation</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--mono)" }}>Next MPC Meeting</span>
              <span style={{ color: "var(--accent-blue)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>August 6-8, 2024</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--mono)" }}>Rate Cut Probability (2024)</span>
              <span style={{ color: "var(--accent-amber)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>35% (Delayed)</span>
            </div>
            <div style={{ background: "var(--bg-card)", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-default)", marginTop: 4 }}>
              <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>MPC Consensus</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>
                4:2 vote to maintain status quo at 6.50%. Food inflation remains key watch point.
              </div>
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  );
}
