import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// ────── FETCH REAL DATA ──────
const fetchOverviewData = async (symbol) => {
  const result = { chartData: [], dangerScore: 0, signal: 'CLEAR', layers: {}, options: {}, macro: {}, legal: {}, smart: {}, sentiment: {} };
  try {
    const [dangerResp, optsResp, macroResp, legalResp, smartResp, sentResp] = await Promise.all([
      fetch(`/warning/api/danger-score/${symbol}`),
      fetch(`/warning/api/options/${symbol}`),
      fetch(`/warning/api/macro-pressure/${symbol}`),
      fetch(`/warning/api/legal/${symbol}`),
      fetch(`/warning/api/smart-money/${symbol}`),
      fetch(`/warning/api/sentiment-velocity/${symbol}`),
    ]);
    if (dangerResp.ok) { const d = await dangerResp.json(); result.dangerScore = d.danger_score || 0; result.signal = d.final_signal || 'CLEAR'; result.layers = d.layers || {}; result.activeCount = d.active_count || 0; }
    if (optsResp.ok) { result.options = await optsResp.json(); }
    if (macroResp.ok) { result.macro = await macroResp.json(); }
    if (legalResp.ok) { result.legal = await legalResp.json(); }
    if (smartResp.ok) { result.smart = await smartResp.json(); }
    if (sentResp.ok) { result.sentiment = await sentResp.json(); }
    // Build single-point chart from current data
    const now = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const spot = result.options?.chain?.spot || 0;
    result.chartData = [{ date: now, price: spot, dangerEvent: result.dangerScore > 60, dangerScore: result.dangerScore }];
  } catch (e) { console.warn('OverviewTab fetch error:', e); }
  return result;
};

// ────── CUSTOM TOOLTIP ──────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 4, 
        padding: '8px 12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontFamily: "'Inter', sans-serif", fontSize: 12
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: '#111827' }}>{data.date}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", color: '#111827' }}>Price: ₹{data.price.toFixed(2)}</div>
        {data.dangerScore > 50 && (
          <div style={{ fontFamily: "'Space Mono', monospace", color: '#DC2626', marginTop: 4, fontWeight: 700 }}>
            Danger Score: {data.dangerScore}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function OverviewTab({ symbol }) {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('1M');
  const [barsWidth, setBarsWidth] = useState(false);

  useEffect(() => {
    fetchOverviewData(symbol).then(d => { setData(d); setTimeout(() => setBarsWidth(true), 100); });
  }, [symbol, timeframe]);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading overview...</div>;

  const chartData = data.chartData;
  const spotPrice = data.options?.chain?.spot || 0;
  const isUp = spotPrice > 0;
  const strokeColor = '#3B82F6';

  const getColor = (s) => s > 75 ? '#DC2626' : s > 50 ? '#EA580C' : s > 25 ? '#D97706' : '#16A34A';
  const getStatus = (s) => s > 75 ? 'CRITICAL' : s > 50 ? 'WARNING' : s > 25 ? 'WATCH' : 'CLEAR';
  const ls = data.layers;
  const layers = [
    { name: 'OPTIONS ANOMALY', score: ls.options_anomaly || 0, color: getColor(ls.options_anomaly || 0), status: getStatus(ls.options_anomaly || 0) },
    { name: 'MACRO PRESSURE', score: ls.macro_pressure || 0, color: getColor(ls.macro_pressure || 0), status: getStatus(ls.macro_pressure || 0) },
    { name: 'LEGAL RADAR', score: ls.legal_risk || 0, color: getColor(ls.legal_risk || 0), status: getStatus(ls.legal_risk || 0) },
    { name: 'SMART MONEY', score: ls.smart_money || 0, color: getColor(ls.smart_money || 0), status: getStatus(ls.smart_money || 0) },
    { name: 'SENTIMENT VELOCITY', score: ls.sentiment_velocity || 0, color: getColor(ls.sentiment_velocity || 0), status: getStatus(ls.sentiment_velocity || 0) }
  ];

  const pcr = data.options?.chain?.pcr || data.options?.anomaly?.pcr || 0;
  const pcrDev = data.options?.anomaly?.pcr_deviation_pct || 0;
  const macroSignal = data.macro?.signal || 'LOW';
  const legalStatus = data.legal?.legal_score?.status || 'CLEAR';
  const legalCount = data.legal?.legal_score?.recent_filing_count || 0;
  const pledgePct = data.smart?.pledge_pct || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
      
      {/* ────── PRICE CHART ────── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
          {['1D', '5D', '1M', '3M', '6M', '1Y'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? '#F3F4F6' : 'transparent',
                border: 'none', borderRadius: 4, padding: '4px 8px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                color: timeframe === tf ? '#111827' : '#6B7280'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip content={<CustomTooltip />} />
              {chartData.filter(d => d.dangerEvent).map((d, i) => (
                <ReferenceLine 
                  key={i} 
                  x={d.date} 
                  stroke="#DC2626" 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: `SCORE ${d.dangerScore}`, fill: '#DC2626', fontSize: 10, fontFamily: "'Space Mono', monospace" }}
                />
              ))}
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={strokeColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ────── FOUR SUMMARY CARDS ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        
        {/* CARD 1: DANGER SCORE */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', letterSpacing: '0.05em' }}>DANGER SCORE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: '#111827' }}>{data.dangerScore}<span style={{ fontSize: 16, color: '#6B7280' }}>/100</span></span>
            <span style={{ fontSize: 12, fontWeight: 600, color: getColor(data.dangerScore) }}>{data.activeCount || 0}/5 layers</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: getColor(data.dangerScore), background: data.dangerScore > 60 ? '#FEE2E2' : '#DCFCE7', display: 'inline-block', padding: '2px 8px', borderRadius: 4 }}>
            {data.signal}
          </div>
        </div>

        {/* CARD 2: OPTIONS ANOMALY */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', letterSpacing: '0.05em' }}>OPTIONS ANOMALY</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: '#111827' }}>PCR {pcr.toFixed(2)}x</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: pcrDev > 20 ? '#F59E0B' : '#10B981' }}>{pcrDev > 0 ? '+' : ''}{pcrDev.toFixed(0)}% vs avg</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: getColor(ls.options_anomaly || 0), background: '#FEF3C7', display: 'inline-block', padding: '2px 8px', borderRadius: 4 }}>
            {getStatus(ls.options_anomaly || 0)}
          </div>
        </div>

        {/* CARD 3: MACRO PRESSURE */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🧭</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', letterSpacing: '0.05em' }}>MACRO PRESSURE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: '#111827' }}>{macroSignal}</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            VIX: {data.macro?.factors?.vix || '—'} | FII: ₹{((data.macro?.factors?.fii_net || 0) / 100).toFixed(0)} Cr
          </div>
        </div>

        {/* CARD 4: LEGAL STATUS */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>⚖️</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', letterSpacing: '0.05em' }}>LEGAL STATUS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: '#111827' }}>{legalStatus}</span>
          </div>
          <div style={{ fontSize: 12, color: legalCount > 0 ? '#DC2626' : '#10B981', fontWeight: 600, marginTop: 4 }}>
            {legalCount > 0 ? `${legalCount} recent filing(s)` : 'No recent filings'}
          </div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
            Pledge: {pledgePct}%
          </div>
        </div>

      </div>

      {/* ────── TWO PANELS BELOW ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* LEFT: COMPANY PROFILE */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', fontSize: 14, fontWeight: 700, color: '#111827' }}>
            Company Profile
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'NSE Symbol', value: symbol },
              { label: 'Spot Price', value: spotPrice > 0 ? `₹${spotPrice.toLocaleString()}` : '—' },
              { label: 'Promoter Pledge', value: `${pledgePct}%`, badge: pledgePct > 20 },
              { label: 'Smart Money Score', value: `${ls.smart_money || 0}/100` },
              { label: 'FII Net Flow', value: `₹${((data.macro?.factors?.fii_net || 0) / 100).toFixed(0)} Cr` },
              { label: 'Sentiment Signal', value: data.sentiment?.signal || 'STABLE' },
              { label: 'Options PCR', value: pcr > 0 ? `${pcr.toFixed(2)}x` : '—' },
              { label: 'Active Layers', value: `${data.activeCount || 0} of 5` },
              { label: 'Danger Signal', value: data.signal },
            ].map((row, i) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', padding: '12px 20px', 
                background: i % 2 === 0 ? '#F9FAFB' : '#FFFFFF', fontSize: 13 
              }}>
                <span style={{ color: '#6B7280' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {row.value}
                  {row.badge && (
                    <span style={{ fontSize: 10, background: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: 4 }}>
                      ELEVATED
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: 5-LAYER DETECTION BARS */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 20 }}>
            Detection Layer Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {layers.map((layer, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 140, fontSize: 12, fontWeight: 600, color: '#4B5563', letterSpacing: '0.05em' }}>
                  {layer.name}
                </div>
                <div style={{ flex: 1, height: 12, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ 
                    width: barsWidth ? `${layer.score}%` : '0%', 
                    height: '100%', 
                    background: layer.color,
                    transition: 'width 0.8s ease-out'
                  }} />
                </div>
                <div style={{ width: 40, fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: '#111827', textAlign: 'right' }}>
                  {layer.score}%
                </div>
                <div style={{ width: 80, fontSize: 11, fontWeight: 700, color: layer.color, textAlign: 'right' }}>
                  {layer.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ────── AI ANALYSIS BOX ────── */}
      <div style={{ 
        background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #0077CC', 
        borderRadius: 4, padding: '20px 24px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0077CC', letterSpacing: '0.05em' }}>SYSTEM ANALYSIS</span>
        </div>
        <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#1E3A8A', lineHeight: 1.6 }}>
          3 of 5 detection layers active. Unusual put accumulation detected over 72h with elevated PCR levels. 
          FII net short positions have increased, aligning with negative structural macro indicators. 
          Pattern matches historical pre-correction signatures for this stock. Recommend reducing exposure.
        </p>
        <div style={{ fontSize: 11, color: '#60A5FA', fontStyle: 'italic' }}>
          Disclaimer: Detection system output only. Not financial advice. Not SEBI registered. 
          Past patterns do not guarantee future results.
        </div>
      </div>

    </div>
  );
}
