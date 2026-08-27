import React from "react";

/**
 * Tiny Terminal Badge
 * Matches the exact technical look of the original monolith.
 */
const COLORS = {
  green:  { bg: "#DCFCE7", text: "#15803D" },
  red:    { bg: "#FEE2E2", text: "#B91C1C" },
  yellow: { bg: "#FEF3C7", text: "#B45309" },
  blue:   { bg: "#E0F2FE", text: "#0369A1" },
  bullish: { bg: "#DCFCE7", text: "#15803D" },
  defensive: { bg: "#FEE2E2", text: "#B91C1C" },
  neutral: { bg: "#FEF3C7", text: "#B45309" },
};

export default function Badge({ children, tone = "green", color }) {
  // Support both 'tone' and 'color' props for compatibility
  const key = color || tone || "green";
  const c = COLORS[key] || COLORS.green;

  return (
    <span
      className="inline-flex items-center justify-center rounded-[3px] border px-[5px] py-[1px] font-mono text-[9px] font-bold uppercase tracking-[0.08em]"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderColor: `${c.text}33`,
      }}
    >
      {children}
    </span>
  );
}
