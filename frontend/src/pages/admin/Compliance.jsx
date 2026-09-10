import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Compliance = () => {
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/compliance-statistics")
      .then((res) => setCompData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalScans = compData?.total_scans || 0;
  const compliantScans = compData?.compliant_scans || 0;
  const nonCompliantScans = compData?.non_compliant_scans || 0;
  const rate = compData?.compliance_rate || 100.0;
  const byCategory = compData?.by_category || {};

  return (
    <div style={{ padding: "28px 36px", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", marginBottom: "4px" }}>
        State-Wide Legal Metrology Compliance Overview
      </h1>
      <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "24px" }}>
        Live regulatory adherence metrics and packaged commodity inspection statuses across monitored categories.
      </p>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800 }}>TOTAL SCANNED PACKAGES</div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0c3b6b", margin: "4px 0" }}>{totalScans}</div>
          <div style={{ fontSize: "11px", color: "#16a34a" }}>All Monitored Lots</div>
        </div>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800 }}>COMPLIANT LOTS</div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#16a34a", margin: "4px 0" }}>{compliantScans}</div>
          <div style={{ fontSize: "11px", color: "#16a34a" }}>PCR 2011 Verified</div>
        </div>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800 }}>NON-COMPLIANT LOTS</div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#dc2626", margin: "4px 0" }}>{nonCompliantScans}</div>
          <div style={{ fontSize: "11px", color: "#dc2626" }}>Statutory Infractions</div>
        </div>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800 }}>COMPLIANCE INDEX</div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: rate >= 80 ? "#16a34a" : "#dc2626", margin: "4px 0" }}>{rate?.toFixed(1)}%</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Overall Adherence</div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
          Compliance Rate by Commodity Category
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "10px 14px" }}>Category Name</th>
                <th style={{ padding: "10px 14px" }}>Compliance Rate</th>
                <th style={{ padding: "10px 14px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(byCategory).length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                    No category breakdown data available yet.
                  </td>
                </tr>
              ) : (
                Object.entries(byCategory).map(([cat, catRate], idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>{cat.toUpperCase()}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: catRate >= 80 ? "#16a34a" : "#dc2626" }}>
                      {catRate?.toFixed(1)}%
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, background: catRate >= 80 ? "#f0fdf4" : "#fef2f2", color: catRate >= 80 ? "#166534" : "#991b1b" }}>
                        {catRate >= 80 ? "HIGH COMPLIANCE" : "ATTENTION REQUIRED"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Compliance;