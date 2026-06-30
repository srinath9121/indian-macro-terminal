import React, { useState, useEffect } from 'react';
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Section from "../components/ui/Section";
import { useTerminalStore } from "../store/useTerminalStore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function AdaniStockCard({ stock, isStale }) {
  const dangerScore = 100 - stock.conf;
  
  // Enforce --accent-purple (#A78BFA) theme for Adani watch indicators
  const purpleColor = "var(--accent-purple)";
  
  // If last fetch was >4h ago, show confidence badge as amber (yellow), else signal color
  const badgeColor = isStale ? 'yellow' : (stock.decision === 'BUY' ? 'green' : stock.decision === 'SELL' ? 'red' : 'yellow');
  const badgeText = isStale ? 'DECAY' : stock.decision;

  return (
    <Card key={stock.symbol} style={{ borderLeft: `4px solid ${purpleColor}` }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, fontFamily: "var(--mono)", textTransform: "uppercase" }}>{stock.symbol}</div>
            <div style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, fontFamily: "var(--mono)", marginTop: 2 }}>₹{Number(stock.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          </div>
          <Badge color={badgeColor}>{badgeText}</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "var(--mono)" }}>
            <span style={{ color: "var(--text-muted)" }}>DANGER SCORE</span>
            <span style={{ color: purpleColor, fontWeight: 700 }}>{dangerScore}/100</span>
          </div>
          <div style={{ height: 4, width: "100%", background: "var(--border-default)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${dangerScore}%`, background: purpleColor, transition: "width 0.5s ease-out" }} />
          </div>
        </div>

        <div style={{ color: "var(--text-secondary)", fontSize: 9, fontFamily: "var(--mono)", fontStyle: "italic", lineHeight: 1.4, borderTop: "1px solid var(--border-default)", paddingTop: 10 }}>
          {stock.causalChain || "Analyzing macro transmission..."}
        </div>
      </div>
    </Card>
  );
}

export default function AdaniIntel() {
  const { adaniStocks, globalSignal, lastUpdated, isLoading } = useTerminalStore();

  if (isLoading && adaniStocks.length === 0) {
    return (
      <Layout>
        <div style={{ display: "flex", height: "80vh", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--mono)", fontSize: 13 }}>CONNECTING TO ADANI ECOSYSTEM MONITOR...</div>
      </Layout>
    );
  }

  // Decay check: if >4 hours stale
  const isStale = lastUpdated ? (Date.now() - new Date(lastUpdated).getTime() > 4 * 3600 * 1000) : false;

  const adaniSymbols = ["ADANIENT", "ADANIPORTS", "ADANIGREEN", "ADANIPOWER", "ATGL"];
  const correlations = [
    [1.00, 0.91, 0.78, 0.65, 0.54],
    [0.91, 1.00, 0.82, 0.70, 0.60],
    [0.78, 0.82, 1.00, 0.88, 0.72],
    [0.65, 0.70, 0.88, 1.00, 0.68],
    [0.54, 0.60, 0.72, 0.68, 1.00]
  ];

  const promoterData = [
    { q: "Q3 FY24", val: 72.6 },
    { q: "Q4 FY24", val: 72.6 },
    { q: "Q1 FY25", val: 71.9 },
    { q: "Q2 FY25", val: 71.2 },
    { q: "Q3 FY25", val: 69.8 },
    { q: "Q4 FY25", val: 68.2 },
    { q: "Q1 FY26", val: 67.5 },
    { q: "Q2 FY26", val: 66.8 }
  ];

  const regulatoryFeed = [
    { date: "15 Jun 2026", source: "SEBI", title: "Investigation order into Adani minimum public shareholding criteria compliance." },
    { date: "12 Jun 2026", source: "Supreme Court", title: "Adani Power tariff surcharge dispute appeal accepted for hearing." },
    { date: "08 Jun 2026", source: "SAT", title: "SAT stays SEBI disclosure penalty on Adani Green Energy." },
    { date: "02 Jun 2026", source: "SEBI", title: "Show cause notice issued to Adani Ports on related party transactions." },
    { date: "28 May 2026", source: "NCLAT", title: "Approval of Adani Power's acquisition plan for Coastal Energen." }
  ];

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-fade-in">
        
        {/* Header Block (Section 4.4 Header spec) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: 12 }}>
          <div>
            <div className="type-hero" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>ADANI ECOSYSTEM MONITOR</div>
            <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 4 }}>Watching 10 entities · 6 watchlists active</div>
          </div>
          <Badge color={isStale ? "yellow" : "purple"}>{isStale ? "STALE DATA" : "ACTIVE MONITORING"}</Badge>
        </div>

        {/* Adani Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {adaniStocks.map((stock) => (
            <AdaniStockCard key={stock.symbol} stock={stock} isStale={isStale} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
          
          {/* Section 4.4 Correlation Matrix */}
          <Section title="ADANI GROUP CROSS-CORRELATION MATRIX">
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                    <th style={{ padding: 8, color: "var(--text-muted)", fontSize: 9, fontFamily: "var(--mono)" }}>TICKER</th>
                    {adaniSymbols.map(sym => (
                      <th key={sym} style={{ padding: 8, color: "var(--text-muted)", fontSize: 9, fontFamily: "var(--mono)" }}>{sym.replace("ADANI", "")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlations.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: "1px solid var(--border-default)" }}>
                      <td style={{ padding: 8, color: "var(--text-primary)", fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700, textAlign: "left" }}>{adaniSymbols[rIdx]}</td>
                      {row.map((val, cIdx) => {
                        const isHigh = val >= 0.85 && rIdx !== cIdx;
                        const cellColor = isHigh ? "var(--accent-purple)" : (val >= 0.70 ? "var(--accent-amber)" : "var(--text-secondary)");
                        return (
                          <td 
                            key={cIdx} 
                            style={{ 
                              padding: 8, 
                              color: cellColor, 
                              fontSize: 10, 
                              fontFamily: "var(--mono)", 
                              fontWeight: isHigh ? 800 : 400,
                              backgroundColor: isHigh ? "rgba(167, 139, 250, 0.08)" : "transparent"
                            }}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 10, fontStyle: "italic" }}>
                Note: Red-highlighted values {"(>= 0.85)"} imply high contagion risk. Purple accent indicates Adani Watch metrics.
              </div>
            </div>
          </Section>

          {/* Section 4.4 Promoter Holding Line Chart */}
          <Section title="PROMOTER HOLDING TREND (Last 8 Quarters)">
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 14 }}>
              <div style={{ height: 160, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={promoterData}>
                    <XAxis dataKey="q" stroke="var(--text-muted)" style={{ fontSize: 8, fontFamily: "var(--mono)" }} />
                    <YAxis domain={[65, 75]} stroke="var(--text-muted)" style={{ fontSize: 8, fontFamily: "var(--mono)" }} width={25} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', fontSize: '10px', color: '#fff' }} />
                    <Line type="monotone" dataKey="val" stroke="var(--accent-purple)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--accent-purple)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}>
                Declining promoter holding % serves as an early refinancing risk indicator.
              </div>
            </div>
          </Section>

        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 }}>
          
          {/* Section 4.4 Court/regulatory feed */}
          <Section title="COURT & REGULATORY ACTION FEED">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {regulatoryFeed.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--border-default)", paddingBottom: 6 }}>
                  <div style={{ color: "var(--accent-purple)", fontSize: 8, fontFamily: "var(--mono)", fontWeight: 700, minWidth: 70 }}>
                    {item.source}
                  </div>
                  <div>
                    <div style={{ color: "var(--text-primary)", fontSize: 10, fontWeight: 600 }}>{item.title}</div>
                    <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 2 }}>Filed: {item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="RISK EXPLAINER">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 14 }}>
                <div style={{ color: "var(--text-muted)", fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)", marginBottom: 4 }}>GROUP CORRELATION</div>
                <div style={{ color: "var(--accent-purple)", fontSize: 24, fontWeight: 900, fontFamily: "var(--mono)" }}>0.42</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 9, fontFamily: "var(--mono)", marginTop: 2 }}>Moderate decouple from broad market</div>
              </div>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 8, padding: 14 }}>
                <div style={{ color: "var(--text-muted)", fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)", marginBottom: 4 }}>REFINANCING OUTLOOK</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 20, fontWeight: 800, fontFamily: "var(--mono)" }}>STABLE</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 9, fontFamily: "var(--mono)", marginTop: 2 }}>Debt-to-EBITDA within target threshold</div>
              </div>
            </div>
          </Section>

        </div>

      </div>
    </Layout>
  );
}
