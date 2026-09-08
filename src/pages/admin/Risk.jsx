import React from "react";

const Risk = () => {
  const riskZones = [
    { zone: "North Delhi Wholesale Hub", riskLevel: "Critical", violationsCount: 42, primaryIssue: "MRP Non-Compliance & Unlabeled Goods" },
    { zone: "South Mumbai Retail Sector", riskLevel: "High", violationsCount: 28, primaryIssue: "Missing Net Quantity Declarations" },
    { zone: "Noida Electronic City Markets", riskLevel: "Medium", violationsCount: 15, primaryIssue: "Importer Address Omission" },
    { zone: "East Bangalore Commercial Zone", riskLevel: "Low", violationsCount: 4, primaryIssue: "Minor Packaging Date Formatting Errors" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          ⚠️ Risk Intelligence & Predictive Surveillance
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          AI-driven analytics tracking high-risk jurisdictions, violation hot-spots, and non-compliance propensity.
        </p>
      </div>

      {/* Risk Grid */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Jurisdiction Risk Assessment Matrix
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            Real-time Threat Monitoring
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>Jurisdiction / Zone</th>
                <th style={{ padding: "14px 20px" }}>Risk Severity</th>
                <th style={{ padding: "14px 20px" }}>Logged Violations</th>
                <th style={{ padding: "14px 20px" }}>Primary Compliance Deficit</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {riskZones.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>{item.zone}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: item.riskLevel === "Critical" ? "#fef2f2" : item.riskLevel === "High" ? "#fff7ed" : item.riskLevel === "Medium" ? "#fefce8" : "#f0fdf4",
                      color: item.riskLevel === "Critical" ? "#b91c1c" : item.riskLevel === "High" ? "#c2410c" : item.riskLevel === "Medium" ? "#a16207" : "#166534"
                    }}>
                      {item.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontWeight: 700, color: "#0f172a" }}>{item.violationsCount} Cases</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{item.primaryIssue}</td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button 
                      onClick={() => alert(`Deploying targeted audit team for ${item.zone}`)}
                      style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0c3b6b", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                    >
                      Deploy Audit →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default Risk;