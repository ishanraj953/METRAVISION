import React from "react";

const ShopkeeperReports = () => {
  return (
    <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0c3b6b", marginBottom: "6px" }}>
        Retailer Enforcement Reports & Audit History
      </h1>
      <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "20px" }}>
        View submitted compliance summaries, inspection outcomes, and penalty histories for your store location.
      </p>

      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>Store Compliance Audit Report #REP-2026-09</div>
          <span style={{ background: "#f0fdf4", color: "#166534", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "11px", border: "1px solid #86efac" }}>
            Status: Clear
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#334155", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          All active packaged commodities verified under Legal Metrology Packaged Commodities Rules 2011 meet mandatory disclosure norms. No pending fines or violations recorded.
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperReports;