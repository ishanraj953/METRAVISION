import React from "react";

const CheckerRiskIntelligence = () => {
  return (
    <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0c3b6b", marginBottom: "6px" }}>
        Inspection Risk Intelligence & Analytics
      </h1>
      <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "20px" }}>
        AI-driven risk mapping and priority targeting for packaged commodity inspections under PCR 2011.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#b91c1c", marginBottom: "4px" }}>HIGH RISK CATEGORY</div>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>Confectionery & Packaged Sweets</div>
          <div style={{ fontSize: "11.5px", color: "#64748b" }}>Frequent discrepancies found in net quantity and dual-MRP labelling on foil wrappers.</div>
        </div>

        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#d97706", marginBottom: "4px" }}>MODERATE RISK CATEGORY</div>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>Imported Beverages & Oils</div>
          <div style={{ fontSize: "11.5px", color: "#64748b" }}>Missing importer contact details and consumer helpline disclosures.</div>
        </div>
      </div>

      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>Targeted Inspection Zones</h3>
        <div style={{ fontSize: "12px", color: "#334155", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          Recommended audit focus for Zone-3 (Guntur Main Market): Prioritize retail outlets stocking unverified bulk confectionery packets and seasonal import goods.
        </div>
      </div>
    </div>
  );
};

export default CheckerRiskIntelligence;