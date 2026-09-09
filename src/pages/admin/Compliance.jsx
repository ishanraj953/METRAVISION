import React from "react";

const Compliance = () => {
  return (
    <div style={{ padding: "28px 36px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", marginBottom: "6px" }}>
        State-Wide Compliance Overview
      </h1>
      <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "24px" }}>
        Monitor regulatory adherence metrics and packaged commodity inspection statuses across all administrative zones.
      </p>

      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
          PCR 2011 Compliance Index
        </div>
        <div style={{ fontSize: "12.5px", color: "#334155", lineHeight: "1.6", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          Overall state compliance rate stands at <strong style={{ color: "#16a34a" }}>91.4%</strong>. Active enforcement squads are closely tracking consumer packaging disclosures, dual-MRP restrictions, and net quantity declarations.
        </div>
      </div>
    </div>
  );
};

export default Compliance;