import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import scanService from "../../services/scans";
import API, { API_BASE_URL } from "../../services/api";
import { downloadPDFWithAuth } from "../../services/reports";

const Inspections = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState("ALL");

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setLoading(true);
    try {
      const data = await scanService.getInspectionHistory();
      setInspections(data || []);
    } catch (err) {
      console.error("Error loading inspections:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = inspections.filter((insp) => {
    if (filterPriority === "ALL") return true;
    if (filterPriority === "HIGH") return (insp.priority_score || 0) >= 50;
    if (filterPriority === "MEDIUM") return (insp.priority_score || 0) >= 25 && (insp.priority_score || 0) < 50;
    return (insp.priority_score || 0) < 25;
  });

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
            Field Inspection Queue & Task Assignments
          </h1>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
            Scheduled compliance verifications prioritized by deterministic risk score and repeat offender history.
          </p>
        </div>

        <button
          onClick={() => navigate("/checker/scan")}
          style={{ background: "#0c3b6b", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer" }}
        >
          Launch New Scan →
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ background: "#ffffff", padding: "14px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Filter by Priority:</span>
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11.5px",
              fontWeight: 700,
              border: filterPriority === p ? "1px solid #0c3b6b" : "1px solid #cbd5e1",
              background: filterPriority === p ? "#0c3b6b" : "#f8fafc",
              color: filterPriority === p ? "#fff" : "#334155",
              cursor: "pointer"
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left", color: "#475569" }}>
              <th style={{ padding: "12px 16px" }}>Inspection Code</th>
              <th style={{ padding: "12px 16px" }}>Product ID</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px" }}>Risk Priority Score</th>
              <th style={{ padding: "12px 16px" }}>Remarks</th>
              <th style={{ padding: "12px 16px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                  No inspections matching the selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((insp) => (
                <tr key={insp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0c3b6b" }}>{insp.inspection_code}</td>
                  <td style={{ padding: "12px 16px" }}>Product #{insp.product_id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, background: insp.status === "COMPLIANT" ? "#dcfce7" : "#fee2e2", color: insp.status === "COMPLIANT" ? "#166534" : "#991b1b" }}>
                      {insp.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, color: (insp.priority_score || 0) >= 50 ? "#dc2626" : "#16a34a" }}>
                    {insp.priority_score?.toFixed(1) || "50.0"} / 100
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{insp.remarks || "Standard inspection"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => downloadPDFWithAuth(`/reports/inspection/${insp.id}/download`, `Official_Inspection_Memo_${insp.id}.pdf`)}
                        style={{ background: "#f8fafc", color: "#0c3b6b", border: "1px solid #cbd5e1", padding: "5px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                      >
                        Download PDF Memo
                      </button>
                      <button
                        onClick={() => navigate("/checker/scan")}
                        style={{ background: "#0c3b6b", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Scan →
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Inspections;
