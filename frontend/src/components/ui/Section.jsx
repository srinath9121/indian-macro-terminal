import React from "react";

/**
 * Section — matches monolith: #0f1520 card with header row
 * Supports optional right-side action button.
 */
export default function Section({ title, children, action, actionLabel = "View All", className = "" }) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-default)] backdrop-blur-md shadow-sm transition-all duration-200 ${className}`}
      style={{ background: "var(--card)", padding: 16 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[11px] font-bold tracking-[0.08em] text-[var(--text-primary)]">{title}</div>
        {action && (
          <button
            onClick={action}
            className="border-none bg-transparent font-mono text-[10px] text-[var(--accent-blue)] cursor-pointer hover:underline font-semibold"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
