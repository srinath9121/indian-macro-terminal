import React from "react";

/**
 * Terminal Card — matches monolith: #0f1520 bg, #1e2530 border, 8px radius
 */
export default function Card({ children, className = "", style = {}, alt = false }) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-default)] backdrop-blur-md shadow-sm transition-all duration-200 ${className}`}
      style={{
        background: alt ? "var(--card-alt)" : "var(--card)",
        padding: "16px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
