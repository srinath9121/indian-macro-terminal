import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent-red)",
            borderRadius: 8,
            padding: "24px 20px",
            textAlign: "center",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              color: "var(--accent-red)",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--mono)",
              marginBottom: 6,
              letterSpacing: "0.06em",
            }}
          >
            ⚠ COMPONENT ERROR
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 10,
              fontFamily: "var(--mono)",
              marginBottom: 14,
            }}
          >
            {this.state.error?.message || "An unexpected error occurred."}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: "none",
              border: "1px solid var(--accent-blue)",
              color: "var(--accent-blue)",
              borderRadius: 5,
              padding: "5px 16px",
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--mono)",
              letterSpacing: "0.06em",
            }}
          >
            RETRY
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
