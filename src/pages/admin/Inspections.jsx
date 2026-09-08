import React from "react";

const Inspections = () => {
  const inspectionLogs = [
    { id: "INS-901", store: "Gupta Kirana & General Store", inspector: "Inspector Anil Kumar", zone: "North Delhi", date: "2026-09-07", status: "Completed" },
    { id: "INS-902", store: "Sharma Wholesale Hub", inspector: "Inspector Priya Singh", zone: "South Mumbai", date: "2026-09-06", status: "Violation Found" },
    { id: "INS-903", store: "Reliance SuperMart Sector-18", inspector: "Inspector Anil Kumar", zone: "Noida Urban", date: "2026-09-05", status: "Completed" },
    { id: "INS-904", store: "Metro Cash & Carry", inspector: "Inspector Rajesh Verma", zone: "East Bangalore", date: "2026-09-04", status: "Pending Review" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          🕵️ Field Inspections & Store Audits
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Monitor on-site enforcement activities, inspection schedules, and compliance audits by authorized officers.
        </p>
      </div>

      {/* Inspections Table */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Recent Field Inspection Logs ({inspectionLogs.length})
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            Enforcement & Surveillance Wing
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>Inspection ID & Store</th>
                <th style={{ padding: "14px 20px" }}>Assigned Inspector</th>
                <th style={{ padding: "14px 20px" }}>Jurisdiction Zone</th>
                <th style={{ padding: "14px 20px" }}>Date</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspectionLogs.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                    {item.store}
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>ID: {item.id}</div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#0284c7", fontWeight: 600 }}>{item.inspector}</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{item.zone}</td>
                  <td style={{ padding: "14px 20px" }}>{item.date}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: item.status === "Completed" ? "#f0fdf4" : item.status === "Violation Found" ? "#fef2f2" : "#fef3c7",
                      color: item.status === "Completed" ? "#166534" : item.status === "Violation Found" ? "#b91c1c" : "#92400e"
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button 
                      onClick={() => alert(`Opening inspection report for ${item.id}`)}
                      style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0c3b6b", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                    >
                      View Report →
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

export default Inspections;