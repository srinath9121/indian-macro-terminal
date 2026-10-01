import React from "react";

/**
 * Section — matches monolith: card with header row & action buttons
 */
export default function Section({ title, children, action, actionLabel = "View All", className = "", actionNode }) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-default)] backdrop-blur-md shadow-sm transition-all duration-200 card-hover ${className}`}
      style={{ background: "var(--card)", padding: 16 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-primary)", textTransform: "uppercase" }}>
          {title}
        </div>
        {actionNode ? (
          actionNode
        ) : action ? (
          <button
            onClick={action}
            className="border-none bg-transparent font-mono text-[10px] text-[var(--accent-blue)] cursor-pointer hover:underline font-semibold"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
