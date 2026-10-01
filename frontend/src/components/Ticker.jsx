/**
 * Ticker.jsx — Live scrolling price strip
 * Reads from useTerminalStore — values update instantly on WS push.
 */
import { useTerminalStore } from "../store/useTerminalStore";

export default function Ticker() {
  const marketData = useTerminalStore((s) => s.marketData);
  const macroData  = useTerminalStore((s) => s.macroData);

  // Build tickers from live data, fall back to statics when loading
  const tickers = [
    {
      label: "N", name: "NIFTY 50",
      value: marketData?.nifty?.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "24,117.65",
      change: marketData?.nifty ? `${marketData.nifty.pct_change >= 0 ? "+" : ""}${marketData.nifty.pct_change?.toFixed(2)}%` : "+0.76%",
      up: (marketData?.nifty?.direction ?? "up") === "up",
      dot: "var(--accent-blue)",
    },
    {
      label: "S", name: "SENSEX",
      value: marketData?.sensex?.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "77,496.36",
      change: marketData?.sensex ? `${marketData.sensex.pct_change >= 0 ? "+" : ""}${marketData.sensex.pct_change?.toFixed(2)}%` : "+0.79%",
      up: (marketData?.sensex?.direction ?? "up") === "up",
      dot: "var(--accent-teal)",
    },
    {
      label: "B", name: "BANKNIFTY",
      value: marketData?.bank_nifty?.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "55,403.60",
      change: marketData?.bank_nifty ? `${marketData.bank_nifty.pct_change >= 0 ? "+" : ""}${marketData.bank_nifty.pct_change?.toFixed(2)}%` : "+0.01%",
      up: (marketData?.bank_nifty?.direction ?? "up") === "up",
      dot: "var(--accent-purple)",
    },
    {
      label: "V", name: "INDIA VIX",
      value: marketData?.vix?.price?.toFixed(2) ?? "14.20",
      change: marketData?.vix ? `${marketData.vix.pct_change >= 0 ? "+" : ""}${marketData.vix.pct_change?.toFixed(2)}%` : "-2.74%",
      up: (marketData?.vix?.direction ?? "down") === "up",
      dot: "var(--accent-red)",
    },
    {
      label: "$", name: "USD/INR",
      value: macroData?.usd_inr?.price?.toFixed(2) ?? "83.24",
      change: macroData?.usd_inr ? `${macroData.usd_inr.pct_change >= 0 ? "+" : ""}${macroData.usd_inr.pct_change?.toFixed(2)}%` : "+0.18%",
      up: (macroData?.usd_inr?.direction ?? "up") === "up",
      dot: "var(--accent-amber)",
    },
    {
      label: "O", name: "BRENT CRUDE",
      value: macroData?.brent_crude?.price ? `$${macroData.brent_crude.price.toFixed(2)}` : "$85.12",
      change: macroData?.brent_crude ? `${macroData.brent_crude.pct_change >= 0 ? "+" : ""}${macroData.brent_crude.pct_change?.toFixed(2)}%` : "-0.53%",
      up: (macroData?.brent_crude?.direction ?? "up") === "up",
      dot: "#78716c",
    },
  ];

  return (
    <div className="ticker">
      {tickers.map((t, i) => (
        <div key={t.name} style={{ display: "flex", alignItems: "center", gap: "26px" }}>
          <div className="tick-item">
            <div className="tick-dot" style={{ background: t.dot }}>{t.label}</div>
            <span className="tick-name">{t.name}</span>
            <span className="tick-val num">{t.value}</span>
            <span className={"tick-chg num " + (t.up ? "up" : "down")}>{t.change}</span>
          </div>
          {i < tickers.length - 1 && <div className="tick-sep" />}
        </div>
      ))}
    </div>
  );
}
