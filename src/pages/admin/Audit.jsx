import React from "react";

const Audit = () => {
  const auditLogs = [
    { id: "AUD-801", timestamp: "2026-09-08 14:22:10", admin: "Dr. Rajesh Sharma (ADM-902)", action: "Modified User Role (USR-004 to Verified)", ipAddress: "10.184.22.10", status: "Success" },
    { id: "AUD-802", timestamp: "2026-09-08 11:05:45", admin: "Dr. Rajesh Sharma (ADM-902)", action: "Generated Quarterly PCR Compliance Report", ipAddress: "10.184.22.10", status: "Success" },
    { id: "AUD-803", timestamp: "2026-09-07 16:40:12", admin: "System Auto-Daemon", action: "Automated Risk Matrix Re-calculation", ipAddress: "127.0.0.1", status: "Success" },
    { id: "AUD-804", timestamp: "2026-09-07 09:15:30", admin: "Inspector Anil Kumar (CHK-102)", action: "Uploaded Field Inspection Evidence #INS-901", ipAddress: "10.184.14.88", status: "Success" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          🛡️ System Audit Logs & Activity Trail
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Immutable security logs recording administrative actions, authentication sessions, and database updates.
        </p>
      </div>

      {/* Audit Table */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Security & Compliance Event Stream ({auditLogs.length})
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            Encrypted Audit Ledger
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>Log ID & Timestamp</th>
                <th style={{ padding: "14px 20px" }}>Actor / User</th>
                <th style={{ padding: "14px 20px" }}>Action Performed</th>
                <th style={{ padding: "14px 20px" }}>Source IP</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                    {item.timestamp}
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>ID: {item.id}</div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#0284c7", fontWeight: 600 }}>{item.admin}</td>
                  <td style={{ padding: "14px 20px", color: "#1e293b" }}>{item.action}</td>
                  <td style={{ padding: "14px 20px", fontFamily: "monospace", color: "#475569" }}>{item.ipAddress}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "#f0fdf4",
                      color: "#166534"
                    }}>
                      {item.status}
                    </span>
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

export default Audit;