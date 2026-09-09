import React from "react";

const CheckerResults = () => {
  return (
    <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0c3b6b", marginBottom: "6px" }}>
        Compliance Audit Results & Assessment
      </h1>
      <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "20px" }}>
        Review legal metrology inspection outcomes, validation reports, and penalty assessments.
      </p>

      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>Lotte Coffy Bite Confectionery (21.6g)</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Audited on: 08 Sep 2026 • Inspector CHK-109</div>
          </div>
          <span style={{ background: "#f0fdf4", color: "#166534", padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: "11.5px", border: "1px solid #86efac" }}>
            ✔ VERIFIED COMPLIANT
          </span>
        </div>

        <div style={{ fontSize: "12px", color: "#334155", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <strong>PCR 2011 Rule Evaluation:</strong> All mandatory declarations including MRP, Net Quantity, and Manufacturer/Packer identity details have been successfully verified across multi-angle panel scans.
        </div>
      </div>
    </div>
  );
};

export default CheckerResults;