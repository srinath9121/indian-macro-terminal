import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import Sparkline from "../components/charts/Sparkline";
import { useTerminalStore } from "../store/useTerminalStore";

const COMPANY_NAMES = {
  "TATATECH": "Tata Technologies",
  "INFY": "Infosys Limited",
  "HCLTECH": "HCL Technologies",
  "WIPRO": "Wipro Limited",
  "TCS": "Tata Consultancy Services",
  "M&M": "Mahindra & Mahindra Ltd",
  "ADANIPORTS": "Adani Ports & SEZ",
  "JSWSTEEL": "JSW Steel Limited",
  "BPCL": "Bharat Petroleum Corp",
  "TITAN": "Titan Company Ltd",
};

const MOCK_FALLBACKS = {
  "NIFTY 50": { price: 24117.65, change: 181.95, pct_change: 0.76 },
  "SENSEX": { price: 77496.36, change: 609.45, pct_change: 0.79 },
  "BANKNIFTY": { price: 55403.60, change: 3.25, pct_change: 0.01 },
  "INDIA VIX": { price: 14.20, change: -0.40, pct_change: -2.74 },
  "NIFTY NEXT 50": { price: 31245.80, change: 145.20, pct_change: 0.47 },
};

function MarketRow({ label, value, change, pct, up, sparkPoints }) {
  const color = up !== undefined ? (up ? "var(--accent-teal)" : "var(--accent-red)") : "var(--text-primary)";
  const subLabel = COMPANY_NAMES[label];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-default)" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ color: "var(--text-primary)", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700 }}>{label}</div>
        {subLabel && <div className="type-micro" style={{ fontSize: 8, color: "var(--text-muted)", marginTop: 2 }}>{subLabel}</div>}
      </div>
      {sparkPoints && (
        <div style={{ width: 50, height: 16, display: "flex", alignItems: "center" }}>
          <Sparkline color={up ? "var(--accent-teal)" : "var(--accent-red)"} points={sparkPoints} height={16} width={50} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {up !== undefined && (
          <span style={{ color, fontSize: "1rem", fontWeight: 700 }}>{up ? "▲" : "▼"}</span>
        )}
        <div style={{ color, fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)" }}>{value}</div>
      </div>
      {(change !== undefined || pct !== undefined) && (
        <div style={{ color, fontSize: 10, fontFamily: "var(--mono)", marginLeft: 8 }}>
          {change !== undefined ? `${change} (${pct.replace('%', '')}%)` : (pct.includes('%') ? pct : `${pct}%`)}
        </div>
      )}
    </div>
  );
}

function PCRRangeBar({ val }) {
  const min = 0.6;
  const max = 1.2;
  const pct = Math.min(100, Math.max(0, ((parseFloat(val) - min) / (max - min)) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", marginTop: 4, marginBottom: 8 }}>
      <span style={{ color: "var(--text-micro)", fontSize: 8, fontFamily: "var(--mono)" }}>0.6</span>
      <div style={{ flex: 1, position: "relative", height: 2, background: "var(--border-default)", borderRadius: 1 }}>
        <div style={{ position: "absolute", left: `${pct}%`, top: -3, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-teal)", transform: "translateX(-50%)", boxShadow: "0 0 4px var(--accent-teal)" }} />
      </div>
      <span style={{ color: "var(--text-micro)", fontSize: 8, fontFamily: "var(--mono)" }}>1.2</span>
    </div>
  );
}

export default function Markets() {
  const { marketData, isLoading } = useTerminalStore();

  const indices = [
    { label: "NIFTY 50", data: marketData?.nifty || MOCK_FALLBACKS["NIFTY 50"] },
    { label: "SENSEX", data: marketData?.sensex || MOCK_FALLBACKS["SENSEX"] },
    { label: "BANKNIFTY", data: marketData?.bank_nifty || MOCK_FALLBACKS["BANKNIFTY"] },
    { label: "INDIA VIX", data: marketData?.vix || MOCK_FALLBACKS["INDIA VIX"] },
    { label: "NIFTY NEXT 50", data: marketData?.nifty_next_50 || MOCK_FALLBACKS["NIFTY NEXT 50"] },
  ];

  const fiiVal = 2345.12;
  const diiVal = 3862.45;
  const maxNet = Math.max(fiiVal, diiVal, 1);
  const fiiBarWidth = (fiiVal / maxNet) * 100;
  const diiBarWidth = (diiVal / maxNet) * 100;

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-fade-in">
        
        {/* Top Bar: Primary Indices */}
        <div style={{ display: "flex", gap: 10 }}>
          {indices.map((idx) => {
            const isVix = idx.label === "INDIA VIX";
            const priceVal = idx.data?.price;
            const vixColor = isVix 
              ? (priceVal > 20 ? "var(--accent-red)" : priceVal >= 12 ? "var(--accent-amber)" : "var(--accent-teal)")
              : "var(--text-primary)";
            const up = isVix ? (priceVal < 16) : ((idx.data?.pct_change ?? 0) >= 0);

            return (
              <Card key={idx.label} style={{ flex: 1 }}>
                <div className="type-label" style={{ marginBottom: 4 }}>{idx.label}</div>
                <div className="type-hero" style={{ fontSize: 18, color: vixColor }}>
                  {priceVal ? (typeof priceVal === 'number' ? priceVal.toLocaleString("en-IN") : priceVal) : "--"}
                </div>
                <div style={{ color: up ? "var(--accent-teal)" : "var(--accent-red)", fontSize: 10, fontFamily: "var(--mono)", marginTop: 2 }}>
                  {up ? "▲" : "▼"} {idx.data?.change ?? 0} ({idx.data?.pct_change ?? 0}%)
                </div>
                <div style={{ marginTop: 8 }}>
                  <Sparkline color={up ? "var(--accent-teal)" : "var(--accent-red)"} points={up ? [3,4,3,5,4,6,5] : [6,5,6,4,5,3,4]} height={24} width={80} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          
          <Section title="SECTOR PERFORMANCE">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "NIFTY IT", val: "+1.42%", up: true },
                { label: "NIFTY FMCG", val: "+1.18%", up: true },
                { label: "NIFTY BANK", val: "+0.83%", up: true },
                { label: "NIFTY AUTO", val: "+0.55%", up: true },
                { label: "NIFTY METAL", val: "-0.24%", up: false },
                { label: "NIFTY PHARMA", val: "+0.12%", up: true },
              ].map(s => (
                <MarketRow key={s.label} label={s.label} value={s.val} up={s.up} />
              ))}
            </div>
          </Section>

          <Section title="TOP GAINERS">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "TATATECH", val: "1,142.50", chg: "+45.20", pct: "4.12", up: true },
                { label: "INFY", val: "1,542.10", chg: "+32.10", pct: "2.12", up: true },
                { label: "HCLTECH", val: "1,341.50", chg: "+24.30", pct: "1.84", up: true },
                { label: "WIPRO", val: "482.40", chg: "+8.20", pct: "1.72", up: true },
                { label: "TCS", val: "3,842.00", chg: "+42.00", pct: "1.10", up: true },
              ].map(s => (
                <MarketRow key={s.label} label={s.label} value={s.val} change={s.chg} pct={s.pct} up={s.up} />
              ))}
            </div>
          </Section>

          <Section title="TOP LOSERS">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "M&M", val: "1,942.50", chg: "-42.10", pct: "-2.12", up: false },
                { label: "ADANIPORTS", val: "1,341.10", chg: "-12.50", pct: "-0.92", up: false },
                { label: "JSWSTEEL", val: "842.40", chg: "-8.20", pct: "-0.96", up: false },
                { label: "BPCL", val: "612.30", chg: "-4.20", pct: "-0.68", up: false },
                { label: "TITAN", val: "3,242.00", chg: "-18.00", pct: "-0.55", up: false },
              ].map(s => (
                <MarketRow key={s.label} label={s.label} value={s.val} change={s.chg} pct={s.pct} up={s.up} />
              ))}
            </div>
          </Section>

          <Section title="FII / DII ACTIVITY">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "var(--bg-card)", padding: 12, borderRadius: 6, border: "1px solid var(--border-default)" }}>
                <div className="type-label" style={{ fontSize: 9, marginBottom: 4 }}>FII CASH NET</div>
                <div className="type-data" style={{ color: "var(--accent-red)" }}>-₹2,345.12 Cr</div>
                {/* Proportional FII Bar (Section 4.3) */}
                <div style={{ height: 6, width: "100%", background: "var(--border-default)", borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                  <div style={{ height: "100%", width: `${fiiBarWidth}%`, background: "var(--accent-red)", borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ background: "var(--bg-card)", padding: 12, borderRadius: 6, border: "1px solid var(--border-default)" }}>
                <div className="type-label" style={{ fontSize: 9, marginBottom: 4 }}>DII CASH NET</div>
                <div className="type-data" style={{ color: "var(--accent-teal)" }}>+₹3,862.45 Cr</div>
                {/* Proportional DII Bar (Section 4.3) */}
                <div style={{ height: 6, width: "100%", background: "var(--border-default)", borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                  <div style={{ height: "100%", width: `${diiBarWidth}%`, background: "var(--accent-teal)", borderRadius: 3 }} />
                </div>
              </div>
              <div className="type-micro" style={{ marginTop: 4 }}>Last updated: 15:30 IST</div>
            </div>
          </Section>

          <Section title="DERIVATIVES SNAPSHOT">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "NIFTY PCR", val: "0.84", up: false },
                { label: "BANKNIFTY PCR", val: "0.72", up: false },
                { label: "MAX PAIN", val: "24,000", up: true },
                { label: "VOLATILITY SKEW", val: "Stable", up: true },
              ].map(d => (
                <div key={d.label} style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid var(--border-default)", padding: "4px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--mono)" }}>{d.label}</span>
                    <span style={{ color: "var(--text-primary)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)" }}>{d.val}</span>
                  </div>
                  {/* PCR Range Indicator (Section 4.3) */}
                  {d.label.includes("PCR") && <PCRRangeBar val={d.val} />}
                </div>
              ))}
            </div>
          </Section>

          <Section title="GLOBAL INDICES">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "S&P 500", val: "5,342.12", pct: "+0.42", up: true, spark: [5310, 5325, 5330, 5320, 5342] },
                { label: "NASDAQ", val: "16,842.45", pct: "+0.85", up: true, spark: [16700, 16750, 16810, 16800, 16842] },
                { label: "DOW JONES", val: "39,142.10", pct: "+0.12", up: true, spark: [39000, 39050, 39100, 39080, 39142] },
                { label: "DAX", val: "18,442.12", pct: "-0.24", up: false, spark: [18550, 18520, 18500, 18480, 18442] },
                { label: "NIKKEI 225", val: "38,842.10", pct: "-0.15", up: false, spark: [39000, 38950, 38900, 38880, 38842] },
              ].map(s => (
                <MarketRow key={s.label} label={s.label} value={s.val} pct={s.pct} up={s.up} sparkPoints={s.spark} />
              ))}
            </div>
          </Section>

        </div>
      </div>
    </Layout>
  );
}
