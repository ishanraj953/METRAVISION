import React from "react";

const Compliance = () => {
  const checklist = [
    { rule: "Rule 18: Maximum Retail Price (MRP) Declaration", status: "Verified", desc: "MRP declared in inclusive of all taxes prominently displayed." },
    { rule: "Rule 19: Net Quantity / Weight Declaration", status: "Verified", desc: "Expressed in standard units of weight or measure correctly." },
    { rule: "Rule 20: Name & Address of Manufacturer / Packer", status: "Verified", desc: "Complete postal address and identity of manufacturer clearly visible." },
    { rule: "Rule 21: Month & Year of Packing", status: "Verified", desc: "Month and year of manufacture/packing marked properly." },
    { rule: "Rule 22: Consumer Care Details", status: "Pending Review", desc: "Email or phone number for consumer grievances requires update." },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          🛡️ Store Compliance Status & PCR 2011 Audit
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Real-time verification status against Legal Metrology (Packaged Commodities) Rules, 2011.
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", marginBottom: "24px" }}>
        
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #16a34a", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Overall Score</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#16a34a", margin: "6px 0 2px 0" }}>92.4%</div>
          <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>High Compliance Rating</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #0284c7", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Verified Parameters</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: "6px 0 2px 0" }}>4 / 5</div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 600 }}>Standard Rules Passed</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #d97706", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Action Required</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#d97706", margin: "6px 0 2px 0" }}>1 Item</div>
          <div style={{ fontSize: "11px", color: "#b45309", fontWeight: 600 }}>Pending administrative check</div>
        </div>

      </div>

      {/* Checklist Table */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            PCR 2011 Mandatory Declarations Checklist
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {checklist.map((item, idx) => (
            <div key={idx} style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "2px" }}>{item.rule}</div>
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>{item.desc}</div>
              </div>
              <span style={{ fontSize: "11.5px", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", background: item.status === "Verified" ? "#f0fdf4" : "#fef3c7", color: item.status === "Verified" ? "#166534" : "#92400e" }}>
                {item.status === "Verified" ? "✔ Verified" : "⚠️ Pending Review"}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default Compliance;