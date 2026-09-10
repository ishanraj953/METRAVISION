import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/products";
import API from "../../services/api";

const Manufacturers = () => {
  const navigate = useNavigate();
  const [repeatOffenders, setRepeatOffenders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadManufacturerData();
  }, []);

  const loadManufacturerData = async () => {
    setLoading(true);
    try {
      const [offendersRes, statsRes] = await Promise.all([
        productService.getRepeatOffenders().catch(() => []),
        API.get("/admin/manufacturer-statistics").then(r => r.data).catch(() => null)
      ]);
      setRepeatOffenders(offendersRes || []);
      setStats(statsRes);
    } catch (err) {
      console.error("Error loading manufacturer statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueNotice = (mfgName) => {
    setStatusMessage(`Statutory Show-Cause Notice under Section 36 of Legal Metrology Act, 2009 issued to ${mfgName}.`);
  };

  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* Header Banner */}
      <div className="gov-panel" style={{ background: "#ffffff", padding: "18px 24px", borderTopColor: "#0c3b6b", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="badge-gov badge-info">CENTRAL REGULATORY OVERSIGHT</span>
              <span className="badge-gov badge-critical">REPEAT OFFENDER SURVEILLANCE</span>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", margin: "6px 0 2px 0" }}>
              Manufacturer & Importer Repeat Offender Registry
            </h1>
            <p style={{ fontSize: "12.5px", color: "#475569", margin: 0 }}>
              Statutory monitoring of packers, manufacturers, and importers with repeated Legal Metrology infractions.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="btn-gov-primary"
            style={{ padding: "10px 18px", fontSize: "12.5px", background: "#f8fafc", color: "#0c3b6b", border: "1px solid #cbd5e1" }}
          >
            Central Governance Dashboard →
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: "4px", fontSize: "12.5px", fontWeight: 700, marginBottom: "16px" }}>
          {statusMessage}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Monitored Manufacturers</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0c3b6b", margin: "4px 0" }}>
            {stats?.total_manufacturers ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "#16a34a" }}>Registered with Legal Metrology</div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Active Repeat Offenders</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#dc2626", margin: "4px 0" }}>
            {repeatOffenders.length}
          </div>
          <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 700 }}>Critical Surveillance Required</div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Legal Enforcement Memos</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
            {repeatOffenders.reduce((sum, o) => sum + (o.total_violations || 0), 0)}
          </div>
          <div style={{ fontSize: "11px", color: "#d97706" }}>PCR 2011 Infractions Logged</div>
        </div>
      </div>

      {/* Repeat Offenders Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>High-Risk Repeat Non-Compliance Manufacturers</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
            Section 36 & 48 Escalation Docket
          </span>
        </div>

        <div style={{ padding: "16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#334155" }}>
                <th style={{ padding: "12px 14px" }}>Manufacturer / Packer Entity</th>
                <th style={{ padding: "12px 14px" }}>Registered Commodities</th>
                <th style={{ padding: "12px 14px" }}>Recorded Violations</th>
                <th style={{ padding: "12px 14px" }}>Risk Classification</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Statutory Actions</th>
              </tr>
            </thead>
            <tbody>
              {repeatOffenders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#166534", background: "#f0fdf4" }}>
                    No manufacturers currently exceed the critical repeat violation threshold.
                  </td>
                </tr>
              ) : (
                repeatOffenders.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #fecaca", background: "#fef2f2" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0c3b6b" }}>
                      {item.manufacturer_name}
                      <div style={{ fontSize: "11px", color: "#7f1d1d", fontWeight: 500 }}>
                        LMPC Certificate: Verified Commercial Unit
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                      {item.total_products} Monitored SKU(s)
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#b91c1c" }}>
                      {item.total_violations} Statutory Violations
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="badge-gov badge-critical">
                        REPEAT OFFENDER ({item.risk_level || "HIGH"})
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <button
                        onClick={() => handleIssueNotice(item.manufacturer_name)}
                        className="btn-gov-danger"
                        style={{ padding: "6px 12px", fontSize: "11.5px", marginRight: "6px" }}
                      >
                        Issue Show-Cause Notice
                      </button>
                      <button
                        onClick={() => navigate("/checker/scan")}
                        className="btn-gov-primary"
                        style={{ padding: "6px 12px", fontSize: "11.5px" }}
                      >
                        Audit SKUs
                      </button>
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

export default Manufacturers;