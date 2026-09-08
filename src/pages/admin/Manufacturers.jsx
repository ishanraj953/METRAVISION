import React from "react";

const Manufacturers = () => {
  const manufacturerList = [
    { id: "MFG-501", name: "Patanjali Foods Ltd", lmpcNo: "LMPC/UK/2023/889", category: "Food & Beverages", state: "Uttarakhand", status: "Verified" },
    { id: "MFG-502", name: "Hindustan Unilever Limited", lmpcNo: "LMPC/MH/2021/104", category: "FMCG / Cosmetics", state: "Maharashtra", status: "Verified" },
    { id: "MFG-503", name: "Dabur India Consumer Care", lmpcNo: "LMPC/DL/2022/442", category: "Ayurvedic & Personal Care", state: "Delhi", status: "Verified" },
    { id: "MFG-504", name: "Nestle India Processing Unit", lmpcNo: "LMPC/HR/2024/302", category: "Packaged Foods", state: "Haryana", status: "Pending Audit" },
    { id: "MFG-505", name: "ITC Limited Consumer Goods", lmpcNo: "LMPC/WB/2020/190", category: "Multi-Category", state: "West Bengal", status: "Verified" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
            🏭 Manufacturer & Packer Registry
          </h1>
          <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
            Monitor LMPC certificate registrations and authorized production units across jurisdictions.
          </p>
        </div>
      </div>

      {/* Manufacturers Table */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Registered Manufacturing Units ({manufacturerList.length})
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            PCR Rules, 2011 Compliance Database
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>Manufacturer Name</th>
                <th style={{ padding: "14px 20px" }}>LMPC Certificate #</th>
                <th style={{ padding: "14px 20px" }}>Category</th>
                <th style={{ padding: "14px 20px" }}>State</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {manufacturerList.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                    {item.name}
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>ID: {item.id}</div>
                  </td>
                  <td style={{ padding: "14px 20px", fontFamily: "monospace", color: "#0284c7", fontWeight: 600 }}>{item.lmpcNo}</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{item.category}</td>
                  <td style={{ padding: "14px 20px" }}>{item.state}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: item.status === "Verified" ? "#f0fdf4" : "#fef3c7",
                      color: item.status === "Verified" ? "#166534" : "#92400e"
                    }}>
                      {item.status === "Verified" ? "✔ Verified" : "⚠️ Pending Audit"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button 
                      onClick={() => alert(`Inspecting records for ${item.name}`)}
                      style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0c3b6b", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                    >
                      View Details →
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

export default Manufacturers;