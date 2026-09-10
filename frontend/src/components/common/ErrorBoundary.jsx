import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", maxWidth: "600px", margin: "60px auto", textAlign: "center", background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0c3b6b", margin: "0 0 8px 0" }}>
            Application Error Encountered
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px 0" }}>
            An unexpected rendering exception occurred. The error has been logged for resolution.
          </p>
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "10px", borderRadius: "6px", fontSize: "12px", textAlign: "left", marginBottom: "18px", wordBreak: "break-word" }}>
            {this.state.error?.toString()}
          </div>
          <button
            onClick={() => window.location.href = "/"}
            style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            Return to Portal Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
