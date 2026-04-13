import { useState, useEffect, useRef, useCallback } from 'react';
import Pulse from './pages/Pulse.jsx';
import GeoMap from './pages/GeoMap.jsx';
import Markets from './pages/Markets.jsx';

const TABS = ['PULSE', 'GEO MAP', 'MARKETS'];

export default function App() {
  const [activeTab, setActiveTab] = useState('PULSE');
  const [liveData, setLiveData] = useState(null);
  const [wsStatus, setWsStatus] = useState('CONNECTING...');
  const [marketStatus, setMarketStatus] = useState(null);
  const [gtiValue, setGtiValue] = useState(null);
  const [gtiLabel, setGtiLabel] = useState(null);
  const [clock, setClock] = useState('');
  const [showScanline, setShowScanline] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(3000);

  // ────── IST CLOCK ──────
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000));
      const hh = String(ist.getUTCHours()).padStart(2, '0');
      const mm = String(ist.getUTCMinutes()).padStart(2, '0');
      const ss = String(ist.getUTCSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ────── WEBSOCKET ──────
  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('LIVE');
      reconnectDelayRef.current = 3000;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'price_update') {
          setLiveData(msg.data);
          if (msg.data?.market_status) setMarketStatus(msg.data.market_status);
          if (msg.data?.gti != null) setGtiValue(msg.data.gti);
        } else if (msg.type === 'heartbeat') {
          if (msg.market_status) setMarketStatus(msg.market_status);
          // Respond to implicit ping
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        }
      } catch (e) {
        console.warn('WS parse error:', e);
      }
    };

    ws.onclose = () => {
      setWsStatus('RECONNECTING...');
      const delay = reconnectDelayRef.current;
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(delay * 2, 30000);
        connectWebSocket();
      }, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWebSocket]);

  // ────── GTI BADGE (fetch independently) ──────
  useEffect(() => {
    const fetchGti = async () => {
      try {
        const resp = await fetch('/api/gdelt/india-events');
        if (resp.ok) {
          const data = await resp.json();
          setGtiValue(data.gti);
          setGtiLabel(data.gti_label);
        }
      } catch {
        // Endpoint may not exist yet
      }
    };
    fetchGti();
    const id = setInterval(fetchGti, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ────── TAB SWITCH WITH SCANLINE ──────
  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setShowScanline(true);
    setTimeout(() => {
      setActiveTab(tab);
      setShowScanline(false);
    }, 300);
  };

  // ────── GTI BADGE COLOR ──────
  const getGtiColor = (val) => {
    if (val == null) return '#555B66';
    if (val >= 80) return '#FF4444';
    if (val >= 60) return '#FF8C00';
    if (val >= 35) return '#3B82F6';
    return '#00FF88';
  };

  // ────── STYLES ──────
  const styles = {
    app: {
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      flexDirection: 'column',
    },
    navbar: {
      width: '100%',
      height: 48,
      background: '#0D0D1A',
      borderBottom: '1px solid #1A1A2E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    logo: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 14,
      color: '#00D4FF',
      fontWeight: 700,
      letterSpacing: '0.05em',
      cursor: 'pointer',
      userSelect: 'none',
    },
    tabContainer: {
      display: 'flex',
      gap: 0,
    },
    tab: (isActive) => ({
      fontFamily: "'Space Mono', monospace",
      fontSize: 11,
      fontWeight: 700,
      padding: '6px 18px',
      cursor: 'pointer',
      border: 'none',
      borderBottom: isActive ? '2px solid #00D4FF' : '2px solid transparent',
      background: 'transparent',
      color: isActive ? '#FFFFFF' : '#555B66',
      letterSpacing: '0.1em',
      transition: 'all 0.2s',
    }),
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },
    wsIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    wsText: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 10,
      color: wsStatus === 'LIVE' ? '#00FF88' : '#FF8C00',
      fontWeight: 700,
    },
    clockText: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 12,
      color: '#8892A0',
      fontWeight: 400,
    },
    gtiBadge: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 4,
      color: getGtiColor(gtiValue),
      border: `1px solid ${getGtiColor(gtiValue)}40`,
      background: `${getGtiColor(gtiValue)}15`,
    },
    content: {
      flex: 1,
      marginTop: 48,
      position: 'relative',
    },
    scanlineOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.08) 50%, transparent 100%)',
      animation: 'scanline 0.3s linear',
    },
  };

  return (
    <div style={styles.app}>
      {/* ────── NAVBAR ────── */}
      <nav style={styles.navbar}>
        {/* LEFT: Logo */}
        <div style={styles.logo} onClick={() => handleTabSwitch('PULSE')}>
          ◈ INDIA MACRO TERMINAL
        </div>

        {/* CENTER: Tabs */}
        <div style={styles.tabContainer}>
          {TABS.map((tab) => (
            <button
              key={tab}
              style={styles.tab(activeTab === tab)}
              onClick={() => handleTabSwitch(tab)}
              onMouseEnter={(e) => {
                if (activeTab !== tab) e.target.style.color = '#AAAAAA';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) e.target.style.color = '#555B66';
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* RIGHT: Status indicators */}
        <div style={styles.rightSection}>
          {/* WS Status */}
          <div style={styles.wsIndicator}>
            <div className={wsStatus === 'LIVE' ? 'live-dot' : 'live-dot-amber'} />
            <span style={styles.wsText}>{wsStatus}</span>
          </div>

          {/* Clock */}
          <span style={styles.clockText}>{clock} IST</span>

          {/* GTI Badge */}
          <span style={styles.gtiBadge}>
            GTI: {gtiValue != null ? Math.round(gtiValue) : '--'}
          </span>
        </div>
      </nav>

      {/* ────── CONTENT ────── */}
      <div style={styles.content}>
        {showScanline && <div style={styles.scanlineOverlay} />}
        <div className="fade-in" key={activeTab}>
          {activeTab === 'PULSE' && <Pulse liveData={liveData} />}
          {activeTab === 'GEO MAP' && <GeoMap />}
          {activeTab === 'MARKETS' && <Markets />}
        </div>
      </div>
    </div>
  );
}
