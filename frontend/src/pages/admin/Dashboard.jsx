import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [complianceStats, setComplianceStats] = useState(null);
  const [violationStats, setViolationStats] = useState(null);
  const [mfgStats, setMfgStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, compRes, violRes, mfgRes, auditRes] = await Promise.all([
        API.get("/admin/dashboard").catch(() => ({ data: {} })),
        API.get("/admin/compliance-statistics").catch(() => ({ data: {} })),
        API.get("/admin/violation-statistics").catch(() => ({ data: {} })),
        API.get("/admin/manufacturer-statistics").catch(() => ({ data: {} })),
        API.get("/admin/audit-logs").catch(() => ({ data: [] }))
      ]);

      setStats(dashRes.data);
      setComplianceStats(compRes.data);
      setViolationStats(violRes.data);
      setMfgStats(mfgRes.data);
      setAuditLogs(auditRes.data || []);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = stats?.total_products || 0;
  const totalScans = stats?.total_scans || 0;
  const totalViolations = stats?.total_violations || 0;
  const complianceRate = stats?.overall_compliance_rate || 100.0;
  const repeatOffenders = mfgStats?.repeat_offenders || [];

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif", background: "#f8fafc", minHeight: "100%" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #1e3a8a 100%)", color: "#ffffff", padding: "24px 28px", borderRadius: "14px", marginBottom: "24px", boxShadow: "0 8px 24px -4px rgba(12, 59, 107, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11.5px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#93c5fd" }}>
            NATIONAL LEGAL METROLOGY ENFORCEMENT INTELLIGENCE COMMAND
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "6px 0 4px 0" }}>
            Central Enforcement & Governance Dashboard
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>
            Real-time compliance monitoring • Repeat offender analytics • Statutory audit trail (PCR 2011)
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <span style={{ 
              background: "rgba(16, 185, 129, 0.22)", 
              border: "1px solid #10b981", 
              color: "#a7f3d0", 
              padding: "4px 10px", 
              borderRadius: "20px", 
              fontSize: "11px", 
              fontWeight: 700, 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px" 
            }}>
              MongoDB 8.0 Database Cluster • Real-Time Synchronized
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/admin/reports")}
            style={{ background: "#ffffff", color: "#0c3b6b", border: "none", padding: "10px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 800, cursor: "pointer" }}
          >
            Generate Executive Report
          </button>
          <button
            onClick={() => navigate("/admin/rules")}
            style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer" }}
          >
            Manage PCR Rules
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "24px" }}>
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Registered Commodities</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0c3b6b", margin: "6px 0" }}>{totalProducts}</div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700 }}>Total Monitored SKU Base</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Total Inspections / Scans</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0284c7", margin: "6px 0" }}>{totalScans}</div>
          <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>Automated AI Checks</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Overall Compliance Rate</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: complianceRate >= 80 ? "#16a34a" : "#dc2626", margin: "6px 0" }}>
            {complianceRate?.toFixed(1)}%
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>National Average Index</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Total Statutory Violations</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#dc2626", margin: "6px 0" }}>{totalViolations}</div>
          <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 700 }}>Pending or Enforced Memos</div>
        </div>
      </div>

      {/* Two-Column Intelligence Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "24px" }}>
        
        {/* Left: Repeat Offender Intelligence */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Repeat Offender Intelligence Hub
            </h2>
            <button
              onClick={() => navigate("/admin/manufacturers")}
              style={{ background: "transparent", border: "none", color: "#0284c7", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              All Manufacturers →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {repeatOffenders.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#166534", fontSize: "12.5px", background: "#f0fdf4", borderRadius: "8px" }}>
                No repeat non-compliance offenders currently flagged.
              </div>
            ) : (
              repeatOffenders.map((m, i) => (
                <div
                  key={i}
                  style={{ padding: "14px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#991b1b" }}>{m.manufacturer_name}</div>
                    <div style={{ fontSize: "11.5px", color: "#7f1d1d" }}>
                      Monitored Commodities: {m.total_products} • Recorded Violations: {m.total_violations}
                    </div>
                  </div>
                  <span style={{ fontSize: "10.5px", fontWeight: 800, background: "#dc2626", color: "#ffffff", padding: "4px 8px", borderRadius: "6px" }}>
                    REPEAT OFFENDER
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Real-Time Statutory Audit Logs */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Real-Time Statutory Audit Trail
            </h2>
            <button
              onClick={() => navigate("/admin/audit")}
              style={{ background: "transparent", border: "none", color: "#0284c7", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              View Full Audit Logs →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
            {auditLogs.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "12.5px" }}>
                No recent audit log entries recorded.
              </div>
            ) : (
              auditLogs.slice(0, 6).map((log, idx) => (
                <div
                  key={idx}
                  style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}
                >
                  <div>
                    <span style={{ fontWeight: 800, color: "#0c3b6b" }}>[{log.action}]</span>
                    <span style={{ color: "#334155", marginLeft: "6px" }}>{log.entity} #{log.entity_id}</span>
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Recent'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;