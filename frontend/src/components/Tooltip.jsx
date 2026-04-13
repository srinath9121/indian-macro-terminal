import { useState } from 'react';

const glossary = {
  "INDIA VIX": "India's fear index. Above 20 = high fear. Calculated from Nifty options.",
  "PCR": "Put/Call Ratio. Above 1 = more puts (bearish bets). Below 0.7 = crowded longs.",
  "FII": "Foreign Institutional Investors. Their buying/selling often drives Nifty direction.",
  "CAD": "Current Account Deficit. India's trade and income gap with the world.",
  "LPA": "Long Period Average. Used to measure monsoon performance vs historical norm.",
  "IMSI": "India Macro Stress Index. A composite measure of all stress factors facing India.",
  "USD/INR": "Exchange rate. Higher number means rupee is weaker against the dollar.",
  "BRENT": "Global benchmark for crude oil prices. India imports 85% of its oil, making this critical."
};

export default function Tooltip({ term, children }) {
  const [show, setShow] = useState(false);
  const definition = glossary[term.toUpperCase()] || "No definition available.";

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dashed border-[#5a6a88]/60 cursor-help">
        {children || term}
      </span>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-[9px] bg-[#0d1e2e] border border-[#1a3348] text-[#e8f4f8] rounded shadow-lg z-[9999] pointer-events-none">
          <p className="font-sans leading-relaxed">{definition}</p>
        </div>
      )}
    </div>
  );
}
