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
  { name: "Middle East", countries: ["IR", "SA", "IL", "PS", "YE", "IQ"], impact: "Iran Hormuz risk. India imports 85% of crude via sea. ONGC / BPCL / IOC watch." },
  { name: "China",        countries: ["CN"],                                impact: "FII outflow risk. IT supply chain pressure. HDFC/ICICI watch. Border tensions amplify capital outflows." },
  { name: "US",           countries: ["US"],                                impact: "Fed rate sensitivity. Dollar strength = INR weakness. FII flows at risk. IT sector USD revenue benefit." },
  { name: "Europe",       countries: ["RU", "UA", "DE", "FR", "GB"],        impact: "Russia sanctions impact oil/fertilizer supply. GSFC/Chambal Fertilisers exposure. Rupee pressure." },
  { name: "ASEAN",        countries: ["SG", "MY", "TH", "ID", "VN"],        impact: "Trade route stability. Key export markets for Indian IT and pharma sectors." },
  { name: "South Asia",   countries: ["PK", "BD", "LK", "NP"],             impact: "Pakistan border tension = defence sector bullish. HAL/BEL/Bharat Dynamics/MTAR Tech watch." },
];

function RegionCard({ region, score }) {
  const color = score >= 70 ? "var(--accent-red)" : score >= 45 ? "var(--accent-amber)" : "var(--accent-teal)";
  const label = score >= 70 ? "HIGH" : score >= 45 ? "ELEVATED" : "STABLE";
  return (
    <div style={{ background: "var(--bg-card)", border: `1px solid var(--border-default)`, borderLeft: `4px solid ${color}`, borderRadius: 6, padding: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ color: "var(--text-primary)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>{region.name.toUpperCase()}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color, fontSize: 12, fontWeight: 900, fontFamily: "var(--mono)" }}>{score}</span>
          <span style={{ background: `${color}22`, color, border: `1px solid ${color}55`, borderRadius: 3, fontSize: 8, padding: "1px 5px", fontFamily: "var(--mono)", fontWeight: 700 }}>{label}</span>
        </div>
      </div>
      <div className="type-micro" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{region.impact}</div>
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
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* GTI Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "8px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="type-label">GLOBAL GEOPOLITICAL MAP</span>
            <Badge color="green">LIVE</Badge>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div className="type-micro" style={{ color: "var(--text-muted)" }}>INDIA GRI</div>
              <div style={{ color: gtiColor, fontSize: 18, fontWeight: 900, fontFamily: "var(--mono)" }}>{gti.toFixed(1)}</div>
            </div>
            <div style={{ background: `${gtiColor}22`, color: gtiColor, border: `1px solid ${gtiColor}55`, borderRadius: 4, padding: "4px 12px", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700 }}>
              {gtiLabel}
            </div>
            {/* CSS Loading Spinner & Stale Data Badge (Section 4.5) */}
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, border: "2px solid var(--border-default)", borderTop: "2px solid var(--accent-teal)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span className="type-micro" style={{ color: "var(--text-muted)" }}>FETCHING GDELT...</span>
              </div>
            ) : (
              <span className="type-micro" style={{ color: "var(--accent-amber)" }}>STALE DATA - last updated {formatTime24()}</span>
            )}
          </div>
        </div>

        {/* India GRI Footnote Explainer (Section 4.5) */}
        <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: -8, fontStyle: "italic", paddingLeft: 6 }}>
          * Geopolitical Risk Index (GRI) — composite of oil, rates, China, and Middle East exposure.
        </div>

        {/* Main Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 280px", gap: 14, minHeight: 480 }}>

          {/* Left panel Color Legends (Section 4.5) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="type-label" style={{ marginBottom: 2 }}>ACTIVE TRADE & RISK ARCS</div>
            {LEGEND_ITEMS.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid var(--border-default)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}` }} />
                <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)" }}>
                    {item.name} <span style={{ color: "var(--text-muted)", fontSize: 8 }}>{item.impact}</span>
                  </span>
                  <span style={{ color: item.color, fontSize: 8, fontWeight: 700, fontFamily: "var(--mono)", background: `${item.color.replace('0.8', '0.15')}`, border: `1px solid ${item.color.replace('0.8', '0.3')}`, borderRadius: 3, padding: "2px 6px" }}>{item.flow}</span>
                </div>
              </div>
            ))}

            {/* Flow Type Legend */}
            <div style={{ marginTop: 4, background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "8px 10px" }}>
              <div className="type-label" style={{ fontSize: 9, marginBottom: 6 }}>FLOW TYPE LEGEND</div>
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

          {/* Center: Globe */}
          <div style={{ background: "#000005", borderRadius: 8, border: "1px solid var(--border-default)", overflow: "hidden", position: "relative", minHeight: 460 }}>
            <ErrorBoundary fallback={<div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--mono)", fontSize: 11 }}>GLOBE UNAVAILABLE</div>}>
              <MainGlobe
                gtiValue={gti}
                countryScores={countryScores}
                arcsData={ARCS_DATA}
                onCountryClick={(name) => setSelectedCountry(name)}
              />
            </ErrorBoundary>
            {selectedCountry && (
              <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.85)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "6px 14px", color: "var(--text-primary)", fontSize: 11, fontFamily: "var(--mono)" }}>
                Selected: {selectedCountry} — <button onClick={() => setSelectedCountry(null)} style={{ background: "none", border: "none", color: "var(--accent-blue)", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)" }}>✕ Clear</button>
              </div>
            )}
          </div>

          {/* Right: Global Impact Signals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="type-label" style={{ marginBottom: 2 }}>GLOBAL IMPACT SIGNALS</div>
            {[
              { label: "Middle East → BRENT", signal: "WATCH",   reason: "Iran Hormuz risk. India imports 85% of crude via sea. ONGC / BPCL / IOC watch.", color: "var(--accent-amber)" },
              { label: "China → NIFTY IT",    signal: "WATCH",   reason: "Supply chain pressure. FII risk-off. Tech sector underperform risk.", color: "var(--accent-amber)" },
              { label: "Russia → USDINR",     signal: "MONITOR", reason: "Energy import bill. Fertilizer supply. Rupee pressure from trade deficit.", color: "#60a5fa" },
              { label: "USA → FII FLOWS",     signal: "POSITIVE",reason: "Fed pause = FII inflows. IT sector USD revenue tailwind.", color: "var(--accent-teal)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: `1px solid var(--border-default)`, borderLeft: `4px solid ${s.color}`, borderRadius: 6, padding: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-primary)", fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)" }}>{s.label}</span>
                  {/* Standardized Pill Width: min-width: 70px (Section 4.5) */}
                  <span style={{ 
                    color: s.color, 
                    fontSize: 8, 
                    fontWeight: 700, 
                    fontFamily: "var(--mono)", 
                    minWidth: 70, 
                    textAlign: "center", 
                    display: "inline-block", 
                    background: `${s.color}15`, 
                    border: `1px solid ${s.color}33`, 
                    borderRadius: 4, 
                    padding: "2px 6px" 
                  }}>{s.signal}</span>
                </div>
                <div className="type-micro" style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>{s.reason}</div>
              </div>
            ))}

            {/* Latest GDELT events */}
            {gdeltData?.events?.length > 0 && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 6, padding: "8px 10px" }}>
                <div className="type-label" style={{ fontSize: 9, marginBottom: 6 }}>LATEST GDELT EVENTS</div>
                {gdeltData.events.slice(0, 2).map((e, i) => (
                  <div key={i} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: i < 1 ? "1px solid var(--border-default)" : "none" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: 9, fontFamily: "var(--mono)", lineHeight: 1.4 }}>{(e.title || "").slice(0, 60)}{(e.title || "").length > 60 ? "..." : ""}</div>
                    <div style={{ color: e.goldstein < 0 ? "var(--accent-red)" : "var(--accent-teal)", fontSize: 8, fontFamily: "var(--mono)", marginTop: 2 }}>Tone: {e.goldstein?.toFixed(1) ?? "N/A"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Region Detail Cards */}
        <div>
          <div className="type-label" style={{ marginBottom: 10 }}>INDIA IMPACT ANALYSIS BY REGION</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {regionScores.map(r => (
              <RegionCard key={r.name} region={r} score={r.score} />
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
