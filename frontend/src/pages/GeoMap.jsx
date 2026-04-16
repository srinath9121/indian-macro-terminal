import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// ────── INDIA IMPACT MAPPINGS ──────
const IMPACT_MAP = {
  'China': 'Trade tension, tech supply chain, border disputes',
  'Pakistan': 'Regional security risk, defence sector impact',
  'Iran': 'Strait of Hormuz, oil supply risk, Brent price spike',
  'Russia': 'Energy prices, fertilizer supply',
  'United States of America': 'FII flows, Fed policy, dollar strength',
  'United States': 'FII flows, Fed policy, dollar strength',
  'USA': 'FII flows, Fed policy, dollar strength',
  'Saudi Arabia': 'Oil price, petrodollar flows',
  'United Kingdom': 'Trade agreement, FPI flows',
  'Yemen': 'Red Sea shipping risk, freight cost spike',
  'Oman': 'Strait of Hormuz adjacency, oil transit risk',
};

import MainGlobe from '../components/MainGlobe';


// ════════════════════════════════════════════════
// GEO MAP PAGE
// ════════════════════════════════════════════════
export default function GeoMap() {
  const [gdeltData, setGdeltData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  // ────── FETCH GDELT DATA ──────
  useEffect(() => {
    const fetchGdelt = async () => {
      try {
        const resp = await fetch('/api/gdelt/india-events');
        if (resp.ok) {
          const data = await resp.json();
          setGdeltData(data);
          setLastUpdated(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
          setFallbackMode(false);
        } else {
          setFallbackMode(true);
        }
      } catch {
        setFallbackMode(true);
      }
    };

    fetchGdelt();
    const id = setInterval(fetchGdelt, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleCountryClick = useCallback((name) => {
    setSelectedCountry(name);
  }, []);

  const getSeverityColor = (label) => {
    const l = (label || '').toUpperCase();
    if (l === 'CRITICAL') return '#FF4444';
    if (l === 'ELEVATED' || l === 'HIGH') return '#FF8C00';
    if (l === 'CAUTION' || l === 'MEDIUM') return '#3B82F6';
    return '#00FF88';
  };

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', background: '#060611' }}>

      {/* ────── TOP BAR ────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        borderBottom: '1px solid #1A1A2E',
        background: '#0A0A15',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="live-dot" />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#00FF88', fontWeight: 700 }}>
            LIVE
          </span>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            color: gdeltData ? getSeverityColor(gdeltData.gti_label) : '#555B66',
            fontWeight: 700,
          }}>
            Global GTI: {gdeltData?.gti != null ? Math.round(gdeltData.gti) : '--'}
          </span>
        </div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#555B66' }}>
          Last updated: {lastUpdated || '--'}
        </span>
      </div>

      {/* ────── FALLBACK BANNER REMOVED ────── */}

      {/* ────── MAIN CONTENT ────── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

        {/* GLOBE */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MainGlobe
            gtiValue={gdeltData?.gti || 50}
            onCountryClick={handleCountryClick}
          />
        </div>

        {/* SIDE PANEL (on country click) */}
        {selectedCountry && (
          <div style={{
            width: 320,
            background: '#0D0D1A',
            borderLeft: '1px solid #1A1A2E',
            padding: 20,
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                {selectedCountry}
              </span>
              <button
                onClick={() => setSelectedCountry(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #1A1A2E',
                  color: '#8892A0',
                  padding: '2px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                }}
              >
                ✕
              </button>
            </div>

            {/* Tension Score */}
            {gdeltData?.country_scores?.[selectedCountry] != null && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: '#8892A0', marginBottom: 4 }}>
                  Tension Score
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 24,
                  fontWeight: 700,
                  color: getSeverityColor(
                    gdeltData.country_scores[selectedCountry] >= 80 ? 'CRITICAL' :
                    gdeltData.country_scores[selectedCountry] >= 60 ? 'HIGH' :
                    gdeltData.country_scores[selectedCountry] >= 35 ? 'MEDIUM' : 'LOW'
                  ),
                }}>
                  {Math.round(gdeltData.country_scores[selectedCountry])}
                </div>
              </div>
            )}

            {/* India Impact */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: '#8892A0', marginBottom: 4 }}>
                India Market Impact
              </div>
              <div style={{
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                color: '#FFB347',
                lineHeight: 1.5,
                padding: 10,
                background: '#1A1A2E',
                borderRadius: 4,
              }}>
                {IMPACT_MAP[selectedCountry] || 'Monitor for indirect macro spillover.'}
              </div>
            </div>

            {/* Relevant GDELT events */}
            <div>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: '#8892A0', marginBottom: 8 }}>
                Related Events
              </div>
              {(gdeltData?.events || [])
                .filter(e => e.title?.toLowerCase().includes(selectedCountry.toLowerCase()) || e.country?.toLowerCase().includes(selectedCountry.toLowerCase()))
                .slice(0, 5)
                .map((evt, i) => (
                  <div key={i} style={{
                    padding: '8px 10px',
                    borderLeft: `2px solid ${evt.tone < -3 ? '#FF4444' : evt.tone < 0 ? '#FF8C00' : '#3B82F6'}`,
                    background: '#0A0A15',
                    marginBottom: 6,
                    borderRadius: '0 4px 4px 0',
                  }}>
                    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: '#CCC', lineHeight: 1.4 }}>
                      {evt.title}
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#555B66', marginTop: 4 }}>
                      {evt.domain} • tone: {evt.tone?.toFixed(1)}
                    </div>
                  </div>
                ))
              }
              {(gdeltData?.events || []).filter(e => 
                e.title?.toLowerCase().includes(selectedCountry.toLowerCase()) || 
                e.country?.toLowerCase().includes(selectedCountry.toLowerCase())
              ).length === 0 && (
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: '#555B66' }}>
                  No direct events in current window.
                </div>
              )}
            </div>

            {/* ────── INDIA SIGNAL CARDS ────── */}
            <div style={{ marginTop: 24, paddingBottom: 10 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#00FF88', marginBottom: 12, letterSpacing: '0.1em' }}>
                INDIA SIGNALS
              </div>
              {(() => {
                const score = gdeltData?.country_scores?.[selectedCountry] || 0;
                const confidence = Math.max(0, Math.round(100 - score));
                const c = selectedCountry.toLowerCase();
                let signals = [];
                
                if (['iran', 'saudi arabia', 'russia'].includes(c)) {
                  signals = [
                    { asset: 'BRENT', signal: 'WATCH', rule: 'Oil transit/supply risk', env: 'Volatile', trend: 'Up' },
                    { asset: 'ONGC', signal: 'WATCH', rule: 'Upstream oil producer', env: 'Favorable', trend: 'Up' },
                    { asset: 'USDINR', signal: 'SELL', rule: 'Higher oil imports widen CAD', env: 'Pressure', trend: 'Down' }
                  ];
                } else if (['china', 'pakistan'].includes(c)) {
                  signals = [
                    { asset: 'NIFTY IT', signal: 'SELL', rule: 'Supply chain & trade risk', env: 'Risk-Off', trend: 'Down' },
                    { asset: 'NIFTY', signal: 'WATCH', rule: 'Broad market pressure', env: 'Volatile', trend: 'Sideways' },
                    { asset: 'GOLD', signal: 'BUY', rule: 'Safe-haven demand', env: 'Favorable', trend: 'Up' }
                  ];
                } else if (['usa', 'united states', 'united states of america'].includes(c)) {
                  signals = [
                    { asset: 'NIFTY IT', signal: 'BUY', rule: 'USD revenue exposure', env: 'Favorable', trend: 'Up' },
                    { asset: 'USDINR', signal: 'WATCH', rule: 'Dollar strength vs FII flows', env: 'Volatile', trend: 'Sideways' },
                    { asset: 'NIFTY', signal: 'NEUTRAL', rule: 'Mixed macro spillovers', env: 'Neutral', trend: 'Sideways' }
                  ];
                } else {
                  signals = [
                    { asset: 'NIFTY', signal: 'WATCH', rule: 'Monitor macro developments', env: 'Neutral', trend: 'Sideways' },
                    { asset: 'GOLD', signal: 'WATCH', rule: 'Global risk proxy', env: 'Neutral', trend: 'Sideways' }
                  ];
                }

                return signals.map((s, i) => {
                  const sColor = s.signal === 'BUY' ? '#00FF88' : s.signal === 'SELL' ? '#FF4444' : '#FFB347';
                  return (
                    <div key={i} style={{
                      background: '#0A0A15',
                      border: '1px solid #1A1A2E',
                      borderRadius: 6,
                      padding: 12,
                      marginBottom: 10
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            background: `${sColor}20`,
                            color: sColor,
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 10,
                            fontWeight: 700
                          }}>
                            {s.signal}
                          </span>
                          <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 13, color: '#FFF' }}>
                            {s.asset}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#00D4FF' }}>
                          {confidence}% CONF
                        </span>
                      </div>
                      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: '#8892A0', fontStyle: 'italic', marginBottom: 8 }}>
                        {s.rule}
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#555B66' }}>
                          ENV: <span style={{ color: '#FFF' }}>{s.env}</span>
                        </span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#555B66' }}>
                          TREND: <span style={{ color: '#FFF' }}>{s.trend}</span>
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 9, color: '#555B66', textAlign: 'center', marginTop: 12 }}>
                For informational purposes only. Not financial advice.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ────── BOTTOM TICKER ────── */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid #1A1A2E',
        background: '#0A0A15',
        display: 'flex',
        gap: 24,
        overflowX: 'auto',
      }}>
        {(gdeltData?.events || []).slice(0, 5).map((evt, i) => {
          const severity = Math.abs(evt.tone || 0) > 5 ? 'CRITICAL' : Math.abs(evt.tone || 0) > 3 ? 'HIGH' : 'MEDIUM';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', minWidth: 0 }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: getSeverityColor(severity),
                padding: '1px 4px',
                border: `1px solid ${getSeverityColor(severity)}40`,
                borderRadius: 2,
              }}>
                {severity}
              </span>
              <span style={{
                fontFamily: "Arial, sans-serif",
                fontSize: 11,
                color: '#8892A0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 300,
              }}>
                {evt.title}
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#555B66' }}>
                {evt.domain}
              </span>
            </div>
          );
        })}
        {(!gdeltData?.events || gdeltData.events.length === 0) && (
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#555B66' }}>
            Awaiting GDELT data...
          </span>
        )}
      </div>
    </div>
  );
}
