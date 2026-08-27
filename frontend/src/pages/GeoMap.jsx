import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Badge from "../components/ui/Badge";
import MainGlobe from "../components/MainGlobe";
import ErrorBoundary from "../components/ErrorBoundary";
import { fetchApi } from "../services/api";

const PULSE_STYLE = `
  @keyframes _pulse { 0%,100%{opacity:0.35} 50%{opacity:1} }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

const ARCS_DATA = [
  { startLat: 32.4, startLng: 53.7, endLat: 20.6, endLng: 78.9, color: "rgba(234,179,8,0.8)",  label: "Iran",    flow: "Commodity",  commodity: "oil" },
  { startLat: 61.5, startLng: 105.3, endLat: 20.6, endLng: 78.9, color: "rgba(249,115,22,0.8)", label: "Russia",  flow: "Sanctions",  commodity: "oil" },
  { startLat: 35.9, startLng: 104.2, endLat: 20.6, endLng: 78.9, color: "rgba(239,68,68,0.8)",  label: "China",   flow: "Military",   commodity: "metals" },
  { startLat: 30.4, startLng: 69.3,  endLat: 20.6, endLng: 78.9, color: "rgba(239,68,68,0.8)",  label: "Pakistan",flow: "Military",   commodity: null },
  { startLat: 37.1, startLng: -95.7, endLat: 20.6, endLng: 78.9, color: "rgba(59,130,246,0.8)", label: "USA",     flow: "Diplomatic", commodity: null },
  { startLat: 23.9, startLng: 45.1,  endLat: 20.6, endLng: 78.9, color: "rgba(234,179,8,0.8)",  label: "Saudi",   flow: "Commodity",  commodity: "oil" },
];

const LEGEND_ITEMS = [
  { name: "US", color: "rgba(59,130,246,0.8)", impact: "→ NIFTY IT", flow: "Diplomatic" },
  { name: "Middle East", color: "rgba(249,115,22,0.8)", impact: "→ BRENT", flow: "Commodity" },
  { name: "Russia", color: "rgba(234,179,8,0.8)", impact: "→ BRENT", flow: "Sanctions" },
  { name: "China", color: "rgba(239,68,68,0.8)", impact: "→ METALS", flow: "Military" }
];

const REGION_DATA = [
  { name: "Middle East", countries: ["IR", "SA", "IL", "PS", "YE", "IQ"], impact: "Iran Hormuz risk. India imports 85% of crude via sea." },
  { name: "China",        countries: ["CN"],                                impact: "FII outflow risk. IT supply chain pressure." },
  { name: "US",           countries: ["US"],                                impact: "Fed rate sensitivity. Dollar strength = INR weakness." },
  { name: "Europe",       countries: ["RU", "UA", "DE", "FR", "GB"],        impact: "Russia sanctions impact oil/fertilizer supply." },
];

function RegionCard({ region, score }) {
  const color = score >= 70 ? "var(--accent-red)" : score >= 45 ? "var(--accent-amber)" : "var(--accent-teal)";
  const label = score >= 70 ? "HIGH" : score >= 45 ? "ELEVATED" : "STABLE";
  return (
    <div style={{ background: "var(--bg-card)", border: `1px solid var(--border-default)`, borderLeft: `4px solid ${color}`, borderRadius: 6, padding: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ color: "var(--text-primary)", fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)" }}>{region.name.toUpperCase()}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color, fontSize: 11, fontWeight: 900, fontFamily: "var(--mono)" }}>{score}</span>
        </div>
      </div>
      <div className="type-micro" style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>{region.impact}</div>
    </div>
  );
}

export default function GeoMap() {
  const [gdeltData, setGdeltData]     = useState(null);
  const [countryScores, setCountryScores] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!document.getElementById('_geomap-pulse')) {
      const s = document.createElement('style');
      s.id = '_geomap-pulse';
      s.textContent = PULSE_STYLE;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    async function load() {
      const data = await fetchApi("/gdelt/india-events");
      if (data) {
        setGdeltData(data);
        const scores = {};
        (data.events || []).forEach(e => {
          if (e.country_code) {
            scores[e.country_code] = Math.max(scores[e.country_code] || 0, Math.min(100, Math.abs(e.goldstein || 0) * 10));
          }
        });
        setCountryScores(scores);
      }
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 900000); // 15 min
    return () => clearInterval(interval);
  }, []);

  const gti = gdeltData?.gti ?? 50;
  const gtiLabel = gdeltData?.gti_label ?? "MODERATE";
  const gtiColor = gti >= 80 ? "var(--accent-red)" : gti >= 60 ? "var(--accent-amber)" : gti >= 35 ? "#60a5fa" : "var(--accent-teal)";

  const regionScores = REGION_DATA.map(region => {
    const events = (gdeltData?.events || []).filter(e =>
      region.countries.includes(e.country_code || "")
    );
    const score = events.length > 0
      ? Math.min(100, Math.round(events.reduce((acc, e) => acc + Math.abs(e.goldstein || 0), 0) / events.length * 10))
      : Math.round(35 + Math.random() * 20);
    return { ...region, score };
  });

  const formatTime24 = () => {
    const d = gdeltData?.timestamp ? new Date(gdeltData.timestamp) : new Date();
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }) + " IST";
  };

  return (
    <Layout noPadding={true}>
      <div style={{ position: "relative", width: "100%", height: "calc(100vh - 52px)", overflow: "hidden", background: "var(--bg-card)" }}>
        
        {/* Globe Container (Full Screen) */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <ErrorBoundary fallback={<div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--mono)", fontSize: 11 }}>GLOBE UNAVAILABLE</div>}>
            <MainGlobe
              gtiValue={gti}
              countryScores={countryScores}
              arcsData={ARCS_DATA}
              onCountryClick={(name) => setSelectedCountry(name)}
            />
          </ErrorBoundary>
        </div>

        {/* Overlay: Left Panel */}
        <div style={{ position: "absolute", top: 20, left: 20, width: 280, display: "flex", flexDirection: "column", gap: 10, zIndex: 10 }}>
          {/* Header */}
          <div style={{ background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(12px)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)" }}>GLOBAL RISK</span>
              <Badge color="green">LIVE</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ color: gtiColor, fontSize: 24, fontWeight: 900, fontFamily: "var(--mono)" }}>{gti.toFixed(1)}</div>
              <div style={{ color: gtiColor, fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{gtiLabel}</div>
            </div>
            <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 4 }}>
               {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, border: "2px solid var(--border-default)", borderTop: "2px solid var(--accent-teal)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    FETCHING GDELT...
                  </span>
                ) : (
                  <span>Updated {formatTime24()}</span>
                )}
            </div>
          </div>

          {/* Legends */}
          <div style={{ background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(12px)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "12px" }}>
             <div className="type-label" style={{ marginBottom: 6 }}>ACTIVE TRADE ARCS</div>
              {LEGEND_ITEMS.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 6, marginBottom: 6, borderBottom: i < LEGEND_ITEMS.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}` }} />
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)" }}>
                      {item.name}
                    </span>
                    <span style={{ color: item.color, fontSize: 8, fontWeight: 700, fontFamily: "var(--mono)", background: `${item.color.replace('0.8', '0.15')}`, border: `1px solid ${item.color.replace('0.8', '0.3')}`, borderRadius: 3, padding: "2px 6px" }}>{item.flow}</span>
                  </div>
                </div>
              ))}
          </div>

           {/* Flow Legend */}
            <div style={{ background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(12px)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "12px" }}>
              <div className="type-label" style={{ fontSize: 9, marginBottom: 8 }}>FLOW TYPES</div>
              {[
                ["rgba(234,179,8,0.8)", "Commodity", "Oil, Gas, Metals trade routes"],
                ["rgba(239,68,68,0.8)", "Military", "Border tension, defense risk"],
                ["rgba(59,130,246,0.8)", "Diplomatic", "Policy, sanctions, FII impact"],
                ["rgba(249,115,22,0.8)", "Sanctions", "Trade restrictions, supply risk"],
              ].map(([c, label, desc]) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <span style={{ color: "var(--text-secondary)", fontSize: 8, fontFamily: "var(--mono)", fontWeight: 700 }}>{label}</span>
                    <div style={{ color: "var(--text-muted)", fontSize: 7, fontFamily: "var(--mono)" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Overlay: Right Panel */}
        <div style={{ position: "absolute", top: 20, right: 20, width: 300, display: "flex", flexDirection: "column", gap: 10, zIndex: 10 }}>
            {/* Impact Signals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Middle East → BRENT", signal: "WATCH",   reason: "Iran Hormuz risk. India imports 85% of crude via sea.", color: "var(--accent-amber)" },
                { label: "China → NIFTY IT",    signal: "WATCH",   reason: "Supply chain pressure. FII risk-off.", color: "var(--accent-amber)" },
                { label: "Russia → USDINR",     signal: "MONITOR", reason: "Energy import bill. Fertilizer supply. Rupee pressure.", color: "#60a5fa" },
                { label: "USA → FII FLOWS",     signal: "POSITIVE",reason: "Fed pause = FII inflows.", color: "var(--accent-teal)" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(12px)", border: `1px solid var(--border-default)`, borderLeft: `3px solid ${s.color}`, borderRadius: 6, padding: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "var(--text-primary)", fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)" }}>{s.label}</span>
                    <span style={{ 
                      color: s.color, 
                      fontSize: 8, 
                      fontWeight: 700, 
                      fontFamily: "var(--mono)", 
                      background: `${s.color}15`, 
                      border: `1px solid ${s.color}33`, 
                      borderRadius: 4, 
                      padding: "2px 6px" 
                    }}>{s.signal}</span>
                  </div>
                  <div className="type-micro" style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>{s.reason}</div>
                </div>
              ))}
            </div>

            {/* Region Detail Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
               <div className="type-label" style={{ marginTop: 4, padding: "0 4px", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>INDIA IMPACT BY REGION</div>
              {regionScores.map(r => (
                <RegionCard key={r.name} region={r} score={r.score} />
              ))}
            </div>
        </div>

        {selectedCountry && (
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "8px 16px", color: "var(--text-primary)", fontSize: 12, fontFamily: "var(--mono)", zIndex: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            Selected: <span style={{ fontWeight: 700 }}>{selectedCountry}</span> — <button onClick={() => setSelectedCountry(null)} style={{ background: "none", border: "none", color: "var(--accent-blue)", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700, marginLeft: 8 }}>✕ Clear</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
