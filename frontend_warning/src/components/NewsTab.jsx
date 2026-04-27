import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
  LineChart, Line
} from 'recharts';

// ────── FETCH REAL DATA ──────
const fetchNewsData = async (symbol) => {
  try {
    const resp = await fetch(`/warning/api/sentiment-velocity/${symbol}`);
    if (!resp.ok) throw new Error('API error');
    const d = await resp.json();
    const now = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const velocityData = [{ date: now, count: (d.recent_headlines || []).length }];
    const sentimentData = [{ date: now, sentiment: d.now_avg_sentiment || 0 }];
    const headlines = (d.recent_headlines || []).map((h, i) => ({
      id: i, badge: h.sentiment || 'NEUTRAL',
      headline: h.headline, source: h.source || 'RSS',
      time: h.time || 'Recent',
      score: h.sentiment_score || 0,
    }));
    return { velocityData, sentimentData, headlines, baseline: 5,
      velocity: d.velocity || 0, rateSpike: d.headline_rate_spike || 1, signal: d.signal || 'STABLE' };
  } catch (e) {
    console.warn('NewsTab fetch error:', e);
    return { velocityData: [], sentimentData: [], headlines: [], baseline: 5,
      velocity: 0, rateSpike: 1, signal: 'OFFLINE' };
  }
};

// ────── TOOLTIPS ──────
const VelocityTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#111827', padding: '8px 12px', borderRadius: 4, color: '#FFF', fontSize: 12 }}>
        <div style={{ color: '#9CA3AF' }}>{label}</div>
        <div>Articles: {payload[0].value}</div>
      </div>
    );
  }
  return null;
};

const SentimentTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const color = val > 0 ? '#10B981' : '#EF4444';
    return (
      <div style={{ background: '#111827', padding: '8px 12px', borderRadius: 4, color: '#FFF', fontSize: 12 }}>
        <div style={{ color: '#9CA3AF' }}>{label}</div>
        <div>FinBERT Score: <span style={{ color }}>{val}</span></div>
      </div>
    );
  }
  return null;
};

export default function NewsTab({ symbol }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchNewsData(symbol).then(setData);
  }, [symbol]);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading news...</div>;

  const todayCount = data.velocityData.length > 0 ? data.velocityData[data.velocityData.length - 1].count : 0;
  const isElevated = data.rateSpike > 2;

  const getSourceColor = (source) => {
    if (source.includes('Economic Times')) return '#EA580C';
    if (source.includes('Hindu')) return '#3B82F6';
    if (source.includes('Reuters')) return '#EF4444';
    return '#6B7280';
  };

  const getBadgeStyle = (badge) => {
    if (badge === 'BEARISH') return { bg: '#FEE2E2', color: '#DC2626' };
    if (badge === 'BULLISH') return { bg: '#DCFCE7', color: '#16A34A' };
    return { bg: '#F3F4F6', color: '#6B7280' };
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ────── TOP CHARTS ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* VELOCITY CHART */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '0.05em' }}>
              NEWS VELOCITY (7 Days)
            </div>
            {isElevated && (
              <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '4px 10px', borderRadius: 4 }}>
                ELEVATED VELOCITY
              </div>
            )}
          </div>
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<VelocityTooltip />} cursor={{ fill: '#F3F4F6' }} />
                <ReferenceLine y={data.baseline} stroke="#6B7280" strokeDasharray="3 3" label={{ position: 'top', value: 'AVG', fill: '#6B7280', fontSize: 10 }} />
                <Bar dataKey="count" isAnimationActive={false}>
                  {data.velocityData.map((entry, index) => {
                    const ratio = entry.count / data.baseline;
                    const fill = ratio > 2 ? '#EF4444' : ratio > 1.5 ? '#F59E0B' : '#9CA3AF';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SENTIMENT CHART */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '0.05em', marginBottom: 16 }}>
            SENTIMENT TREND (FinBERT)
          </div>
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sentimentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<SentimentTooltip />} />
                <ReferenceLine y={0} stroke="#9CA3AF" />
                
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>

                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="url(#splitColor)" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ────── HEADLINES LIST ────── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', fontSize: 14, fontWeight: 700, color: '#111827' }}>
          Latest Processed Headlines
        </div>
        <div>
          {data.headlines.map((item, i) => {
            const style = getBadgeStyle(item.badge);
            return (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: 16, 
                padding: '12px 20px', borderBottom: i === data.headlines.length - 1 ? 'none' : '1px solid #F3F4F6',
                background: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB'
              }}>
                <div style={{ width: 80 }}>
                  <span style={{ 
                    fontSize: 10, fontWeight: 700, background: style.bg, color: style.color, 
                    padding: '2px 6px', borderRadius: 4, fontFamily: "'Space Mono', monospace" 
                  }}>
                    {item.badge}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <a href="#" style={{ color: '#111827', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                    {item.headline}
                  </a>
                </div>
                <div style={{ width: 120, fontSize: 12, fontWeight: 600, color: getSourceColor(item.source) }}>
                  {item.source}
                </div>
                <div style={{ width: 80, fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>
                  {item.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
