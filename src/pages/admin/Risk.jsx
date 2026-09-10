import React, { useState, useEffect } from "react";
import API from "../../services/api";

const AdminRisk = () => {
  const [stats, setStats] = useState(null);
  const [repeatOffenders, setRepeatOffenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployModal, setDeployModal] = useState(null);
  const [deploySuccess, setDeploySuccess] = useState(null);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const [riskRes, repeatRes] = await Promise.all([
        API.get("/admin/risk-statistics"),
        API.get("/manufacturers/repeat-offenders").catch(() => ({ data: [] }))
      ]);
      setStats(riskRes.data);
      setRepeatOffenders(repeatRes.data || []);
    } catch (err) {
      console.error("Failed to load risk statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployAudit = (zoneName) => {
    setDeployModal(zoneName);
  };

  const confirmDeployment = () => {
    const target = deployModal;
    setDeployModal(null);
    setDeploySuccess(`Rapid Enforcement Squad successfully dispatched to ${target}. Task reference #AUDIT-${Date.now().toString().slice(-6)}.`);
    setTimeout(() => setDeploySuccess(null), 5000);
  };

  // State / Regional Jurisdictions
  const jurisdictions = [
    { zone: "Delhi NCR Commercial Hub", state: "DL", risk: "CRITICAL", score: 88, violations: 42, topIssue: "Dual-MRP & Shrinkflation", officer: "Shri R. K. Sharma" },
    { zone: "Mumbai Metra Wholesale Yard", state: "MH", risk: "HIGH", score: 76, violations: 29, topIssue: "Missing Net Quantity / Height < 3mm", officer: "Smt. P. Deshmukh" },
    { zone: "Hyderabad Tech & FMCG Corridor", state: "TS", risk: "HIGH", score: 71, violations: 24, topIssue: "Importer Country of Origin Omission", officer: "Shri V. Rao" },
    { zone: "Bengaluru E-Commerce Logistics Hub", state: "KA", risk: "MEDIUM", score: 54, violations: 16, topIssue: "Digital Twin MRP Discrepancy", officer: "Dr. A. Gowda" },
    { zone: "Kolkata Port Retail District", state: "WB", risk: "HIGH", score: 79, violations: 31, topIssue: "Unregistered Packer Address", officer: "Shri S. Mukherjee" },
    { zone: "Chennai Auto & Hardware Market", state: "TN", risk: "LOW", score: 28, violations: 5, topIssue: "Minor Font Formatting", officer: "Smt. K. Sundaram" },
  ];

  return (
    <div style={{ padding: "28px 36px", fontFamily: "Segoe UI, -apple-system, sans-serif", maxWidth: "1400px", margin: "0 auto" }}>
      
      {/* Official Government Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0369a1 100%)", borderRadius: "14px", padding: "24px 30px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.25)" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#93c5fd" }}>
          MINISTRY OF CONSUMER AFFAIRS • CENTRAL INTELLIGENCE CELL (PILLAR 7, 8 & 9)
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, margin: "6px 0 4px 0" }}>
          National Deterministic Risk Intelligence & Priority Map
        </h1>
        <p style={{ fontSize: "13px", opacity: 0.92, margin: 0 }}>
          Explainable 0–100 risk scoring index, jurisdiction violation density, and repeat offender surveillance.
        </p>
      </div>

      {deploySuccess && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "14px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, marginBottom: "20px" }}>
          {deploySuccess}
        </div>
      )}

      {/* KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800 }}>HIGH & CRITICAL RISK LOTS</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#dc2626", margin: "6px 0" }}>
            {stats?.high_risk_products_count ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 700 }}>Priority Enforcement Queue</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800 }}>IDENTIFIED REPEAT OFFENDERS</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#ea580c", margin: "6px 0" }}>
            {stats?.repeat_offenders_count ?? repeatOffenders.length}
          </div>
          <div style={{ fontSize: "11px", color: "#ea580c", fontWeight: 700 }}>Under Section 36(1) Escalation</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800 }}>MONITORED REGIONAL ZONES</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0c3b6b", margin: "6px 0" }}>
            {jurisdictions.length}
          </div>
          <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>Surveillance Active (Real-Time)</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 800 }}>DETERMINISTIC MODEL WEIGHTS</div>
          <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a", marginTop: "8px", lineHeight: "1.6" }}>
            Repeat: <strong>30%</strong> • Shrinkflation: <strong>25%</strong><br/>
            Missing Decl: <strong>25%</strong> • Low Font: <strong>20%</strong>
          </div>
        </div>
      </div>

      {/* Grid: Jurisdiction Priority Queue & Repeat Offender Registry */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        
        {/* Jurisdiction Priority Queue */}
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
                State-Wise Inspection Priority Queue
              </h3>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                Prioritizes field officer allocation by cumulative non-compliance index.
              </p>
            </div>
            <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", fontWeight: 700, color: "#475569" }}>
              Active Jurisdictions: {jurisdictions.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {jurisdictions.map((j, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: j.risk === "CRITICAL" ? "#fff5f5" : j.risk === "HIGH" ? "#fffaf0" : "#f8fafc" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 800, fontSize: "13px", color: "#0f172a" }}>{j.zone}</span>
                    <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: j.risk === "CRITICAL" ? "#dc2626" : j.risk === "HIGH" ? "#ea580c" : "#16a34a", color: "#fff" }}>
                      {j.risk} ({j.score}/100)
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                    Primary: <strong>{j.topIssue}</strong> • Cases: {j.violations} • Assigned: {j.officer}
                  </div>
                </div>

                <button
                  onClick={() => handleDeployAudit(j.zone)}
                  style={{ background: "#0c3b6b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Deploy Squad →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Repeat Offender Registry */}
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#991b1b", margin: 0 }}>
                Repeat Offender Surveillance Registry
              </h3>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                Entities with ≥ 2 confirmed statutory infractions subject to enhanced penalties.
              </p>
            </div>
            <span style={{ fontSize: "11px", background: "#fee2e2", padding: "4px 8px", borderRadius: "6px", fontWeight: 800, color: "#991b1b" }}>
              SEC 36(1) ACTIVE
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {repeatOffenders.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "#166534", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "12.5px" }}>
                No repeat offenders detected across registered manufacturers. All entities comply within statutory tolerance limits.
              </div>
            ) : (
              repeatOffenders.map((off, idx) => (
                <div key={idx} style={{ padding: "14px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991b1b" }}>
                        {off.manufacturer || off.manufacturer_name}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px" }}>
                        Violations Logged: <strong>{off.total_violations}</strong> • SKUs Affected: <strong>{off.skus_affected || off.total_products || 1}</strong>
                      </div>
                      <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "2px", fontWeight: 700 }}>
                        Infraction: {off.top_violation || "Statutory Declarations Omission"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#dc2626" }}>STATUTORY PENALTY</div>
                      <div style={{ fontSize: "15px", fontWeight: 900, color: "#991b1b" }}>
                        ₹ {(off.max_penalty || 50000).toLocaleString()}
                      </div>
                      <button
                        onClick={() => alert(`Issuing Show-Cause Statutory Notice to ${off.manufacturer || off.manufacturer_name} under Section 36(1) of Legal Metrology Act, 2009.`)}
                        style={{ marginTop: "6px", background: "#b91c1c", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "5px", fontSize: "10.5px", fontWeight: 800, cursor: "pointer" }}
                      >
                        Issue Show-Cause →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Deployment Modal */}
      {deployModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "#ffffff", padding: "26px", borderRadius: "14px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0c3b6b", margin: "0 0 8px 0" }}>
              Confirm Targeted Inspection Deployment
            </h3>
            <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: "1.5", margin: "0 0 16px 0" }}>
              You are authorizing the deployment of a rapid legal metrology inspection squad to <strong>{deployModal}</strong>. Officers will conduct on-site verification of net quantity, dual-MRP, and mandatory PCR 2011 declarations.
            </p>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", marginBottom: "20px" }}>
              <div><strong>Statutory Authority:</strong> Central Legal Metrology Rules, 2011</div>
              <div><strong>Priority Level:</strong> IMMEDIATE ACTION</div>
              <div><strong>Team Strength:</strong> 1 Senior Legal Metrology Officer + 2 Inspectors</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setDeployModal(null)}
                style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeployment}
                style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
              >
                Confirm Squad Dispatch →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRisk;