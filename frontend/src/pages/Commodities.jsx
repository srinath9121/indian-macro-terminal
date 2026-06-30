import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Section from "../components/ui/Section";
import Badge from "../components/ui/Badge";
import { fetchApi } from "../services/api";
import { LineChart, Line, ResponsiveContainer, Tooltip, Area, AreaChart, YAxis } from "recharts";

const CATEGORIES = ["ALL", "PRECIOUS", "ENERGY", "BASE METALS"];

const CATEGORY_MAP = {
  gold: "PRECIOUS", silver: "PRECIOUS", platinum: "PRECIOUS", palladium: "PRECIOUS",
  brent: "ENERGY",  wti: "ENERGY",     natgas: "ENERGY",
  copper: "BASE METALS", aluminium: "BASE METALS", zinc: "BASE METALS",
  nickel: "BASE METALS", lead: "BASE METALS",
};

function RSIBar({ rsi = 50 }) {
  const pct = Math.min(100, Math.max(0, rsi));
  const color = rsi > 70 ? "var(--accent-amber)" : rsi < 30 ? "var(--accent-blue)" : "var(--text-muted)";
  const label = rsi > 70 ? "OVERBOUGHT" : rsi < 30 ? "OVERSOLD" : "NEUTRAL";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 8, fontFamily: "var(--mono)" }}>14D RSI</span>
        <span style={{ color, fontSize: 8, fontFamily: "var(--mono)", fontWeight: 700 }}>{label} {rsi.toFixed(1)}</span>
      </div>
      <div style={{ position: "relative", height: 4, background: "var(--border-default)", borderRadius: 2 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.5s" }} />
        <div style={{ position: "absolute", top: -2, left: `${pct}%`, width: 8, height: 8, borderRadius: "50%", background: color, transform: "translateX(-50%)", boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  );
}

function MiniSparkline({ data = [], positive }) {
  if (!data || data.length === 0) return <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 9, fontFamily: "var(--mono)" }}>NO DATA</div>;
  const chartData = data.map((v, i) => ({ i, v }));
  const color = positive ? "var(--accent-teal)" : "var(--accent-red)";
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        {/* YAxis with auto domain fixes the flat-line appearance (Section 4.6) */}
        <YAxis hide domain={['auto', 'auto']} />
        <defs>
          <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${positive})`} dot={false} />
        <Tooltip
          contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", fontSize: 9, fontFamily: "var(--mono)" }}
          formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
          labelFormatter={() => ""}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CommodityCard({ item }) {
  const isUp = item.direction === "up";
  const accentColor = isUp ? "var(--accent-teal)" : "var(--accent-red)";
  const cat = CATEGORY_MAP[item.id] || "OTHER";

  const catColor = cat === "PRECIOUS" ? "var(--accent-amber)" : cat === "ENERGY" ? "var(--accent-amber)" : "var(--accent-blue)";

  return (
    <div style={{
      background: isUp ? "linear-gradient(135deg, rgba(0, 212, 170, 0.04) 0%, var(--bg-card) 40%)" : "linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, var(--bg-card) 40%)",
      border: `1px solid var(--border-default)`,
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: 6,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      transition: "all 0.3s ease",
      cursor: "pointer",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "var(--text-primary)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: 0.5 }}>
            {item.name.toUpperCase()}
          </div>
          {/* Unit displays styled as 10px Inter (Section 4.6) */}
          <div className="type-micro" style={{ fontSize: 10, color: "var(--text-secondary)" }}>{item.unit}</div>
        </div>
        <span style={{ background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44`, borderRadius: 3, fontSize: 8, padding: "2px 5px", fontFamily: "var(--mono)", fontWeight: 700 }}>
          {cat}
        </span>
      </div>

      {/* Price */}
      <div>
        <div style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 900, fontFamily: "var(--mono)", letterSpacing: -0.5 }}>
          ₹{Number(item.inr_price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
          <span style={{ color: accentColor, fontSize: 10, fontFamily: "var(--mono)" }}>
            {isUp ? "▲" : "▼"} ₹{Math.abs(item.inr_change).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
          <span style={{ color: accentColor, fontSize: 10, fontFamily: "var(--mono)" }}>
            ({item.pct_change > 0 ? "+" : ""}{item.pct_change?.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <MiniSparkline data={item.sparkline} positive={isUp} />

      {/* RSI */}
      <RSIBar rsi={item.rsi14 || 50} />

      {/* India Note */}
      {item.india_note && (
        <div style={{ color: "var(--text-secondary)", fontSize: 9, fontFamily: "var(--mono)", fontStyle: "italic", borderTop: "1px solid var(--border-default)", paddingTop: 6 }}>
          ℹ {item.india_note}
        </div>
      )}

      {/* Duty Note */}
      {item.duty_note && (
        <div style={{ color: "var(--text-muted)", fontSize: 8, fontFamily: "var(--mono)" }}>
          Duty: {item.duty_note}
        </div>
      )}
    </div>
  );
}

export default function Commodities() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await fetchApi("/commodities");
      if (data?.commodities?.length > 0) {
        setCommodities(data.commodities);
        setLastUpdated(data.timestamp);
      }
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 300000); // 5 min refresh
    return () => clearInterval(interval);
  }, []);

  const getCount = (cat) => {
    if (cat === "ALL") return commodities.length;
    return commodities.filter(c => CATEGORY_MAP[c.id] === cat).length;
  };

  const filtered = commodities.filter(c =>
    activeCategory === "ALL" || CATEGORY_MAP[c.id] === activeCategory
  );

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="type-hero" style={{ fontSize: 20 }}>COMMODITY TRACKER</div>
            <div className="type-micro" style={{ color: "var(--text-muted)", marginTop: 2 }}>Prices in Indian Rupees · Source: CMX/ICE via yfinance + INR parity</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loading && <span className="type-micro" style={{ color: "var(--text-muted)" }}>LOADING...</span>}
            {/* Standardise last updated to 24-hour format (Section 4.6) */}
            {lastUpdated && (
              <span className="type-micro" style={{ color: "var(--text-muted)" }}>
                Updated: {new Date(lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })} IST
              </span>
            )}
            <Badge color="green">LIVE</Badge>
          </div>
        </div>

        {/* Category Tabs (Section 4.6 Tabs count badges) */}
        <div style={{ display: "flex", gap: 8 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "var(--accent-teal)" : "var(--bg-card)",
                border: `1px solid ${activeCategory === cat ? "var(--accent-teal)" : "var(--border-default)"}`,
                color: activeCategory === cat ? "var(--bg-base)" : "var(--text-secondary)",
                borderRadius: 4,
                padding: "6px 12px",
                fontSize: 10,
                fontFamily: "var(--mono)",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {cat === "ALL" ? `ALL (${getCount("ALL")})` : `${cat} (${getCount(cat)})`}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="animate-fade-in">
          {filtered.map(item => (
            <CommodityCard key={item.id} item={item} />
          ))}
        </div>

      </div>
    </Layout>
  );
}
