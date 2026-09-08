import React from "react";
import { useInspection } from "../../context/InspectionContext";

const AdminDashboard = () => {
  const { complaints } = useInspection();

  // Calculate high-level admin metrics
  const totalCases = complaints.length + 42; // Base mock cases + live context cases
  const totalFinesCollected = complaints.reduce((acc, curr) => acc + (curr.penaltyAmount || 0), 1250000);
  const criticalViolations = complaints.filter(c => c.penaltyAmount > 20000).length + 8;

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
            State Regulatory Admin Command Center
          </h1>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
            Central oversight of Legal Metrology enforcement, compounding penalties, and zonal inspector performance.
          </p>
        </div>

        <div>
          <span style={{ fontSize: "12px", background: "#fef2f2", color: "#991b1b", padding: "6px 14px", borderRadius: "14px", fontWeight: 700 }}>
            Secured Admin Gateway • Level-1 Access
          </span>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>TOTAL ENFORCEMENT CASES</div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#0c3b6b", marginTop: "6px" }}>{totalCases}</div>
          <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600, marginTop: "4px" }}>↑ 12% increase this quarter</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>TOTAL COMPOUNDING FINES</div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#166534", marginTop: "6px" }}>₹ {totalFinesCollected.toLocaleString()}</div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginTop: "4px" }}>Collected across all state zones</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>CRITICAL PCR 2011 VIOLATIONS</div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#991b1b", marginTop: "6px" }}>{criticalViolations}</div>
          <div style={{ fontSize: "11px", color: "#991b1b", fontWeight: 600, marginTop: "4px" }}>Pending judicial compounding</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>ACTIVE FIELD INSPECTORS</div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#0c3b6b", marginTop: "6px" }}>34 Officers</div>
          <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600, marginTop: "4px" }}>All terminals reporting live GPS</div>
        </div>

      </div>

      {/* Recent State-Wide Violation Feed */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>
          🚨 State-Wide Live Violation Escalations
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {complaints.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
              No live complaints filed from field inspectors yet.
            </div>
          ) : (
            complaints.map((c, idx) => (
              <div key={idx} style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#0c3b6b" }}>{c.id} • {c.shopName}</div>
                  <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "2px" }}>Product: {c.productName} | Inspector: {c.inspectorName}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#991b1b" }}>₹ {c.penaltyAmount?.toLocaleString()} Fine</div>
                  <div style={{ fontSize: "10.5px", color: "#64748b" }}>{c.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;