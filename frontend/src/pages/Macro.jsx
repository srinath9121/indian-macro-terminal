import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/shared.css';
import './Macro.css';
 
// ---- static placeholder data — replace each block with your live API data ----
 
const KPIS = [
  { name: 'GDP GROWTH (YoY)', value: '6.8%', sub: 'Q4 FY24', tag: 'STRONG', tagBg: 'var(--green-soft)', tagColor: 'var(--green)' },
  { name: 'CPI INFLATION', value: '5.1%', sub: 'Apr 2024', tag: 'RISING', tagBg: 'var(--red-soft)', tagColor: 'var(--red)' },
  { name: 'RBI REPO RATE', value: '6.50%', sub: 'Current rate', tag: 'NEUTRAL', tagBg: 'var(--amber-soft)', tagColor: 'var(--amber)' },
  { name: 'IIP GROWTH', value: '3.2%', sub: 'Mar 2024', tag: 'STRONG', tagBg: 'var(--green-soft)', tagColor: 'var(--green)' },
];
 
const YIELDS = [
  { tenor: '3M', current: '6.52', chg: '+2 bps', hot: false },
  { tenor: '1Y', current: '6.63', chg: '+2 bps', hot: false },
  { tenor: '10Y', current: '7.12', chg: '+6 bps', hot: true },
];
 
const FX_PAIRS = [
  { pair: 'USD / INR', value: '83.24', chg: '▲ 0.18%', up: true, rangePos: 78 },
  { pair: 'EUR / INR', value: '90.12', chg: '▲ 0.35%', up: true, rangePos: 55 },
  { pair: 'GBP / INR', value: '105.42', chg: '▼ 0.27%', up: false, rangePos: 40 },
];
 
const CALENDAR = [
  { date: 'JUL 14', name: 'CPI Inflation (Jun)', days: '15d · 10 sessions', dot: 'var(--indigo)' },
  { date: 'JUL 29', name: 'US FOMC Rate Decision', days: '30d · 21 sessions', dot: 'var(--orange)' },
  { date: 'JUL 30', name: 'Nifty Monthly Expiry', days: '31d · 22 sessions', dot: 'var(--orange)' },
  { date: 'AUG 06', name: 'RBI MPC Policy Decision', days: '38d · 26 sessions', dot: 'var(--indigo)' },
  { date: 'AUG 13', name: 'CPI Inflation (Jul)', days: '45d · 31 sessions', dot: 'var(--indigo)' },
];
 
export default function Macro() {
  return (
    <div className="app light-theme">
      <Sidebar />
 
      <div className="main">
        <Topbar crumb="Macro" />
 
        <div className="page-title-row">
          <div>
            <div className="page-h1">Macro Dashboard</div>
            <div className="page-h1-sub">Growth, inflation, rates and liquidity — India's macro stack at a glance</div>
          </div>
          <div className="status-pill amber">NEUTRAL · Score 52/100</div>
        </div>
 
        {/* KPI row */}
        <div className="kpi-row">
          {KPIS.map((k) => (
            <div className="kpi-card" key={k.name}>
              <div className="kpi-name">{k.name}</div>
              <div className="kpi-val num">{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
              <div className="kpi-tag" style={{ background: k.tagBg, color: k.tagColor }}>{k.tag}</div>
            </div>
          ))}
        </div>
 
        <div className="row">
          {/* Inflation trend */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Inflation Trend</div>
              <div className="panel-pill">YoY %</div>
            </div>
            <div className="chart-mini">
              <svg viewBox="0 0 320 150" width="100%" height="100%">
                <line x1="0" y1="20" x2="320" y2="20" stroke="#EEEFF5" />
                <line x1="0" y1="70" x2="320" y2="70" stroke="#EEEFF5" />
                <line x1="0" y1="120" x2="320" y2="120" stroke="#EEEFF5" />
                <text x="0" y="16" fontSize="10" fill="#9498AA">6%</text>
                <text x="0" y="66" fontSize="10" fill="#9498AA">5%</text>
                <text x="0" y="116" fontSize="10" fill="#9498AA">4%</text>
                <polyline points="20,40 60,45 100,50 140,60 180,65 220,68 260,70 300,72" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="300" cy="72" r="4" fill="#fff" stroke="#DC2626" strokeWidth="2.5" />
                <text x="255" y="60" fontSize="11" fontWeight="700" fill="#DC2626">5.1%</text>
              </svg>
            </div>
          </div>
 
          {/* RBI policy */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">RBI Policy Rate</div>
              <div className="panel-pill">%</div>
            </div>
            <div className="chart-mini">
              <svg viewBox="0 0 320 150" width="100%" height="100%">
                <line x1="0" y1="30" x2="320" y2="30" stroke="#EEEFF5" />
                <line x1="0" y1="80" x2="320" y2="80" stroke="#EEEFF5" />
                <line x1="0" y1="130" x2="320" y2="130" stroke="#EEEFF5" />
                <text x="0" y="26" fontSize="10" fill="#9498AA">6.75%</text>
                <text x="0" y="76" fontSize="10" fill="#9498AA">6.50%</text>
                <text x="0" y="126" fontSize="10" fill="#9498AA">6.25%</text>
                <polyline points="20,110 110,110 110,75 220,75 220,75 300,75" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinejoin="round" />
                <text x="55" y="100" fontSize="10.5" fontWeight="700" fill="#4F46E5">6.25%</text>
                <text x="240" y="65" fontSize="10.5" fontWeight="700" fill="#4F46E5">6.50%</text>
              </svg>
            </div>
          </div>
 
          {/* Liquidity */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">System Liquidity</div>
              <div className="status-pill green">SURPLUS</div>
            </div>
            <div className="kpi-val num" style={{ marginTop: 6 }}>₹1,62,345 Cr</div>
            <div className="chart-mini" style={{ height: 110 }}>
              <svg viewBox="0 0 320 110" width="100%" height="100%">
                <defs>
                  <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points="20,70 80,60 140,65 200,30 260,25 300,15 300,100 20,100" fill="url(#liqGrad)" />
                <polyline points="20,70 80,60 140,65 200,30 260,25 300,15" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
 
        <div className="row">
          {/* Bond yields */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">G-Sec Yields</div>
              <div className="panel-pill">%</div>
            </div>
            <table className="yield-table">
              <thead>
                <tr><th>TENOR</th><th>CURRENT</th><th>CHG</th></tr>
              </thead>
              <tbody>
                {YIELDS.map((y) => (
                  <tr key={y.tenor} className={y.hot ? 'hot' : ''}>
                    <td>{y.tenor}</td>
                    <td className="num">{y.current}</td>
                    <td className={'num ' + (y.hot ? '' : 'chg-up')} style={y.hot ? { color: 'var(--amber)' } : {}}>{y.chg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {/* FX */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Foreign Exchange</div>
              <div className="panel-pill">52-wk range</div>
            </div>
            {FX_PAIRS.map((fx) => (
              <div className="fx-row" key={fx.pair}>
                <div>
                  <div className="fx-pair">{fx.pair}</div>
                  <div className="fx-range"><div className="pos" style={{ left: fx.rangePos + '%' }} /></div>
                </div>
                <div>
                  <div className="fx-val num">{fx.value}</div>
                  <div className={'fx-chg num ' + (fx.up ? 'chg-up' : 'chg-down')}>{fx.chg}</div>
                </div>
              </div>
            ))}
          </div>
 
          {/* Macro calendar */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Macro Calendar</div>
              <div className="panel-pill">Upcoming</div>
            </div>
            {CALENDAR.map((c) => (
              <div className="cal-row" key={c.date + c.name}>
                <span className="cal-dot" style={{ background: c.dot }} />
                <span className="cal-date">{c.date}</span>
                <span className="cal-name">{c.name}</span>
                <span className="cal-days">{c.days}</span>
              </div>
            ))}
          </div>
        </div>
 
        {/* Sentiment gauge */}
        <div className="panel" style={{ maxWidth: 340 }}>
          <div className="panel-title" style={{ marginBottom: 14 }}>Macro Sentiment</div>
          <div className="sentiment-wrap">
            <svg viewBox="0 0 140 80" width="160" height="92">
              <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="#F0F1F6" strokeWidth="14" strokeLinecap="round" />
              <path d="M 10 75 A 60 60 0 0 1 78 16" fill="none" stroke="#D97706" strokeWidth="14" strokeLinecap="round" />
            </svg>
            <div style={{ marginTop: -8, fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>
              52<span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 600 }}>/100</span>
            </div>
            <div
              style={{
                fontSize: 12,
                padding: '5px 14px',
                borderRadius: 20,
                marginTop: 8,
                fontWeight: 700,
                background: 'var(--amber-soft)',
                color: 'var(--amber)',
              }}
            >
              NEUTRAL
            </div>
          </div>
        </div>
 
        <footer className="page-footer">
          India Macro Terminal — Real-time Intelligence. Smarter Decisions.
        </footer>
      </div>
    </div>
  );
}
