import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
 
// Static placeholder data — replace with real alerts feed from your backend.
const NOTIFICATIONS = [
  { title: 'ADANI POWER ▼ 1.60%', sub: 'Crossed −1.5% alert threshold · 09:14 IST' },
  { title: 'FII net selling ₹2,345 Cr', sub: 'Institutional outflow · today' },
  { title: 'Brent crossed $85/barrel', sub: 'Commodities · 2 hrs ago' },
];
 
export default function Topbar({ crumb }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [clock, setClock] = useState('');
  const [query, setQuery] = useState('');
 
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
 
  // live clock, same as shared.js tick()
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' IST');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
 
  // close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
 
  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && query.trim()) {
      // TODO: wire to your backend /api/search endpoint
      alert(`Search: "${query.trim()}" — wire this input to your backend /api/search endpoint.`);
    }
  }
 
  return (
    <div className="topbar">
      <div className="crumb">
        Overview <span>/</span> <b>{crumb}</b>
      </div>
      <div className="top-right">
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)', fontVariantNumeric: 'tabular-nums', marginRight: 4 }}>{clock}</span>
        <div className="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search tickers, signals…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
 
        <div
          className="top-icon"
          onClick={() => alert('Settings panel — connect this to your preferences page.')}
        >
          ⚙
        </div>
 
        <div className="top-icon-wrap" ref={notifRef}>
          <div className="top-icon" onClick={() => setNotifOpen((v) => !v)}>
            🔔<span className="top-badge">{NOTIFICATIONS.length}</span>
          </div>
          <div className={'dropdown' + (notifOpen ? ' open' : '')}>
            {NOTIFICATIONS.map((n, i) => (
              <div className="dropdown-item" key={i}>
                <div className="t">{n.title}</div>
                <div className="s">{n.sub}</div>
              </div>
            ))}
          </div>
        </div>
 
        <div className="top-icon-wrap" ref={profileRef}>
          <div className="avatar" onClick={() => setProfileOpen((v) => !v)}>SR</div>
          <div className={'dropdown' + (profileOpen ? ' open' : '')} style={{ width: 200 }}>
            <div className="dropdown-item"><div className="t">Srinath</div><div className="s">View profile</div></div>
            <div className="dropdown-item"><div className="t">Preferences</div><div className="s">Theme, alerts, data sources</div></div>
            <div className="dropdown-item" onClick={() => navigate('/')}><div className="t">Sign out</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
