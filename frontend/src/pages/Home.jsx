import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Ticker from '../components/Ticker';
import '../styles/shared.css';
import './Home.css';
 
// ---- static placeholder data — replace each block with your live API data ----
 
const MACRO_COMPOSITION = [
  { label: 'Growth', pct: 38, color: 'var(--indigo)', value: 'Strong', valueColor: 'var(--green)' },
  { label: 'Inflation', pct: 27, color: 'var(--purple)', value: 'Rising', valueColor: 'var(--red)' },
  { label: 'Liquidity', pct: 20, color: 'var(--pink)', value: 'Tightening', valueColor: 'var(--amber)' },
  { label: 'FII Flow', pct: 15, color: 'var(--orange)', value: '+₹1,450 Cr', valueColor: 'var(--green)', isNum: true },
];
 
const WHAT_CHANGED = [
  { bearish: true, text: 'FII turned net sellers after 5 weeks' },
  { bearish: true, text: 'Brent crude crossed $85/barrel' },
  { bearish: true, text: 'RBI commentary turned slightly hawkish' },
  { bearish: false, text: 'India CPI cooling YoY despite higher print' },
  { bearish: false, text: 'US 10Y yield moved above 4.6%' },
];
 
const ADANI_SIGNALS = [
  { tick: 'ADANIENT', icon: 'AE', iconBg: '#4F46E5', price: '₹3,142.25', conf: 62, chg: '+1.36%', up: true, tag: 'BULLISH', tagClass: 'bull', fillColor: 'var(--green)' },
  { tick: 'ADANIPORTS', icon: 'AP', iconBg: '#0EA5E9', price: '₹1,341.10', conf: 58, chg: '+1.40%', up: true, tag: 'NEUTRAL', tagClass: 'neutral', fillColor: 'var(--amber)' },
  { tick: 'ADANIGREEN', icon: 'AG', iconBg: '#16A34A', price: '₹1,062.70', conf: 65, chg: '+2.48%', up: true, tag: 'BULLISH', tagClass: 'bull', fillColor: 'var(--green)' },
  { tick: 'ADANIPOWER', icon: 'AW', iconBg: '#EC4899', price: '₹597.85', conf: 45, chg: '-0.73%', up: false, tag: 'DEFENSIVE', tagClass: 'bear', fillColor: 'var(--red)' },
  { tick: 'ATGL', icon: 'AT', iconBg: '#F97316', price: '₹1,012.45', conf: 60, chg: '+1.39%', up: true, tag: 'NEUTRAL', tagClass: 'neutral', fillColor: 'var(--amber)' },
];
 
const LIVE_ALERTS = [
  { type: 'warn', icon: '!', title: 'ADANI POWER ▼ 1.60%', body: 'Crossed −1.5% alert threshold', meta: 'ADANI GROUP · 09:14 IST' },
  { type: 'ok', icon: '✓', title: 'Terminal operational', body: 'All systems nominal. Running on fallback feed.', meta: 'SYSTEM · 09:32 IST' },
  { type: 'info', icon: 'i', title: 'FII flow monitoring active', body: 'Fires above ₹2,000 Cr net selling in a session', meta: 'FII / DII · standing rule' },
];
 
const SECTOR_HEATMAP = [
  { name: 'NIFTY IT', pct: '+1.42%', bg: '#16A34A', dark: false },
  { name: 'NIFTY FMCG', pct: '+1.18%', bg: '#22C55E', dark: false },
  { name: 'NIFTY BANK', pct: '+0.83%', bg: '#4ADE80', dark: false },
  { name: 'NIFTY AUTO', pct: '+0.55%', bg: '#86EFAC', dark: true },
  { name: 'NIFTY METAL', pct: '−0.24%', bg: '#FCA5A5', dark: true },
  { name: 'NIFTY PHARMA', pct: '+0.12%', bg: '#4ADE80', dark: false },
  { name: 'NIFTY REALTY', pct: '+0.97%', bg: '#22C55E', dark: false },
  { name: 'NIFTY ENERGY', pct: '−1.05%', bg: '#EF4444', dark: false },
];
 
const GAINERS = [
  { rank: 1, icon: 'TT', iconBg: '#4F46E5', name: 'Tata Technologies', price: '₹1,142.50', chg: '+4.12%' },
  { rank: 2, icon: 'IN', iconBg: '#0EA5E9', name: 'Infosys', price: '₹1,542.10', chg: '+2.12%' },
  { rank: 3, icon: 'HC', iconBg: '#A855F7', name: 'HCL Technologies', price: '₹1,341.50', chg: '+1.84%' },
  { rank: 4, icon: 'WI', iconBg: '#F97316', name: 'Wipro', price: '₹482.40', chg: '+1.72%' },
  { rank: 5, icon: 'TC', iconBg: '#16A34A', name: 'TCS', price: '₹3,842.00', chg: '+1.10%' },
];
 
const LOSERS = [
  { rank: 1, icon: 'MM', iconBg: '#DC2626', name: 'Mahindra & Mahindra', price: '₹1,942.50', chg: '-2.12%' },
  { rank: 2, icon: 'AP', iconBg: '#EC4899', name: 'Adani Ports & SEZ', price: '₹1,341.10', chg: '-0.92%' },
  { rank: 3, icon: 'JS', iconBg: '#9498AA', name: 'JSW Steel', price: '₹842.40', chg: '-0.96%' },
  { rank: 4, icon: 'BP', iconBg: '#F97316', name: 'BPCL', price: '₹612.30', chg: '-0.68%' },
  { rank: 5, icon: 'TI', iconBg: '#4F46E5', name: 'Titan Company', price: '₹3,242.00', chg: '-0.55%' },
];
 
const SNAPSHOT_TILES = ['NIFTY 50', 'SENSEX', 'BANK NIFTY', 'INDIA VIX'];
 
const CHAIN_NODES = ['Macro Stable', 'Inflation ↓', 'RBI Pause', 'Growth ↑', 'Market ↑'];
 
const CHART_RANGES = ['1D', '7D', '1M', 'YTD', '1Y'];
 
export default function Home() {
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState('7D');
  const [moversTab, setMoversTab] = useState('gainers');
 
  const movers = moversTab === 'gainers' ? GAINERS : LOSERS;
 
  return (
    <div className="app light-theme">
      <Sidebar />
 
      <div className="main">
        <Topbar crumb="Home" />
        <Ticker />
 
        {/* ROW 1: hero + chart */}
        <div className="row-1">
          <div className="hero-card">
            <div className="hero-eyebrow">Market Confidence Score</div>
            <div className="hero-value num">
              52<span style={{ fontSize: 20, color: 'var(--ink-mute)', fontWeight: 600 }}>/100</span>
            </div>
            <div className="hero-delta bad">
              <span className="arrow">↓</span> 4 pts this week <span className="hero-sub">Neutral bias</span>
            </div>
 
            <div className="dist-title">Macro Composition</div>
            <div className="dist-bar">
              {MACRO_COMPOSITION.map((m) => (
                <div key={m.label} className="dist-seg" style={{ background: m.color, flex: m.pct }} />
              ))}
            </div>
            <div className="dist-list">
              {MACRO_COMPOSITION.map((m) => (
                <div className="dist-row" key={m.label}>
                  <div className="dist-left">
                    <span className="dist-sw" style={{ background: m.color }} />
                    <span className="dist-label">{m.label}</span>
                    <span className="dist-pct">{m.pct}%</span>
                  </div>
                  <span className={'dist-val' + (m.isNum ? ' num' : '')} style={{ color: m.valueColor }}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
 
          <div className="chart-card">
            <div className="chart-head">
              <div>
                <div className="chart-title">Nifty 50 vs Macro Confidence</div>
                <div className="chart-sub">7-day overlay · normalised</div>
              </div>
              <div className="range-pills">
                {CHART_RANGES.map((r) => (
                  <button
                    key={r}
                    className={'range-pill' + (activeRange === r ? ' active' : '')}
                    onClick={() => setActiveRange(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-area">
              <svg viewBox="0 0 760 230" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="760" y2="20" stroke="#EEEFF5" strokeWidth="1" />
                <line x1="0" y1="70" x2="760" y2="70" stroke="#EEEFF5" strokeWidth="1" />
                <line x1="0" y1="120" x2="760" y2="120" stroke="#EEEFF5" strokeWidth="1" />
                <line x1="0" y1="170" x2="760" y2="170" stroke="#EEEFF5" strokeWidth="1" />
                <text x="0" y="16" fontSize="11" fill="#9498AA" fontFamily="Inter">25,200</text>
                <text x="0" y="66" fontSize="11" fill="#9498AA" fontFamily="Inter">24,900</text>
                <text x="0" y="116" fontSize="11" fill="#9498AA" fontFamily="Inter">24,600</text>
                <text x="0" y="166" fontSize="11" fill="#9498AA" fontFamily="Inter">24,300</text>
                <polygon
                  points="40,150 120,130 200,140 280,90 360,100 440,60 520,75 600,40 680,55 740,25 740,210 40,210"
                  fill="url(#fillGrad)"
                />
                <polyline
                  points="40,150 120,130 200,140 280,90 360,100 440,60 520,75 600,40 680,55 740,25"
                  fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                />
                <polyline
                  points="40,165 120,158 200,162 280,145 360,150 440,128 520,135 600,112 680,120 740,98"
                  fill="none" stroke="#F97316" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="1 5"
                />
                <circle cx="600" cy="40" r="4.5" fill="#fff" stroke="#4F46E5" strokeWidth="2.5" />
                <line x1="600" y1="40" x2="600" y2="210" stroke="#4F46E5" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
                <text x="40" y="226" fontSize="11" fill="#9498AA" fontFamily="Inter">Mon</text>
                <text x="200" y="226" fontSize="11" fill="#9498AA" fontFamily="Inter">Tue</text>
                <text x="360" y="226" fontSize="11" fill="#9498AA" fontFamily="Inter">Wed</text>
                <text x="520" y="226" fontSize="11" fill="#9498AA" fontFamily="Inter">Thu</text>
                <text x="680" y="226" fontSize="11" fill="#9498AA" fontFamily="Inter">Fri</text>
              </svg>
            </div>
          </div>
        </div>
 
        {/* ROW 2: what changed / adani / alerts */}
        <div className="row-2">
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">What Changed</div>
              <div className="panel-pill">This week</div>
            </div>
            <div className="legend2">
              <span><span className="d" style={{ background: 'var(--red)' }} />Bearish</span>
              <span><span className="d" style={{ background: 'var(--green)' }} />Bullish</span>
            </div>
            {WHAT_CHANGED.map((w, i) => (
              <div className="wc-item" key={i}>
                <span className="wc-dot" style={{ background: w.bearish ? 'var(--red)' : 'var(--green)' }} />
                <span className="wc-text">{w.text}</span>
              </div>
            ))}
          </div>
 
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Adani Group Signals</div>
              <div className="see-all" onClick={() => navigate('/adani-intel')}>See all →</div>
            </div>
            {ADANI_SIGNALS.map((a) => (
              <div className="adani-row" key={a.tick} onClick={() => navigate('/adani-intel')}>
                <div className="adani-icon" style={{ background: a.iconBg }}>{a.icon}</div>
                <div className="adani-info">
                  <div className="adani-name">{a.tick}</div>
                  <div className="adani-price num">{a.price}</div>
                </div>
                <div className="adani-track">
                  <div className="adani-fill" style={{ width: a.conf + '%', background: a.fillColor }} />
                </div>
                <div className="adani-conf num">{a.conf}%</div>
                <div className={'adani-chg num ' + (a.up ? 'up' : 'down')}>
                  {a.up ? '▲' : '▼'} {a.chg.replace('-', '').replace('+', '')}
                </div>
                <div className={'adani-tag ' + a.tagClass}>{a.tag}</div>
              </div>
            ))}
          </div>
 
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Live Alerts</div>
              <div className="see-all" onClick={() => navigate('/alerts')}>See all →</div>
            </div>
            {LIVE_ALERTS.map((al, i) => (
              <div className="alert-row" key={i}>
                <div className={'alert-ic ' + al.type}>{al.icon}</div>
                <div>
                  <div className="alert-title">{al.title}</div>
                  <div className="alert-body">{al.body}</div>
                  <div className="alert-meta">{al.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Market Performance — new section */}
        <div className="perf-row">
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Market Performance</div>
                <div className="chart-sub" style={{ marginTop: 2 }}>NSE sector heatmap · today</div>
              </div>
              <div className="see-all" onClick={() => navigate('/markets')}>Full view →</div>
            </div>
            <div className="heat-grid">
              {SECTOR_HEATMAP.map((s) => (
                <button
                  key={s.name}
                  className="heat-tile"
                  style={{ background: s.bg }}
                  onClick={() => navigate('/markets')}
                >
                  <div className="heat-sector" style={{ color: s.dark ? '#15172B' : '#fff' }}>{s.name}</div>
                  <div className="heat-pct num" style={{ color: s.dark ? '#15172B' : '#fff' }}>{s.pct}</div>
                </button>
              ))}
            </div>
          </div>
 
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Top Movers</div>
              <div className="mover-tabs">
                <button
                  className={'mover-tab' + (moversTab === 'gainers' ? ' active' : '')}
                  onClick={() => setMoversTab('gainers')}
                >
                  Gainers
                </button>
                <button
                  className={'mover-tab' + (moversTab === 'losers' ? ' active' : '')}
                  onClick={() => setMoversTab('losers')}
                >
                  Losers
                </button>
              </div>
            </div>
            <div className="movers-list">
              {movers.map((m) => (
                <button className="mover-row" key={m.rank} onClick={() => navigate('/markets')}>
                  <div className="mover-rank">{m.rank}</div>
                  <div className="mover-icon" style={{ background: m.iconBg }}>{m.icon}</div>
                  <div className="mover-name">{m.name}</div>
                  <div className="mover-price num">{m.price}</div>
                  <div className={'mover-chg num ' + (moversTab === 'gainers' ? 'up' : 'down')}>{m.chg}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
 
        {/* ROW 3: snapshot + bias */}
        <div className="row-3">
          <div className="snap-card">
            <div className="panel-head" style={{ marginBottom: 0 }}>
              <div className="panel-title">Market Snapshot</div>
              <div className="panel-pill">Live</div>
            </div>
            <div className="snap-grid">
              {SNAPSHOT_TILES.map((name) => (
                <button className="snap-tile" key={name} onClick={() => navigate('/markets')}>
                  <div className="snap-name">{name}</div>
                  <div className="snap-val">— —</div>
                  <div className="snap-status"><span className="ring" />checking…</div>
                </button>
              ))}
            </div>
          </div>
 
          <div className="bias-card">
            <div className="panel-title" style={{ alignSelf: 'flex-start' }}>Market Bias</div>
            <div className="donut-wrap">
              <svg viewBox="0 0 140 140" width="140" height="140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="#F0F1F6" strokeWidth="16" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="#D97706" strokeWidth="16" strokeDasharray="182 364" strokeLinecap="round" transform="rotate(-90 70 70)" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="#4F46E5" strokeWidth="16" strokeDasharray="90 364" strokeDashoffset="-182" strokeLinecap="round" transform="rotate(-90 70 70)" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="#16A34A" strokeWidth="16" strokeDasharray="92 364" strokeDashoffset="-272" strokeLinecap="round" transform="rotate(-90 70 70)" />
              </svg>
              <div className="donut-center">
                <div className="donut-num">50%</div>
                <div className="donut-label">Confidence</div>
              </div>
            </div>
            <div className="bias-tag">NEUTRAL</div>
            <div className="bias-legend">
              <span><span className="d" style={{ background: '#D97706' }} />Caution 50%</span>
              <span><span className="d" style={{ background: '#4F46E5' }} />Bullish 25%</span>
              <span><span className="d" style={{ background: '#16A34A' }} />Stable 25%</span>
            </div>
          </div>
        </div>
 
        {/* Causal chain */}
        <div className="chain-card">
          <div className="panel-title">Causal Chain In Focus</div>
          <div className="chain-row">
            {CHAIN_NODES.map((node, i) => (
              <span key={node} style={{ display: 'contents' }}>
                <div className={'chain-node' + (i === CHAIN_NODES.length - 1 ? ' end' : '')}>{node}</div>
                {i < CHAIN_NODES.length - 1 && <span className="chain-arrow">→</span>}
              </span>
            ))}
          </div>
        </div>
 
        <footer className="page-footer">
          India Macro Terminal — Real-time Intelligence. Smarter Decisions. · <span>Live clock in topbar</span>
        </footer>
      </div>
    </div>
  );
}
