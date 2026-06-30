import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Section from '../components/ui/Section';
import Sparkline from "../components/charts/Sparkline";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceDot } from 'recharts';
import { useTerminalStore } from '../store/useTerminalStore';

const MacroMetric = ({ title, value, subValue, status }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <div className="type-label" style={{ fontSize: 9 }}>{title}</div>
    <div className="type-hero" style={{ fontSize: 18 }}>{value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
      <span className="type-micro" style={{ color: "var(--text-secondary)" }}>{subValue}</span>
      <Badge color={status === 'Strong' || status === 'Surplus' ? 'green' : status === 'Rising' || status === 'Tightening' ? 'red' : 'yellow'}>{status}</Badge>
    </div>
  </div>
);

export default function Macro() {
  const { macroData, globalSignal } = useTerminalStore();
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    fetch('/api/macro-calendar')
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setCalendarEvents(data);
        }
      })
      .catch(() => {});
  }, []);

  const leftMetrics = [
    { title: "GDP GROWTH (YoY)", value: macroData?.gdp?.value ? `${macroData.gdp.value}%` : "6.8%", sub: "Q4 FY24", status: macroData?.gdp?.status || "Strong" },
    { title: "CPI INFLATION", value: macroData?.inflation?.value ? `${macroData.inflation.value}%` : "5.1%", sub: "Apr 2024", status: macroData?.inflation?.status || "Rising" },
    { title: "IIP GROWTH", value: "3.2%", sub: "Mar 2024", status: "Strong" },
    { title: "FISCAL DEFICIT", value: "5.6%", sub: "FY24 YTD", status: "DEFENSIVE" },
  ];

  const rightMetrics = [
    { title: "RBI REPO RATE", value: macroData?.repo_rate?.value ? `${macroData.repo_rate.value}%` : "6.50%", sub: "Current Rate", status: "NEUTRAL" },
    { title: "BRENT CRUDE", value: macroData?.brent_crude?.price ? `$${macroData.brent_crude.price}` : "$85.12", sub: "Global Bench", status: "Rising" },
  ];

  const rangeMap = {
    'USD / INR': { min: 82.50, max: 84.50 },
    'EUR / INR': { min: 88.00, max: 92.00 },
    'GBP / INR': { min: 102.00, max: 108.00 },
  };

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-fade-in">
        
        {/* Macro Scoreboard */}
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>
            <div style={{ gridColumn: "span 9", display: "flex", gap: 20 }}>
              {/* Left Group (macro fundamentals) */}
              <div style={{ flex: 2, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
                {leftMetrics.map(m => (
                  <MacroMetric key={m.title} title={m.title} value={m.value} subValue={m.sub} status={m.status} />
                ))}
              </div>
              
              {/* Divider */}
              <div style={{ width: 1, backgroundColor: "var(--border-default)" }} />
              
              {/* Right Group (policy & market) */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                {rightMetrics.map(m => (
                  <MacroMetric key={m.title} title={m.title} value={m.value} subValue={m.sub} status={m.status} />
                ))}
              </div>
            </div>
            
            {/* Macro Sentiment semicircle gauge widget (Section 4.2 Elements) */}
            <div style={{ gridColumn: "span 3", borderLeft: "1px solid var(--border-default)", paddingLeft: 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10 }}>
              <div className="type-label">MACRO SENTIMENT</div>
              <div style={{ position: "relative", width: 140, height: 70, overflow: "hidden" }}>
                <div style={{ width: 140, height: 140, borderRadius: "50%", border: "8px solid var(--border-default)", position: "absolute", top: 0 }} />
                <div style={{ 
                  width: 140, height: 140, borderRadius: "50%", 
                  border: `8px solid var(--accent-amber)`, 
                  position: "absolute", top: 0,
                  clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 50%)`,
                  transform: `rotate(${(52 / 100) * 180 - 180}deg)`,
                  transition: "transform 1s ease-out"
                }} />
                <div style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center" }}>
                   <div style={{ color: "var(--accent-amber)", fontSize: 24, fontWeight: 900, fontFamily: "var(--mono)" }}>52</div>
                   <div className="type-micro" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>SENTIMENT</div>
                </div>
              </div>
              <Badge color="yellow">NEUTRAL</Badge>
            </div>
          </div>
        </Card>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <Section title="INFLATION TREND (YoY %)">
            <div style={{ height: 160, width: "100%", marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{n: 'May', v: 7}, {n: 'Jul', v: 6.5}, {n: 'Sep', v: 6.8}, {n: 'Nov', v: 5.5}, {n: 'Jan', v: 5.1}, {n: 'Mar', v: 4.8}]}>
                  <Line type="monotone" dataKey="v" stroke="var(--accent-red)" strokeWidth={2} dot={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', fontSize: '10px' }} />
                  <XAxis dataKey="n" hide />
                  <YAxis stroke="var(--text-muted)" style={{ fontSize: 9, fontFamily: "var(--mono)" }} width={25} ticks={[4, 5, 6]} domain={[3, 8]} />
                  <ReferenceDot x="Mar" y={4.8} r={4} fill="var(--accent-red)" stroke="var(--bg-base)" strokeWidth={2} label={{ value: "5.1% Apr 2024", fill: "var(--text-primary)", fontSize: 8, fontFamily: "var(--mono)", position: "top" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="RBI POLICY RATE TREND (%)">
            <div style={{ height: 160, width: "100%", marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{n: 'May 23', v: 6.25}, {n: 'Jul 23', v: 6.50}, {n: 'Sep 23', v: 6.50}, {n: 'Nov 23', v: 6.50}, {n: 'Jan 24', v: 6.50}, {n: 'May 24', v: 6.50}]}>
                  <Line type="stepAfter" dataKey="v" stroke="var(--accent-blue)" strokeWidth={2} dot={false} />
                  <XAxis dataKey="n" hide />
                  <YAxis hide domain={[6.0, 6.7]} />
                  <ReferenceDot x="May 23" y={6.25} r={3} fill="var(--accent-blue)" stroke="none" label={{ value: "6.25%", fill: "var(--text-secondary)", fontSize: 8, fontFamily: "var(--mono)", position: "top" }} />
                  <ReferenceDot x="Jul 23" y={6.50} r={3} fill="var(--accent-blue)" stroke="none" label={{ value: "6.50%", fill: "var(--text-secondary)", fontSize: 8, fontFamily: "var(--mono)", position: "top" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="FOREIGN EXCHANGE SNAPSHOT">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
              {[
                { pair: 'USD / INR', val: macroData?.usd_inr?.price || '83.24', chg: macroData?.usd_inr?.change || '0.15', pct: macroData?.usd_inr?.pct_change || '0.18%', up: true },
                { pair: 'EUR / INR', val: '90.12', chg: '0.32', pct: '0.35%', up: true },
                { pair: 'GBP / INR', val: '105.42', chg: '-0.28', pct: '-0.27%', up: false }
              ].map(fx => {
                const range = rangeMap[fx.pair] || { min: 80, max: 100 };
                const currentVal = parseFloat(fx.val);
                const pct = Math.min(100, Math.max(0, ((currentVal - range.min) / (range.max - range.min)) * 100));

                return (
                  <div key={fx.pair} style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", borderBottom: "1px solid var(--border-default)", paddingBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: 10, fontFamily: "var(--sans)", fontWeight: 500 }}>{fx.pair}</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "var(--text-primary)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>{fx.val}</div>
                        <div style={{ color: fx.up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 9, fontFamily: "var(--mono)" }}>{fx.up ? '▲' : '▼'} {fx.chg} ({fx.pct})</div>
                      </div>
                    </div>
                    {/* 52W Range Bar (Section 4.2 Elements) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                      <span style={{ color: "var(--text-micro)", fontSize: 8, fontFamily: "var(--mono)" }}>{range.min.toFixed(2)}</span>
                      <div style={{ flex: 1, position: "relative", height: 2, background: "var(--border-default)", borderRadius: 1 }}>
                        <div style={{ position: "absolute", left: `${pct}%`, top: -3, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-teal)", transform: "translateX(-50%)", boxShadow: "0 0 4px var(--accent-teal)" }} />
                      </div>
                      <span style={{ color: "var(--text-micro)", fontSize: 8, fontFamily: "var(--mono)" }}>{range.max.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <Section title="LIQUIDITY CONDITIONS">
            <div style={{ height: 100, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{n: 1, v: 10}, {n: 2, v: 15}, {n: 3, v: 12}, {n: 4, v: 25}, {n: 5, v: 20}]}>
                  <Area type="monotone" dataKey="v" stroke="var(--accent-teal)" fill="rgba(0, 212, 170, 0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <div>
                <div className="type-label" style={{ fontSize: 9 }}>SYSTEM LIQUIDITY</div>
                <div className="type-hero" style={{ fontSize: 14 }}>₹1,62,345 Cr</div>
              </div>
              <Badge color="green">Surplus</Badge>
            </div>
          </Section>

          <Section title="BOND YIELDS (%)">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "var(--text-muted)", fontSize: 9, borderBottom: "1px solid var(--border-default)", textAlign: "left" }}>
                  <th style={{ paddingBottom: 8, fontWeight: 500 }}>TENOR</th>
                  <th style={{ paddingBottom: 8, fontWeight: 500, textAlign: "right" }}>CURRENT</th>
                  <th style={{ paddingBottom: 8, fontWeight: 500, textAlign: "right" }}>CHG</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '3M', c: '6.52', ch: '+2 bps', up: true },
                  { t: '1Y', c: '6.63', ch: '+2 bps', up: true },
                  { t: '10Y', c: '7.12', ch: '+6 bps', up: true }
                ].map(bond => (
                  <tr key={bond.t} style={{ borderBottom: "1px solid var(--border-default)", fontSize: 10, ...(bond.t === '10Y' ? { borderLeft: '3px solid var(--accent-blue)', paddingLeft: 6 } : {}) }}>
                    <td style={{ padding: "8px 0", paddingLeft: bond.t === '10Y' ? 6 : 0, color: bond.t === '10Y' ? 'var(--accent-blue)' : "var(--text-secondary)", fontFamily: "var(--mono)", fontWeight: bond.t === '10Y' ? 700 : 400 }}>{bond.t}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", color: "var(--text-primary)", fontWeight: 700, fontFamily: "var(--mono)", fontSize: bond.t === '10Y' ? 11 : 10 }}>{bond.c}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", color: bond.t === '10Y' ? "var(--accent-amber)" : (bond.up ? "var(--accent-teal)" : "var(--accent-red)"), fontFamily: "var(--mono)", fontWeight: 700 }}>
                      {bond.t === '10Y' ? (
                        <span style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "var(--accent-amber)", padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                          {bond.ch}
                        </span>
                      ) : bond.ch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="MACRO CALENDAR">
             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
               {calendarEvents.length === 0 ? (
                 <div style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--mono)", textAlign: "center", padding: "20px 0" }}>No upcoming events in next 60 days</div>
               ) : calendarEvents.map(item => {
                 const isGlobal = item.type === "US_FED_MEETING" || item.type === "NIFTY_EXPIRY" || item.label.includes("US") || item.label.includes("FOMC") || item.label.includes("Nifty");
                 const dotColor = isGlobal ? "var(--accent-amber)" : "var(--accent-blue)";

                 return (
                   <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, borderBottom: "1px solid var(--border-default)", paddingBottom: 6 }}>
                     <span style={{ color: "var(--accent-blue)", width: 50, fontFamily: "var(--mono)", fontSize: 8 }}>{item.date?.slice(5).replace('-', ' ')}</span>
                     <span style={{ color: "var(--text-primary)", flex: 1, fontWeight: 600, paddingLeft: 8, fontFamily: "var(--mono)", display: "flex", alignItems: "center" }}>
                       <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, marginRight: 6, display: "inline-block", flexShrink: 0 }} />
                       {item.label}
                     </span>
                     <span style={{ color: item.urgency === 'red' ? "var(--accent-red)" : item.urgency === 'amber' ? "var(--accent-amber)" : "var(--accent-teal)", fontSize: 8, fontFamily: "var(--mono)", fontWeight: 700 }}>
                       {item.days_until} days{item.trading_days != null ? ` / ${item.trading_days} sessions` : ''}
                     </span>
                   </div>
                 );
               })}
             </div>
          </Section>
        </div>
      </div>
    </Layout>
  );
}
