import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Badge from "../components/ui/Badge";
import Sparkline from "../components/charts/Sparkline";
import Globe from "../components/globe/Globe";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { useTerminalStore } from "../store/useTerminalStore";
import ParticleBackground from '../components/ParticleBackground';

function ScoreCard({ title, label, labelColor, value, sub, sparkData, sparkColor }) {
  return (
    <div className="card-hover" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "16px 18px", flex: 1, minWidth: 0 }}>
      <div className="type-label" style={{ marginBottom: 8 }}>{title}</div>
      <div style={{ color: labelColor || "var(--accent-teal)", fontSize: "3rem", fontWeight: 700, fontFamily: "var(--mono)", lineHeight: 1 }}>{label}</div>
      {value && <div className="type-body" style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: "0.75rem", fontFamily: "var(--sans)" }}>{value}</div>}
      {sub && <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      <div style={{ marginTop: 8 }}><Sparkline color={sparkColor || "var(--accent-teal)"} points={sparkData || [3,5,4,6,5,7,6]} height={28} width={80} /></div>
    </div>
  );
}

function MarketBiasCard({ state, confidence }) {
  const color = state === "BULLISH" ? "var(--accent-teal)" : state === "DEFENSIVE" ? "var(--accent-red)" : "var(--accent-amber)";
  return (
    <div className="card-hover" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "16px 18px", flex: 1, minWidth: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <div className="type-label">MARKET BIAS</div>
      <div style={{ color, fontSize: "3rem", fontWeight: 900, fontFamily: "var(--mono)", letterSpacing: 1, lineHeight: 1 }}>{state || "CALCULATING"}</div>
      <div className="type-body" style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--sans)" }}>Confidence: {confidence ?? 0}%</div>
    </div>
  );
}

function AdaniCard({ ticker, price, change, signal, conf }) {
  const isNeg = change < 0;
  const sc = { DEFENSIVE: "var(--accent-red)", NEUTRAL: "var(--accent-amber)", BULLISH: "var(--accent-teal)" };
  const sColor = sc[signal] || "var(--text-muted)";
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "10px 12px", flex: 1, minWidth: 120 }}>
      <div style={{ color: "var(--text-secondary)", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, fontFamily: "var(--mono)" }}>{ticker}</div>
      <div style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", marginTop: 2 }}>₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
      <div style={{ color: isNeg ? "var(--accent-red)" : "var(--accent-teal)", fontSize: 10, fontFamily: "var(--mono)" }}>{isNeg ? "" : "+"}{change}%</div>
      <Sparkline color={isNeg ? "var(--accent-red)" : "var(--accent-teal)"} points={isNeg ? [9,8,7,6,7,5,4] : [4,5,6,5,6,7,6]} height={28} width={90} />
      <div style={{ background: `${sColor}22`, color: sColor, border: `1px solid ${sColor}55`, borderRadius: 4, fontSize: 9, fontWeight: 700, textAlign: "center", padding: "2px 0", marginTop: 4, fontFamily: "var(--mono)" }}>{signal}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 9, textAlign: "center", marginTop: 2, fontFamily: "var(--mono)" }}>Conf: {conf}%</div>
    </div>
  );
}

export default function Pulse() {
  const navigate = useNavigate();
  const { marketData, macroData, adaniStocks, globalSignal, alertsData, isLoading } = useTerminalStore();

  const [fiiData, setFiiData] = useState(null);
  useEffect(() => {
    fetch('/api/fii-history').then(r => r.json()).then(d => setFiiData(d)).catch(() => {});
    const id = setInterval(() => {
      fetch('/api/fii-history').then(r => r.json()).then(d => setFiiData(d)).catch(() => {});
    }, 300000);
    return () => clearInterval(id);
  }, []);

  if (isLoading && !marketData) {
    return <Layout><div style={{ display: "flex", height: "80vh", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>CONNECTING TO TERMINAL...</div></Layout>;
  }

  const fiiUnavailable = fiiData?.unavailable === true;
  const fiiNet   = fiiUnavailable ? null : (fiiData?.fii?.net ?? marketData?.fiiFlows?.netValue ?? null);
  const fiiTrend = fiiUnavailable
    ? "unavailable"
    : fiiNet != null
      ? (fiiNet >= 0 ? "inflow" : "outflow")
      : (marketData?.fiiFlows?.trend ?? "neutral");
  const fiiNetDisplay = fiiUnavailable
    ? "DATA UNAVAIL"
    : fiiNet != null
      ? `${fiiNet >= 0 ? "+" : ""}₹${Math.abs(fiiNet).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`
      : "--";

  const gdp = macroData?.gdp ?? {};
  const inflation = macroData?.inflation ?? {};
  const liquidity = macroData?.liquidity ?? {};
  const signalState = globalSignal?.state || "NEUTRAL";
  const signalConf = globalSignal?.confidence ?? 50;
  const causalChain = globalSignal?.causal_chain || ["Macro Stable", "Inflation ↓", "RBI Pause", "Growth ↑", "Market ↑"];

  const stocks = (adaniStocks || []).slice(0, 5);
  const liveAlerts = alertsData?.alerts?.slice(0, 3) || [
    { title: "Correlation Spike Detected", description: "Adani group correlation above 0.85", priority: "High", timestamp: new Date().toISOString() },
    { title: "FII Outflow Continues", description: "Net FII selling 3rd day", priority: "Medium", timestamp: new Date().toISOString() },
    { title: "Oil Price Surge", description: "Brent crude above $85/barrel", priority: "High", timestamp: new Date().toISOString() },
  ];
  const whatChanged = [
    { icon: "🔴", text: "FII turned net sellers after 5 weeks" },
    { icon: "🔴", text: "Brent crude crossed $85/barrel" },
    { icon: "🔴", text: "RBI commentary turned slightly hawkish" },
    { icon: "🟢", text: "India CPI came in higher than expected" },
    { icon: "🟢", text: "US 10Y bond yield moved above 4.6%" },
  ];

  const marketCards = [
    { label: "NIFTY 50", val: marketData?.nifty?.price, chg: marketData?.nifty?.change, pct: marketData?.nifty?.pct_change, up: (marketData?.nifty?.pct_change ?? 0) >= 0 },
    { label: "SENSEX", val: marketData?.sensex?.price, chg: marketData?.sensex?.change, pct: marketData?.sensex?.pct_change, up: (marketData?.sensex?.pct_change ?? 0) >= 0 },
    { label: "NIFTY BANK", val: marketData?.bank_nifty?.price, chg: marketData?.bank_nifty?.change, pct: marketData?.bank_nifty?.pct_change, up: (marketData?.bank_nifty?.pct_change ?? 0) >= 0 },
    { label: "INDIA VIX", val: marketData?.vix?.price, chg: marketData?.vix?.change, pct: marketData?.vix?.pct_change, up: (marketData?.vix?.pct_change ?? 0) >= 0 },
  ];

  const CACHED_FALLBACKS = {};

  const formatAlert = (alert) => {
    const title = alert.title || "";
    const desc = alert.description || "";
    const symbolMap = {
      "ADANIENT.NS": "ADANI ENTERPRISES",
      "ADANIPORTS.NS": "ADANI PORTS",
      "ADANIPOWER.NS": "ADANI POWER",
      "ADANIGREEN.NS": "ADANI GREEN",
      "ATGL.NS": "ADANI TOTAL GAS",
      "ADANIWILM.NS": "ADANI WILMAR",
      "ADANIENSOL.NS": "ADANI ENERGY SOLUTIONS"
    };

    const match = title.match(/([A-Z0-9.]+)\s*[-—]\s*Price fluctuation\s*([+-]?\d+\.?\d*%?)/i);
    if (match) {
      const ticker = match[1];
      const pct = match[2];
      const name = symbolMap[ticker] || ticker.replace(".NS", "");
      const isPositive = !pct.includes("-");
      return {
        line1: (
          <div style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700 }}>
            <span>{name}</span>
            <span style={{ color: isPositive ? "var(--accent-teal)" : "var(--accent-red)" }}>{pct}</span>
          </div>
        ),
        line2: `Crossed ${pct} alert threshold - just now`
      };
    }

    return {
      line1: <span style={{ color: "var(--text-primary)", fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600 }}>{title}</span>,
      line2: desc
    };
  };

  return (
    <Layout>
      <ParticleBackground />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-fade-in">

        {/* Row 1: Scoreboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="type-label">INDIA MACRO SCOREBOARD</span>
            <Badge color="green">LIVE</Badge>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <ScoreCard title="GROWTH" label={gdp.status || "Strong"} labelColor="var(--accent-teal)" value={gdp.value ? `${gdp.value}% GDP Forecast` : "6.8% GDP Forecast"} sparkData={[3,4,5,4,6,5,7]} sparkColor="var(--accent-teal)" />
            <ScoreCard title="INFLATION" label={inflation.status || "Rising"} labelColor="var(--accent-red)" value={inflation.value ? `${inflation.value}% CPI YoY` : "5.1% CPI YoY"} sparkData={[4,5,5,6,6,7,7]} sparkColor="var(--accent-red)" />
            <ScoreCard title="LIQUIDITY" label={liquidity.status || "Tightening"} labelColor="var(--accent-amber)" value="System Liquidity" sparkData={[6,5,5,4,4,3,3]} sparkColor="var(--accent-amber)" />
            <ScoreCard 
              title="FII FLOW" 
              label={fiiNetDisplay} 
              labelColor={fiiTrend === "outflow" ? "var(--accent-red)" : fiiTrend === "unavailable" ? "var(--text-muted)" : "var(--accent-teal)"} 
              value={fiiTrend === "outflow" ? "NET OUTFLOW" : fiiTrend === "unavailable" ? "DATA UNAVAILABLE" : "NET INFLOW"} 
              sparkData={fiiTrend === "outflow" ? [5,4,4,3,4,3,2] : [2,3,4,3,5,4,6]} 
              sparkColor={fiiTrend === "outflow" ? "var(--accent-red)" : fiiTrend === "unavailable" ? "var(--text-muted)" : "var(--accent-teal)"} 
            />
            <MarketBiasCard state={signalState} confidence={signalConf} />
          </div>
        </div>

        {/* Row 2: What Changed + Adani + Alerts */}
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: "0 0 220px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 14 }}>
            <div className="type-label" style={{ marginBottom: 2 }}>WHAT CHANGED THIS WEEK?</div>
            <div className="type-micro" style={{ marginBottom: 8 }}>Updated: Today</div>
            <div style={{ display: "flex", gap: 10, fontSize: 8, fontFamily: "var(--sans)", color: "var(--text-muted)", marginBottom: 10 }}>
              <span style={{ color: "var(--accent-red)" }}>● Bearish signal</span>
              <span style={{ color: "var(--accent-teal)" }}>● Bullish signal</span>
            </div>
            {whatChanged.map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 10 }}>{it.icon}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: 10, fontFamily: "var(--sans)" }}>{it.text}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="type-label">ADANI GROUP SIGNALS</span>
              <button onClick={() => navigate("/adani-intel")} style={{ background: "none", border: "none", color: "var(--accent-blue)", fontSize: 10, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600 }}>View All</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {stocks.map(s => (
                <AdaniCard key={s.symbol} ticker={s.symbol} price={s.price} change={s.pct_change} signal={s.conf > 60 ? "BULLISH" : s.conf < 50 ? "DEFENSIVE" : "NEUTRAL"} conf={s.conf} />
              ))}
            </div>
          </div>

          <div style={{ flex: "0 0 300px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="type-label">LIVE ALERTS</span>
              <button onClick={() => navigate("/alerts")} style={{ background: "none", border: "none", color: "var(--accent-blue)", fontSize: 10, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600 }}>View All</button>
            </div>
            {liveAlerts.map((a, i) => {
              const formatted = formatAlert(a);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, paddingBottom: 10, borderBottom: i < liveAlerts.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{a.priority === "High" ? "🔴" : "🟡"}</span>
                    <div>
                      {formatted.line1}
                      <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 2 }}>{formatted.line2}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 3: Market Snapshot (Full Width) */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="type-label">MARKET SNAPSHOT</span>
            <div style={{ color: "var(--accent-teal)", fontSize: 9, fontFamily: "var(--mono)" }}>Updated: Live</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {marketCards.map(c => (
              <div key={c.label} style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "10px" }}>
                <div className="type-label" style={{ fontSize: 9 }}>{c.label}</div>
                {c.val != null ? (
                  <>
                    <div className="type-hero" style={{ margin: "4px 0", fontSize: 22 }}>{Number(c.val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    <div style={{ color: c.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 9, fontFamily: "var(--mono)" }}>{c.up ? "▲" : "▼"} {c.chg ?? 0} ({c.pct ?? 0}%)</div>
                    <div style={{ marginTop: 6 }}><Sparkline color={c.up ? "var(--accent-teal)" : "var(--accent-red)"} points={c.up ? [3,4,3,5,4,6,5] : [6,5,6,4,5,3,4]} height={24} width={70} /></div>
                  </>
                ) : CACHED_FALLBACKS[c.label] ? (
                  <>
                    <div style={{ color: "var(--text-muted)", fontSize: 22, fontWeight: 700, fontFamily: "var(--mono)", margin: "4px 0" }}>
                      {Number(CACHED_FALLBACKS[c.label].price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                    <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 4 }}>
                      STALE - {CACHED_FALLBACKS[c.label].time}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ color: "var(--text-muted)", fontSize: 22, fontWeight: 700, fontFamily: "var(--mono)", margin: "4px 0" }}>
                      —
                    </div>
                    <div className="type-micro" style={{ color: "var(--accent-amber)", marginTop: 4 }}>
                      checking...
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Row 4: Causal Chain in Focus (Full Width with 24px top margin) */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 14, marginTop: 24 }}>
          <div className="type-label" style={{ marginBottom: 12 }}>CAUSAL CHAIN IN FOCUS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {causalChain.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "8px 14px", textAlign: "center", minWidth: 80 }}>
                  <div style={{ color: "var(--text-secondary)", fontSize: 9, fontFamily: "var(--mono)", lineHeight: 1.3, fontWeight: 600 }}>{step}</div>
                </div>
                {i < causalChain.length - 1 && <span style={{ color: "var(--accent-teal)", fontSize: 14, fontWeight: 700 }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Row 5: AI Summary below Causal Chain with Accent Left Border */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderLeft: "3px solid var(--accent-blue)", borderRadius: 8, padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="type-label" style={{ color: "var(--accent-blue)" }}>AI SUMMARY</span>
            <Badge color="blue">BETA</Badge>
          </div>
          <p className="type-body" style={{ margin: 0 }}>
            {globalSignal?.reasons?.length > 0
              ? globalSignal.reasons.join(". ") + "."
              : "The market remains under pressure with high correlation across the Adani group, weak flows, and a defensive macro backdrop. Short-term bias remains cautious."}
          </p>
        </div>

        {/* Ticker Strip */}
        <div style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-default)", padding: "6px 20px", display: "flex", gap: 32, alignItems: "center", overflowX: "auto", margin: "0 -20px", paddingLeft: 20 }}>
          <span style={{ color: "var(--text-micro)", fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: 1, flexShrink: 0 }}>LIVE MARKET TICKER</span>
          {[
            { l: "NIFTY", v: marketData?.nifty?.price, c: marketData?.nifty?.change, p: marketData?.nifty?.pct_change },
            { l: "SENSEX", v: marketData?.sensex?.price, c: marketData?.sensex?.change, p: marketData?.sensex?.pct_change },
            { l: "BANKNIFTY", v: marketData?.bank_nifty?.price, c: marketData?.bank_nifty?.change, p: marketData?.bank_nifty?.pct_change },
            { l: "USD/INR", v: macroData?.usd_inr?.price, c: macroData?.usd_inr?.change, p: macroData?.usd_inr?.pct_change },
            { l: "CRUDE", v: macroData?.brent_crude?.price, c: macroData?.brent_crude?.change, p: macroData?.brent_crude?.pct_change },
          ].map(it => {
            const up = (it.p ?? 0) >= 0;
            return (
              <div key={it.l} style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--mono)" }}>{it.l}</span>
                <span style={{ color: "var(--text-primary)", fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)" }}>{it.v ?? "--"}</span>
                <span style={{ color: up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 10, fontFamily: "var(--mono)" }}>{up ? "▲" : "▼"} {it.c ?? 0} ({it.p ?? 0}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
