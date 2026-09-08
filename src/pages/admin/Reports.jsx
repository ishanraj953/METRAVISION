import React from "react";

const Reports = () => {
  const enforcementReports = [
    { id: "REP-2026-09", title: "State-Wide PCR Compliance Quarterly Summary", period: "Q2 2026", generatedDate: "2026-09-01", status: "Ready for Download" },
    { id: "REP-2026-08", title: "Compounding Fines & Penalty Collection Audit", period: "August 2026", generatedDate: "2026-09-02", status: "Ready for Download" },
    { id: "REP-2026-07", title: "E-Commerce & Digital Marketplace Violations Report", period: "H1 2026", generatedDate: "2026-08-15", status: "Ready for Download" },
    { id: "REP-2026-06", title: "Unverified Barcode Scanning & Seizure Statistics", period: "July 2026", generatedDate: "2026-08-01", status: "Archived" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          📊 Official Enforcement Reports & Analytics
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Download statutory audit reports, compounding fee summaries, and regulatory compliance statistics.
        </p>
      </div>

      {/* Reports Table */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Generated Regulatory Reports ({enforcementReports.length})
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            Central Document Repository
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>Report Title & ID</th>
                <th style={{ padding: "14px 20px" }}>Period Covered</th>
                <th style={{ padding: "14px 20px" }}>Generation Date</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {enforcementReports.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                    {item.title}
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>ID: {item.id}</div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#0284c7", fontWeight: 600 }}>{item.period}</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{item.generatedDate}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: item.status === "Ready for Download" ? "#f0fdf4" : "#f8fafc",
                      color: item.status === "Ready for Download" ? "#166534" : "#64748b"
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button 
                      onClick={() => alert(`Downloading official PDF for ${item.id}`)}
                      style={{ background: "#0c3b6b", border: "none", color: "#ffffff", padding: "6px 14px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                    >
                      📥 Download PDF
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

export default Reports;