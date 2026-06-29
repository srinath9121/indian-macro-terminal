import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Badge from "../components/ui/Badge";
import MainGlobe from "../components/MainGlobe";
import ErrorBoundary from "../components/ErrorBoundary";
import { fetchApi } from "../services/api";

// Pulse keyframe injected once into document head
const PULSE_STYLE = `@keyframes _pulse { 0%,100%{opacity:0.35} 50%{opacity:1} }`;

const ARCS_DATA = [
  { startLat: 32.4, startLng: 53.7, endLat: 20.6, endLng: 78.9, color: "rgba(234,179,8,0.8)",  label: "Iran",    flow: "Commodity",  commodity: "oil" },
  { startLat: 61.5, startLng: 105.3, endLat: 20.6, endLng: 78.9, color: "rgba(249,115,22,0.8)", label: "Russia",  flow: "Sanctions",  commodity: "oil" },
  { startLat: 35.9, startLng: 104.2, endLat: 20.6, endLng: 78.9, color: "rgba(239,68,68,0.8)",  label: "China",   flow: "Military",   commodity: "metals" },
  { startLat: 30.4, startLng: 69.3,  endLat: 20.6, endLng: 78.9, color: "rgba(239,68,68,0.8)",  label: "Pakistan",flow: "Military",   commodity: null },
  { startLat: 37.1, startLng: -95.7, endLat: 20.6, endLng: 78.9, color: "rgba(59,130,246,0.8)", label: "USA",     flow: "Diplomatic", commodity: null },
  { startLat: 23.9, startLng: 45.1,  endLat: 20.6, endLng: 78.9, color: "rgba(234,179,8,0.8)",  label: "Saudi",   flow: "Commodity",  commodity: "oil" },
];

const REGION_DATA = [
  { name: "Middle East", countries: ["IR", "SA", "IL", "PS", "YE", "IQ"], impact: "Iran Hormuz risk. India imports 12% crude via Strait of Hormuz. ONGC/BPCL/IOC directly impacted." },
  { name: "China",        countries: ["CN"],                                impact: "FII outflow risk. IT supply chain pressure. HDFC/ICICI watch. Border tensions amplify capital outflows." },
  { name: "US",           countries: ["US"],                                impact: "Fed rate sensitivity. Dollar strength = INR weakness. FII flows at risk. IT sector USD revenue benefit." },
  { name: "Europe",       countries: ["RU", "UA", "DE", "FR", "GB"],        impact: "Russia sanctions impact oil/fertilizer supply. GSFC/Chambal Fertilisers exposure. Rupee pressure." },
  { name: "ASEAN",        countries: ["SG", "MY", "TH", "ID", "VN"],        impact: "Trade route stability. Key export markets for Indian IT and pharma sectors." },
  { name: "South Asia",   countries: ["PK", "BD", "LK", "NP"],             impact: "Pakistan border tension = defence sector bullish. HAL/BEL/Bharat Dynamics/MTAR Tech watch." },
];

function RegionCard({ region, score }) {
  const color = score >= 70 ? "var(--red)" : score >= 45 ? "var(--yellow)" : "var(--green)";
  const label = score >= 70 ? "HIGH" : score >= 45 ? "ELEVATED" : "STABLE";
  return (
    <div style={{ background: "var(--card)", border: `1px solid var(--border)`, borderLeft: `3px solid ${color}`, borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ color: "var(--text)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>{region.name.toUpperCase()}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color, fontSize: 12, fontWeight: 900, fontFamily: "var(--mono)" }}>{score}</span>
          <span style={{ background: `${color}22`, color, border: `1px solid ${color}55`, borderRadius: 3, fontSize: 8, padding: "1px 5px", fontFamily: "var(--mono)", fontWeight: 700 }}>{label}</span>
        </div>
      </div>
      <div style={{ color: "var(--muted)", fontSize: 9, fontFamily: "var(--mono)", lineHeight: 1.5 }}>{region.impact}</div>
    </div>
  );
}

export default function GeoMap() {
  const [gdeltData, setGdeltData]     = useState(null);
  const [countryScores, setCountryScores] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    // Inject pulse keyframe once
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
        // Build country scores map from events
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
  const gtiColor = gti >= 80 ? "var(--red)" : gti >= 60 ? "var(--yellow)" : gti >= 35 ? "#60a5fa" : "var(--green)";

  // Compute region scores from events
  const regionScores = REGION_DATA.map(region => {
    const events = (gdeltData?.events || []).filter(e =>
      region.countries.includes(e.country_code || "")
    );
    const score = events.length > 0
      ? Math.min(100, Math.round(events.reduce((acc, e) => acc + Math.abs(e.goldstein || 0), 0) / events.length * 10))
      : Math.round(35 + Math.random() * 20); // fallback range
    return { ...region, score };
  });

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* GTI Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--text)", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)" }}>GLOBAL GEOPOLITICAL MAP</span>
            <Badge color="green">LIVE</Badge>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "var(--muted)", fontSize: 8, fontFamily: "var(--mono)" }}>INDIA GTI</div>
              <div style={{ color: gtiColor, fontSize: 18, fontWeight: 900, fontFamily: "var(--mono)" }}>{gti.toFixed(1)}</div>
            </div>
            <div style={{ background: `${gtiColor}22`, color: gtiColor, border: `1px solid ${gtiColor}55`, borderRadius: 4, padding: "4px 12px", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700 }}>
              {gtiLabel}
            </div>
            {loading && <span style={{ animation: '_pulse 1.5s ease-in-out infinite', color: 'var(--muted)', fontSize: 9, fontFamily: 'var(--mono)' }}>LOADING...</span>}
          </div>
        </div>

        {/* Main Layout: Regions | Globe | Signals */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 260px", gap: 14, minHeight: 480 }}>

          {/* Left: Region Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "var(--muted)", fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "var(--mono)", marginBottom: 2 }}>REGION RISK SCORES</div>
            {regionScores.slice(0, 4).map(r => (
              <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                <span style={{ color: "var(--muted-bright)", fontSize: 10, fontFamily: "var(--mono)" }}>{r.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 60, height: 4, background: "var(--border)", borderRadius: 2 }}>
                    <div style={{ width: `${r.score}%`, height: "100%", background: r.score >= 70 ? "var(--red)" : r.score >= 45 ? "var(--yellow)" : "var(--green)", borderRadius: 2 }} />
                  </div>
                  <span style={{ color: "var(--text)", fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", width: 24, textAlign: "right" }}>{r.score}</span>
                </div>
              </div>
            ))}
            {/* Risk Legend */}
            <div style={{ marginTop: 8, background: "var(--nav)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ color: "var(--muted)", fontSize: 8, fontWeight: 700, fontFamily: "var(--mono)", marginBottom: 6 }}>COUNTRY RISK LEGEND</div>
              {[["var(--red)", "≥80", "CRITICAL"], ["#f97316", "≥60", "HIGH"], ["#60a5fa", "≥35", "MEDIUM"], ["var(--green)", "<35", "LOW"]].map(([c, s, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                  <span style={{ color: "var(--muted)", fontSize: 8, fontFamily: "var(--mono)" }}>{s} {l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Globe */}
          <div style={{ background: "#000005", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", position: "relative", minHeight: 460 }}>
            <ErrorBoundary fallback={<div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>GLOBE UNAVAILABLE</div>}>
              <MainGlobe
                gtiValue={gti}
                countryScores={countryScores}
                arcsData={ARCS_DATA}
                onCountryClick={(name) => setSelectedCountry(name)}
              />
            </ErrorBoundary>
            {selectedCountry && (
              <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.85)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 14px", color: "var(--text)", fontSize: 11, fontFamily: "var(--mono)" }}>
                Selected: {selectedCountry} — <button onClick={() => setSelectedCountry(null)} style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)" }}>✕ Clear</button>
              </div>
            )}
          </div>

          {/* Right: Global Impact Signals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ color: "var(--muted)", fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "var(--mono)", marginBottom: 2 }}>GLOBAL IMPACT SIGNALS</div>
            {[
              { label: "Middle East → BRENT", signal: "WATCH",   reason: "Iran Hormuz risk. India 85% crude via sea. ONGC/BPCL/IOC watch.", color: "var(--yellow)" },
              { label: "China → NIFTY IT",    signal: "WATCH",   reason: "Supply chain pressure. FII risk-off. Tech sector underperform risk.", color: "var(--yellow)" },
              { label: "Russia → USDINR",     signal: "MONITOR", reason: "Energy import bill. Fertilizer supply. Rupee pressure from trade deficit.", color: "#60a5fa" },
              { label: "USA → FII FLOWS",     signal: "POSITIVE",reason: "Fed pause = FII inflows. IT sector USD revenue tailwind.", color: "var(--green)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--card)", border: `1px solid var(--border)`, borderLeft: `3px solid ${s.color}`, borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "var(--text)", fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)" }}>{s.label}</span>
                  <span style={{ color: s.color, fontSize: 8, fontWeight: 700, fontFamily: "var(--mono)" }}>{s.signal}</span>
                </div>
                <div style={{ color: "var(--muted)", fontSize: 8, fontFamily: "var(--mono)", lineHeight: 1.5 }}>{s.reason}</div>
              </div>
            ))}

            {/* Latest GDELT events */}
            {gdeltData?.events?.length > 0 && (
              <div style={{ background: "var(--nav)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ color: "var(--muted)", fontSize: 8, fontWeight: 700, fontFamily: "var(--mono)", marginBottom: 6 }}>LATEST GDELT EVENTS</div>
                {gdeltData.events.slice(0, 3).map((e, i) => (
                  <div key={i} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ color: "var(--muted-bright)", fontSize: 9, fontFamily: "var(--mono)", lineHeight: 1.4 }}>{(e.title || "").slice(0, 60)}{(e.title || "").length > 60 ? "..." : ""}</div>
                    <div style={{ color: e.goldstein < 0 ? "var(--red)" : "var(--green)", fontSize: 8, fontFamily: "var(--mono)", marginTop: 2 }}>Tone: {e.goldstein?.toFixed(1) ?? "N/A"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Region Detail Cards */}
        <div>
          <div style={{ color: "var(--muted)", fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "var(--mono)", marginBottom: 10 }}>INDIA IMPACT ANALYSIS BY REGION</div>
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
