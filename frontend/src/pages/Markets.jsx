import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// ────── SKELETON ROW ──────
function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map(i => (
        <td key={i} style={{ padding: '8px 12px' }}>
          <div className="skeleton-bar" style={{ height: 14, width: i === 1 ? 60 : 50 }} />
        </td>
      ))}
    </tr>
  );
}

// ────── MOVERS TABLE ──────
function MoversTable({ title, data, type, source, marketStatus, timestamp, flash }) {
  const bgTint = type === 'gainers' ? '#001A00' : type === 'losers' ? '#1A0000' : '#0D0D1A';
  const accentColor = type === 'gainers' ? '#00FF88' : type === 'losers' ? '#FF4444' : '#FFB347';

  return (
    <div style={{
      background: '#0D0D1A',
      border: '1px solid #1A1A2E',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #1A1A2E',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: accentColor,
          letterSpacing: '0.1em',
        }}>
          {title}
        </span>
        {source && (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: '#555B66',
            padding: '2px 6px',
            border: '1px solid #1A1A2E',
            borderRadius: 3,
          }}>
            {source}
          </span>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['SYMBOL', 'LTP', 'CHG%', 'VOLUME'].map(h => (
              <th key={h} style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: '#555B66',
                textAlign: 'left',
                padding: '8px 12px',
                borderBottom: '1px solid #1A1A2E',
                letterSpacing: '0.1em',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            [1, 2, 3, 4, 5, 6].map(i => <SkeletonRow key={i} />)
          ) : (
            data.slice(0, 6).map((item, i) => (
              <tr
                key={i}
                className={flash ? 'flash-update' : ''}
                style={{
                  background: bgTint,
                  transition: 'background 0.3s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = `${accentColor}10`}
                onMouseLeave={(e) => e.currentTarget.style.background = bgTint}
              >
                <td style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: '#FFFFFF',
                  padding: '8px 12px',
                  fontWeight: 700,
                }}>
                  {item.symbol}
                </td>
                <td style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: '#CCC',
                  padding: '8px 12px',
                }}>
                  {item.ltp?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: accentColor,
                  padding: '8px 12px',
                }}>
                  {item.pChange >= 0 ? '+' : ''}{item.pChange?.toFixed(2)}%
                </td>
                <td style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  color: type === 'volume' ? '#FFB347' : '#8892A0',
                  padding: '8px 12px',
                }}>
                  {item.volume?.toLocaleString('en-IN')}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {timestamp && (
        <div style={{
          padding: '6px 16px',
          borderTop: '1px solid #1A1A2E',
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          color: '#555B66',
        }}>
          Updated: {new Date(timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
      )}
    </div>
  );
}

// ────── SPARKLINE CHART ──────
function SparklineChart({ name, data, color }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        background: '#0D0D1A',
        border: '1px solid #1A1A2E',
        borderRadius: 8,
        padding: 16,
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#8892A0', marginBottom: 8 }}>
          {name}
        </div>
        <div className="skeleton-bar" style={{ height: 80, width: '100%' }} />
      </div>
    );
  }

  const currentVal = data[data.length - 1]?.close || 0;
  const startVal = data[0]?.close || 0;
  const change30d = startVal > 0 ? ((currentVal - startVal) / startVal * 100).toFixed(2) : '0.00';
  const isUp = parseFloat(change30d) >= 0;

  return (
    <div style={{
      background: '#0D0D1A',
      border: '1px solid #1A1A2E',
      borderRadius: 8,
      padding: 16,
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: '#8892A0',
        marginBottom: 4,
        letterSpacing: '0.05em',
      }}>
        {name}
      </div>

      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 14,
          fontWeight: 700,
          color: '#FFFFFF',
        }}>
          {currentVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: isUp ? '#00FF88' : '#FF4444',
        }}>
          {isUp ? '▲' : '▼'} {change30d}% (30d)
        </span>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════
// MARKETS PAGE
// ════════════════════════════════════════════════
export default function Markets() {
  const [movers, setMovers] = useState(null);
  const [sparklines, setSparklines] = useState(null);
  const [mktStatus, setMktStatus] = useState(null);
  const [flash, setFlash] = useState(false);

  // ────── FETCH DATA ──────
  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const r = await fetch('/api/market/movers');
        if (r.ok) {
          const d = await r.json();
          setMovers(d);
          setFlash(true);
          setTimeout(() => setFlash(false), 800);
        }
      } catch {}
    };

    const fetchSparklines = async () => {
      try {
        const r = await fetch('/api/index-sparklines');
        if (r.ok) setSparklines(await r.json());
      } catch {}
    };

    const fetchStatus = async () => {
      try {
        const r = await fetch('/api/market-status');
        if (r.ok) setMktStatus(await r.json());
      } catch {}
    };

    fetchMovers();
    fetchSparklines();
    fetchStatus();

    const moversInterval = setInterval(fetchMovers, 5 * 60 * 1000);
    const sparkInterval = setInterval(fetchSparklines, 5 * 60 * 1000);
    const statusInterval = setInterval(fetchStatus, 30 * 1000);

    return () => {
      clearInterval(moversInterval);
      clearInterval(sparkInterval);
      clearInterval(statusInterval);
    };
  }, []);

  const statusColor = mktStatus?.color === 'green' ? '#00FF88' : mktStatus?.color === 'amber' ? '#FFB347' : '#FF4444';

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto', paddingBottom: 80 }}>

      {/* ══ SECTION 1: THREE MOVERS COLUMNS ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        <MoversTable
          title="TOP GAINERS"
          data={movers?.gainers}
          type="gainers"
          source={movers?.source}
          marketStatus={movers?.market_status}
          timestamp={movers?.timestamp}
          flash={flash}
        />
        <MoversTable
          title="TOP LOSERS"
          data={movers?.losers}
          type="losers"
          source={movers?.source}
          timestamp={movers?.timestamp}
          flash={flash}
        />
        <MoversTable
          title="VOLUME SHOCKERS"
          data={movers?.volume_shockers}
          type="volume"
          source={movers?.source}
          timestamp={movers?.timestamp}
          flash={flash}
        />
      </div>

      {/* ══ SECTION 2: INDEX SPARKLINES ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        <SparklineChart name="NIFTY 50" data={sparklines?.NIFTY} color="#00D4FF" />
        <SparklineChart name="SENSEX" data={sparklines?.SENSEX} color="#FFB347" />
        <SparklineChart name="BANKNIFTY" data={sparklines?.BANKNIFTY} color="#A855F7" />
      </div>

      {/* ══ SECTION 3: MARKET STATUS BAR ══ */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#0D0D1A',
        borderTop: '1px solid #1A1A2E',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 500,
      }}>
        <div
          className={mktStatus?.is_open ? 'live-dot' : (mktStatus?.color === 'amber' ? 'live-dot-amber' : 'live-dot-red')}
        />
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: statusColor,
        }}>
          {mktStatus?.status || 'CHECKING...'}
        </span>
        {mktStatus?.next_event && (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: '#555B66',
          }}>
            — {mktStatus.next_event}
          </span>
        )}
      </div>
    </div>
  );
}
