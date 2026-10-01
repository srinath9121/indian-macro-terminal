import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ComposedChart, Line, CartesianGrid, ReferenceLine
} from 'recharts';
import Layout from '../components/layout/Layout';
import { safeFetch } from '../utils/api';

/** Theme-aware custom tooltip */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  const scoreColor =
    p.danger_score >= 75 ? 'var(--accent-red)'
    : p.danger_score >= 50 ? 'var(--accent-amber)'
    : 'var(--accent-teal)';
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      padding: '12px 14px',
      borderRadius: 8,
      minWidth: 200,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--mono)', marginBottom: 8, letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, fontFamily: 'var(--mono)' }}>
        ₹{p.price?.toLocaleString('en-IN')}
      </div>
      <div style={{ color: scoreColor, fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', marginTop: 4 }}>
        RISK SCORE: {p.danger_score}
      </div>
      {p.flags && p.flags.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {p.flags.map((f, i) => (
            <div key={i} style={{ color: 'var(--accent-red)', fontSize: 10, fontFamily: 'var(--sans)', marginTop: 2 }}>• {f}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Backtest() {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetch('/warning/api/backtest/hindenburg').then(resp => {
      if (resp?.data) {
        setData(resp.data);
        setEvents(resp.events || []);
      }
    }).catch(e => console.error('Backtest fetch failed:', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── HEADER ── */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderLeft: '4px solid var(--accent-teal)',
          borderRadius: '0 8px 8px 0',
          padding: '20px 24px',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 800, fontFamily: 'var(--sans)', marginBottom: 8, letterSpacing: '0.02em' }}>
            MULTI-YEAR RISK INFERENCE: ADANIENT.NS
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0, maxWidth: 800, fontFamily: 'var(--sans)' }}>
            Tracks the evolution of the Risk Radar across the 2023–2026 period — capturing the Hindenburg crash,
            structural recovery, and current live market volatility.
          </p>

          {data && (
            <div style={{ marginTop: 16, background: 'rgba(0, 229, 255, 0.07)', padding: '12px 18px', borderRadius: 8, border: '1px solid rgba(0, 229, 255, 0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--accent-teal)', fontWeight: 700, fontSize: 13, fontFamily: 'var(--mono)' }}>LIVE INFERENCE</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--sans)' }}>
                Displaying <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{data.length} data points</span> — from the 2023 crash to today's live environment.
              </span>
            </div>
          )}
        </div>

        {/* ── CHART OR STATE ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 14 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent-teal)', display: 'inline-block',
                  animation: `_pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Simulating Danger Scores
            </span>
          </div>
        ) : !data || data.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 10, padding: 40, textAlign: 'center',
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--mono)' }}>No backtest data available from the backend.</div>
            <div style={{ color: 'var(--text-micro)', fontSize: 10, fontFamily: 'var(--sans)', marginTop: 6 }}>Ensure the Python backend is running on port 8001.</div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '20px 20px 20px 0', backdropFilter: 'blur(12px)' }}>
            <ResponsiveContainer width="100%" height={460}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent-red)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-micro)" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--mono)' }} tickMargin={10} minTickGap={60} />
                <YAxis yAxisId="left"  stroke="var(--text-micro)" domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--mono)' }} tickFormatter={v => `₹${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--accent-red)" domain={[0, 100]} tick={{ fill: 'var(--accent-red)', fontSize: 10, fontFamily: 'var(--mono)' }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine yAxisId="left" x="24 Jan 2023" stroke="var(--accent-red)" strokeDasharray="3 3" label={{ position: 'top', value: 'Hindenburg Report', fill: 'var(--accent-red)', fontSize: 10, fontFamily: 'var(--mono)' }} />
                <ReferenceLine yAxisId="left" x="20 Nov 2024" stroke="var(--accent-red)" strokeDasharray="3 3" label={{ position: 'top', value: 'DoJ Indictment', fill: 'var(--accent-red)', fontSize: 10, fontFamily: 'var(--mono)' }} />
                <Area yAxisId="right" type="monotone" dataKey="danger_score" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorScore)" />
                <Line yAxisId="left"  type="monotone" dataKey="price" stroke="var(--accent-teal)" dot={false} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── FORENSIC EVENTS ── */}
        {events && events.length > 0 && (
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--mono)', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              FORENSIC VALIDATION — MODEL BLOCK D
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {events.map((ev, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 20, backdropFilter: 'blur(12px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--sans)' }}>{ev.event}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{ev.event_date}</div>
                  </div>

                  {ev.error ? (
                    <div style={{ color: 'var(--accent-red)', fontSize: 12, fontFamily: 'var(--sans)' }}>Error: {ev.error}</div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderLeft: '3px solid var(--accent-amber)', padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--sans)', borderRadius: '0 4px 4px 0' }}>
                          {ev.reduce_signal}
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid var(--accent-red)', padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--sans)', borderRadius: '0 4px 4px 0' }}>
                          {ev.exit_signal}
                        </div>
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-micro)', marginBottom: 8, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Post-Event Drawdowns
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {[['1 DAY', ev.drawdown_1d], ['5 DAYS', ev.drawdown_5d], ['10 DAYS', ev.drawdown_10d]].map(([period, val]) => (
                          <div key={period} style={{ background: 'var(--bg-base)', padding: '8px 12px', borderRadius: 6, flex: 1, textAlign: 'center', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 9, color: 'var(--text-micro)', marginBottom: 4, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>{period}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: (val || '').includes('+') ? 'var(--accent-teal)' : 'var(--accent-red)' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
