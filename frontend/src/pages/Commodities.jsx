import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Section from "../components/ui/Section";
import Badge from "../components/ui/Badge";
import { fetchApi } from "../services/api";
import { LineChart, Line, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

const CATEGORIES = ["ALL", "PRECIOUS", "ENERGY", "BASE METALS"];

const CATEGORY_MAP = {
  gold: "PRECIOUS", silver: "PRECIOUS", platinum: "PRECIOUS", palladium: "PRECIOUS",
  brent: "ENERGY",  wti: "ENERGY",     natgas: "ENERGY",
  copper: "BASE METALS", aluminium: "BASE METALS", zinc: "BASE METALS",
  nickel: "BASE METALS", lead: "BASE METALS",
};

function RSIBar({ rsi = 50 }) {
  const pct = Math.min(100, Math.max(0, rsi));
  const color = rsi > 70 ? "#f97316" : rsi < 30 ? "#00D4FF" : "#6b7280";
  const label = rsi > 70 ? "OVERBOUGHT" : rsi < 30 ? "OVERSOLD" : "NEUTRAL";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "var(--muted)", fontSize: 8, fontFamily: "var(--mono)" }}>14D RSI</span>
        <span style={{ color, fontSize: 8, fontFamily: "var(--mono)", fontWeight: 700 }}>{label} {rsi.toFixed(1)}</span>
      </div>
      <div style={{ position: "relative", height: 4, background: "var(--border)", borderRadius: 2 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.5s" }} />
        <div style={{ position: "absolute", top: -2, left: `${pct}%`, width: 8, height: 8, borderRadius: "50%", background: color, transform: "translateX(-50%)", boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  );
}

function MiniSparkline({ data = [], positive }) {
  if (!data || data.length === 0) return <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 9, fontFamily: "var(--mono)" }}>NO DATA</div>;
  const chartData = data.map((v, i) => ({ i, v }));
  const color = positive ? "#22c55e" : "#ef4444";
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${positive})`} dot={false} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 9, fontFamily: "var(--mono)" }}
          formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
          labelFormatter={() => ""}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CommodityCard({ item }) {
  const isUp = item.direction === "up";
  const accentColor = isUp ? "#22c55e" : "#ef4444";
  const cat = CATEGORY_MAP[item.id] || "OTHER";

  const catColor = cat === "PRECIOUS" ? "#f59e0b" : cat === "ENERGY" ? "#f97316" : "#60a5fa";

  return (
    <div style={{
      background: "var(--card)",
      border: `1px solid var(--border)`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 6,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      transition: "border-color 0.3s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "var(--text)", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: 0.5 }}>
            {item.name.toUpperCase()}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 9, fontFamily: "var(--mono)" }}>{item.unit}</div>
        </div>
        <span style={{ background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44`, borderRadius: 3, fontSize: 8, padding: "2px 5px", fontFamily: "var(--mono)", fontWeight: 700 }}>
          {cat}
        </span>
      </div>

      {/* Price */}
      <div>
        <div style={{ color: "var(--text)", fontSize: 22, fontWeight: 900, fontFamily: "var(--mono)", letterSpacing: -0.5 }}>
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
        <div style={{ color: "var(--muted)", fontSize: 9, fontFamily: "var(--mono)", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 6 }}>
          ℹ {item.india_note}
        </div>
      )}

      {/* Duty Note */}
      {item.duty_note && (
        <div style={{ color: "#475569", fontSize: 8, fontFamily: "var(--mono)" }}>
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

  const filtered = commodities.filter(c =>
    activeCategory === "ALL" || CATEGORY_MAP[c.id] === activeCategory
  );

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--text)", fontSize: 14, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: 1 }}>COMMODITY TRACKER</div>
            <div style={{ color: "var(--muted)", fontSize: 9, fontFamily: "var(--mono)", marginTop: 2 }}>Prices in Indian Rupees · Source: CMX/ICE via yfinance + INR parity</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loading && <span style={{ color: "var(--muted)", fontSize: 9, fontFamily: "var(--mono)" }}>LOADING...</span>}
            {lastUpdated && <span style={{ color: "var(--muted)", fontSize: 9, fontFamily: "var(--mono)" }}>Updated: {new Date(lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST</span>}
            <Badge color="green">LIVE</Badge>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 8 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "var(--blue)" : "var(--card)",
                border: `1px solid ${activeCategory === cat ? "var(--blue)" : "var(--border)"}`,
                color: activeCategory === cat ? "#fff" : "var(--muted)",
                padding: "5px 14px",
                borderRadius: 4,
                fontSize: 10,
                fontFamily: "var(--mono)",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, height: 160, opacity: 0.4, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, padding: "60px 0" }}>
            NO COMMODITY DATA AVAILABLE — Backend syncing...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {filtered.map(item => (
              <CommodityCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#475569", fontSize: 9, fontFamily: "var(--mono)" }}>
            Source: CMX/ICE/NYM via yfinance · INR parity via live USD/INR rate · NOT sourced from MCX
          </span>
          <span style={{ color: "#475569", fontSize: 9, fontFamily: "var(--mono)" }}>
            15-min delay · For informational purposes only
          </span>
        </div>
      </div>
    </Layout>
  );
}
