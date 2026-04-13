import { useState, useEffect, useRef } from 'react';

// ────── METRIC CARD COMPONENT ──────
function MetricCard({ name, price, change, pChange, direction, flash }) {
  const isUp = direction === 'up';
  const arrow = isUp ? '▲' : '▼';
  const color = isUp ? '#00FF88' : '#FF4444';

  return (
    <div
      className={flash ? 'flash-update' : ''}
      style={{
        background: '#0D0D1A',
        border: '1px solid #1A1A2E',
        borderRadius: 8,
        padding: '16px 20px',
        minWidth: 0,
        transition: 'border-color 0.3s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1A1A4E'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1A1A2E'}
    >
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        color: '#8892A0',
        marginBottom: 8,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {name}
      </div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 22,
        fontWeight: 700,
        color: '#FFFFFF',
        marginBottom: 6,
      }}>
        {price != null ? price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '---'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color, fontWeight: 700 }}>
          {arrow} {change != null ? (change >= 0 ? '+' : '') + change.toFixed(2) : '--'}
        </span>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color,
          opacity: 0.8,
        }}>
          ({pChange != null ? (pChange >= 0 ? '+' : '') + pChange.toFixed(2) : '--'}%)
        </span>
      </div>
    </div>
  );
}

// ────── GTI GAUGE COMPONENT ──────
function GtiGauge({ score, label }) {
  const gaugeRef = useRef(null);

  // Needle angle: 0 → -90deg, 100 → +90deg
  const angle = score != null ? ((score / 100) * 180) - 90 : -90;

  const getZoneColor = (val) => {
    if (val >= 80) return '#FF4444';
    if (val >= 60) return '#FF8C00';
    if (val >= 35) return '#FFB347';
    return '#00FF88';
  };

  return (
    <div style={{
      background: '#0D0D1A',
      border: '1px solid #1A1A2E',
      borderRadius: 8,
      padding: 20,
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        color: '#8892A0',
        marginBottom: 12,
        letterSpacing: '0.15em',
      }}>
        INDIA GTI GAUGE
      </div>

      <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 220 }}>
        {/* Background arc zones */}
        <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="#00FF88" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        <path d="M 100 20 A 80 80 0 0 1 145 35" fill="none" stroke="#FFB347" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        <path d="M 145 35 A 80 80 0 0 1 170 65" fill="none" stroke="#FF8C00" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        <path d="M 170 65 A 80 80 0 0 1 180 100" fill="none" stroke="#FF4444" strokeWidth="8" strokeLinecap="round" opacity="0.3" />

        {/* Needle */}
        <g transform={`rotate(${angle}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="30" stroke={score != null ? getZoneColor(score) : '#555B66'} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill={score != null ? getZoneColor(score) : '#555B66'} />
        </g>

        {/* Score text */}
        <text x="100" y="98" textAnchor="middle" fill="#FFFFFF" fontFamily="Space Mono, monospace" fontSize="18" fontWeight="700">
          {score != null ? Math.round(score) : 'N/A'}
        </text>
      </svg>

      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: score != null ? getZoneColor(score) : '#555B66',
        fontWeight: 700,
        marginTop: 4,
        letterSpacing: '0.1em',
      }}>
        {label || (score != null ? (score >= 80 ? 'CRITICAL' : score >= 60 ? 'ELEVATED' : score >= 35 ? 'CAUTION' : 'STABLE') : 'N/A')}
      </div>
    </div>
  );
}

// ────── SECTOR HEATMAP COMPONENT ──────
function SectorHeatmap({ sectors }) {
  if (!sectors || sectors.length === 0) {
    return (
      <div style={{ background: '#0D0D1A', border: '1px solid #1A1A2E', borderRadius: 8, padding: 20 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#8892A0', letterSpacing: '0.15em', marginBottom: 12 }}>
          SECTOR HEATMAP
        </div>
        <div style={{ color: '#555B66', fontFamily: "'Space Mono', monospace", fontSize: 11 }}>Loading...</div>
      </div>
    );
  }

  const getColor = (pChange) => {
    if (pChange >= 2) return '#00FF88';
    if (pChange >= 0.5) return '#00CC66';
    if (pChange >= 0) return '#335544';
    if (pChange >= -0.5) return '#553333';
    if (pChange >= -2) return '#CC3333';
    return '#FF4444';
  };

  return (
    <div style={{ background: '#0D0D1A', border: '1px solid #1A1A2E', borderRadius: 8, padding: 20 }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#8892A0', letterSpacing: '0.15em', marginBottom: 12 }}>
        SECTOR HEATMAP
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {sectors.slice(0, 10).map((s, i) => (
          <div
            key={i}
            style={{
              background: `${getColor(s.pChange)}20`,
              border: `1px solid ${getColor(s.pChange)}40`,
              borderRadius: 4,
              padding: '8px 10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#CCC' }}>
              {s.name}
            </span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              color: getColor(s.pChange),
            }}>
              {s.pChange >= 0 ? '+' : ''}{s.pChange.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────── NEWS TICKER ──────
function NewsTicker({ news }) {
  if (!news || news.length === 0) return null;

  const biasColor = (bias) => {
    if (bias === 'bullish') return '#00FF88';
    if (bias === 'bearish') return '#FF4444';
    return '#8892A0';
  };

  const items = [...news, ...news]; // Duplicate for seamless loop
  const duration = items.length * 8; // ~8s per headline

  return (
    <div style={{
      width: '100%',
      background: '#0A0A12',
      borderTop: '1px solid #1A1A2E',
      overflow: 'hidden',
      padding: '8px 0',
    }}>
      <div className="marquee-content" style={{ animationDuration: `${duration}s` }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginRight: 40 }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              color: '#555B66',
              padding: '1px 4px',
              border: '1px solid #1A1A2E',
              borderRadius: 2,
            }}>
              {item.source}
            </span>
            <span style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 12,
              color: biasColor(item.bias),
            }}>
              {item.headline}
            </span>
            <span style={{ color: '#1A1A2E' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════
// PULSE PAGE
// ════════════════════════════════════════════════
export default function Pulse({ liveData }) {
  const [signals, setSignals] = useState(null);
  const [fiiDii, setFiiDii] = useState(null);
  const [gtiData, setGtiData] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [news, setNews] = useState([]);
  const [flashCards, setFlashCards] = useState(false);
  const prevDataRef = useRef(null);

  // ────── INITIAL DATA FETCH ──────
  useEffect(() => {
    const fetchAll = async () => {
      const safeFetch = (url, fallback = null) =>
        fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(() => fallback);

      const [sig, fii, gti, sec, newsData] = await Promise.all([
        safeFetch('/api/signals'),
        safeFetch('/api/fii-dii'),
        safeFetch('/api/gdelt/india-events'),
        safeFetch('/api/sector-performance'),
        safeFetch('/api/geopolitical-news'),
      ]);

      if (sig) setSignals(sig);
      if (fii) setFiiDii(fii);
      if (gti) setGtiData(gti);
      if (sec?.data) setSectors(sec.data);
      if (newsData?.items) setNews(newsData.items);
    };

    fetchAll();

    // Independent refresh intervals
    const fiiInterval = setInterval(async () => {
      try {
        const r = await fetch('/api/fii-dii');
        if (r.ok) setFiiDii(await r.json());
      } catch {}
    }, 5 * 60 * 1000);

    const gtiInterval = setInterval(async () => {
      try {
        const r = await fetch('/api/gdelt/india-events');
        if (r.ok) setGtiData(await r.json());
      } catch {}
    }, 15 * 60 * 1000);

    const sectorInterval = setInterval(async () => {
      try {
        const r = await fetch('/api/sector-performance');
        if (r.ok) {
          const d = await r.json();
          if (d?.data) setSectors(d.data);
        }
      } catch {}
    }, 10 * 60 * 1000);

    const newsInterval = setInterval(async () => {
      try {
        const r = await fetch('/api/geopolitical-news');
        if (r.ok) {
          const d = await r.json();
          if (d?.items) setNews(d.items);
        }
      } catch {}
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(fiiInterval);
      clearInterval(gtiInterval);
      clearInterval(sectorInterval);
      clearInterval(newsInterval);
    };
  }, []);

  // ────── UPDATE FROM WEBSOCKET ──────
  useEffect(() => {
    if (liveData) {
      setSignals(liveData);
      if (liveData.NEWS) setNews(liveData.NEWS);
      // Flash cards on update
      if (prevDataRef.current) {
        setFlashCards(true);
        setTimeout(() => setFlashCards(false), 800);
      }
      prevDataRef.current = liveData;
    }
  }, [liveData]);

  const market = signals?.MARKET || {};
  const cards = [
    { name: 'NIFTY 50', key: 'NIFTY' },
    { name: 'SENSEX', key: 'SENSEX' },
    { name: 'BANKNIFTY', key: 'BANKNIFTY' },
    { name: 'INDIA VIX', key: 'INDIAVIX' },
    { name: 'BRENT CRUDE', key: 'BRENT' },
    { name: 'USD/INR', key: 'USD/INR' },
    { name: 'GOLD', key: 'GOLD' },
    { name: 'SILVER', key: 'SILVER' },
    { name: 'COPPER', key: 'COPPER' },
  ];

  // FII/DII signal
  const fiiNet = fiiDii?.fii?.net;
  const diiNet = fiiDii?.dii?.net;
  const fiiSignal = fiiDii?.signal || 'NEUTRAL';
  const fiiSignalColor = fiiSignal === 'BULLISH' ? '#00FF88' : fiiSignal === 'BEARISH' ? '#FF4444' : '#FFB347';

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>

      {/* ══ SECTION 1: METRIC CARDS ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {cards.map((c) => {
          const d = market[c.key];
          return (
            <MetricCard
              key={c.key}
              name={c.name}
              price={d?.price}
              change={d?.change}
              pChange={d?.pChange}
              direction={d?.direction}
              flash={flashCards}
            />
          );
        })}
      </div>

      {/* ══ SECTION 2: THREE PANELS ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>

        {/* LEFT: FII/DII FLOW */}
        <div style={{
          background: '#0D0D1A',
          border: '1px solid #1A1A2E',
          borderRadius: 8,
          padding: 20,
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: '#8892A0',
            letterSpacing: '0.15em',
            marginBottom: 16,
          }}>
            FII / DII FLOW
          </div>

          {fiiDii ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: '#8892A0', marginBottom: 4 }}>FII Net</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 20,
                  fontWeight: 700,
                  color: fiiNet != null ? (fiiNet >= 0 ? '#00FF88' : '#FF4444') : '#555B66',
                }}>
                  {fiiNet != null ? `₹${fiiNet.toLocaleString('en-IN')} Cr` : 'N/A'}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: '#8892A0', marginBottom: 4 }}>DII Net</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 20,
                  fontWeight: 700,
                  color: diiNet != null ? (diiNet >= 0 ? '#00FF88' : '#FF4444') : '#555B66',
                }}>
                  {diiNet != null ? `₹${diiNet.toLocaleString('en-IN')} Cr` : 'N/A'}
                </div>
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                color: fiiSignalColor,
                padding: '4px 10px',
                background: `${fiiSignalColor}15`,
                border: `1px solid ${fiiSignalColor}30`,
                borderRadius: 4,
                display: 'inline-block',
              }}>
                {fiiSignal}
              </div>
              {fiiDii?.date && fiiDii.date !== 'Unavailable' && (
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: '#555B66', marginTop: 8 }}>
                  Data: {fiiDii.date}
                </div>
              )}
              {fiiDii?.unavailable && (
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: '#FF8C00', marginTop: 8 }}>
                  NSE API unavailable — check back later
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#555B66', fontFamily: "'Space Mono', monospace", fontSize: 11 }}>Loading...</div>
          )}
        </div>

        {/* CENTER: GTI GAUGE */}
        <GtiGauge score={gtiData?.gti} label={gtiData?.gti_label} />

        {/* RIGHT: SECTOR HEATMAP */}
        <SectorHeatmap sectors={sectors} />
      </div>

      {/* ══ SECTION 3: NEWS TICKER ══ */}
      <NewsTicker news={news} />
    </div>
  );
}
