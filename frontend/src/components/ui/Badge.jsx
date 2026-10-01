import React from "react";

/**
 * Tiny Terminal Badge
 * Theme-aware high-visibility badge matching institutional terminals.
 */
const TONE_CLASSES = {
  green:     "bg-emerald-500/10 text-emerald-600 dark:text-[#00E5FF] dark:bg-[#00E5FF]/10 border-emerald-500/20 dark:border-[#00E5FF]/30",
  bullish:   "bg-emerald-500/10 text-emerald-600 dark:text-[#10B981] dark:bg-[#10B981]/10 border-emerald-500/20 dark:border-[#10B981]/30",
  red:       "bg-rose-500/10 text-rose-600 dark:text-[#EF4444] dark:bg-[#EF4444]/10 border-rose-500/20 dark:border-[#EF4444]/30",
  defensive: "bg-rose-500/10 text-rose-600 dark:text-[#EF4444] dark:bg-[#EF4444]/10 border-rose-500/20 dark:border-[#EF4444]/30",
  yellow:    "bg-amber-500/10 text-amber-700 dark:text-[#F59E0B] dark:bg-[#F59E0B]/10 border-amber-500/20 dark:border-[#F59E0B]/30",
  neutral:   "bg-amber-500/10 text-amber-700 dark:text-[#F59E0B] dark:bg-[#F59E0B]/10 border-amber-500/20 dark:border-[#F59E0B]/30",
  blue:      "bg-sky-500/10 text-sky-700 dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 border-sky-500/20 dark:border-[#38BDF8]/30",
  purple:    "bg-purple-500/10 text-purple-700 dark:text-[#A78BFA] dark:bg-[#A78BFA]/10 border-purple-500/20 dark:border-[#A78BFA]/30",
};

export default function Badge({ children, tone = "green", color, className = "" }) {
  const key = (color || tone || "green").toLowerCase();
  const toneClass = TONE_CLASSES[key] || TONE_CLASSES.green;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-[4px] border px-[6px] py-[1.5px] font-mono text-[9px] font-bold uppercase tracking-[0.08em] transition-colors ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
