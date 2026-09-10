import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/products";
import scanService from "../../services/scans";
import API from "../../services/api";

const STATE_RISK_MAP = [
  { state: "Maharashtra", zone: "Western Hub", score: 88, riskLevel: "HIGH", activeInspections: 42, topIssue: "Dual MRP & Packaging Date Omission" },
  { state: "Andhra Pradesh", zone: "Southern Zone", score: 91, riskLevel: "CRITICAL", activeInspections: 38, topIssue: "Missing Mandatory Importer Label" },
  { state: "Telangana", zone: "Deccan Plateau", score: 64, riskLevel: "MEDIUM", activeInspections: 19, topIssue: "Net Quantity Discrepancies" },
  { state: "Karnataka", zone: "Southern Hub", score: 42, riskLevel: "MODERATE", activeInspections: 14, topIssue: "Font Size Below PCR 2011 Minima" },
  { state: "Delhi NCR", zone: "Northern Capital", score: 79, riskLevel: "HIGH", activeInspections: 29, topIssue: "E-Commerce Cross-Channel Mismatch" },
  { state: "Kerala", zone: "Coastal South", score: 18, riskLevel: "LOW", activeInspections: 6, topIssue: "Minor Postal Code Incompleteness" }
];

const RiskIntelligence = () => {
  const navigate = useNavigate();
  const [repeatOffenders, setRepeatOffenders] = useState([]);
  const [priorityInspections, setPriorityInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(STATE_RISK_MAP[0]);
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    loadIntelligenceData();
  }, []);

  const loadIntelligenceData = async () => {
    setLoading(true);
    try {
      const [offenders, priorities] = await Promise.all([
        productService.getRepeatOffenders().catch(() => []),
        productService.getInspectionPriority().catch(() => [])
      ]);
      setRepeatOffenders(offenders || []);
      setPriorityInspections(priorities || []);
    } catch (err) {
      console.error("Error loading intelligence data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (level) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL": return { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" };
      case "HIGH": return { background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" };
      case "MEDIUM": case "MODERATE": return { background: "#fefce8", color: "#a16207", border: "1px solid #fef08a" };
      default: return { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" };
    }
  };

  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* Header Banner */}
      <div className="gov-panel" style={{ background: "#ffffff", padding: "18px 24px", borderTopColor: "#0c3b6b", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="badge-gov badge-info">STATUTORY SURVEILLANCE</span>
              <span className="badge-gov badge-critical">PCR 2011 ENFORCEMENT</span>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", margin: "6px 0 2px 0" }}>
              Inspection Priority Map & Repeat Offender Intelligence
            </h1>
            <p style={{ fontSize: "12.5px", color: "#475569", margin: 0 }}>
              AI-directed field targeting • Geographic risk distribution • Repeat non-compliance detection • Entity compliance graph
            </p>
          </div>

          <button
            onClick={() => navigate("/checker/scan")}
            className="btn-gov-success"
            style={{ padding: "10px 20px", fontSize: "13px", fontWeight: 800 }}
          >
            Launch AI Package Scanner →
          </button>
        </div>
      </div>

      {/* Repeat Offender Alert Banner (Feature #8) */}
      {repeatOffenders.length > 0 ? (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#dc2626" }}>ALERT</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#991b1b" }}>
                CRITICAL ENFORCEMENT ALERT: {repeatOffenders.length} Repeat Non-Compliance Offender(s) Identified
              </div>
              <div style={{ fontSize: "12px", color: "#7f1d1d", marginTop: "2px" }}>
                Multiple manufacturing units have been associated with repeated MRP omissions and deceptive packaging across consecutive inspections.
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/manufacturers")}
            className="btn-gov-danger"
            style={{ padding: "8px 16px", fontSize: "12px" }}
          >
            View Full Offender Roster →
          </button>
        </div>
      ) : (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "14px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "24px" }}>[STEP 4]</div>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#166534" }}>
                LIVE ENFORCEMENT STATUS: Repeat Offender Surveillance Active
              </div>
              <div style={{ fontSize: "11.5px", color: "#15803d", marginTop: "2px" }}>
                All registered manufacturing entities are within standard statutory compliance variance limits. Zero critical repeat offenders at this time.
              </div>
            </div>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: "4px" }}>
            SEC 36(1) MONITORED
          </span>
        </div>
      )}

      {/* 2-Column Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "20px", marginBottom: "20px" }}>
        
        {/* Left: Geographic Inspection Priority Map (Feature #9) */}
        <div className="gov-panel">
          <div className="gov-panel-header">
            <span>State-Wise Inspection Priority Map (India Jurisdictions)</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Live Surveillance Index</span>
          </div>

          <div style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>
              Select a jurisdiction to inspect enforcement priority rating, active spot-check quotas, and top packaging infractions:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {STATE_RISK_MAP.map((item, idx) => {
                const isSelected = selectedState.state === item.state;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedState(item)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "6px",
                      border: isSelected ? "2px solid #0c3b6b" : "1px solid #e2e8f0",
                      background: isSelected ? "#f0f9ff" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#0c3b6b" }}>
                        {item.state} • <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{item.zone}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                        Primary Deficit: <strong>{item.topIssue}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ ...getBadgeStyle(item.riskLevel), fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "4px" }}>
                        Score: {item.score} / 100 ({item.riskLevel})
                      </span>
                      <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "4px" }}>
                        Active Inspections: <strong>{item.activeInspections}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Jurisdiction Focus Card */}
            {selectedState && (
              <div style={{ marginTop: "16px", background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0c3b6b", marginBottom: "6px" }}>
                  Field Inspector Directive for {selectedState.state}
                </div>
                <div style={{ fontSize: "12px", color: "#334155", lineHeight: 1.5 }}>
                  Officers deployed in the <strong>{selectedState.zone}</strong> are instructed to carry out mandatory spot audits on packaged commodities. Focus verification on <strong>{selectedState.topIssue}</strong> with immediate evidence memo issuance.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Repeat Offender Intelligence & Priority Queue */}
        <div className="gov-panel">
          <div className="gov-panel-header">
            <span>Repeat Offender Registry & High-Priority Queue</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
              {repeatOffenders.length} Offender Entities Identified
            </span>
          </div>

          <div style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#0c3b6b", marginBottom: "8px" }}>
              Top Violating Manufacturers (PCR 2011 Repeat Infractions):
            </div>

            {repeatOffenders.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#166534", background: "#f0fdf4", borderRadius: "6px", fontSize: "12.5px", border: "1px solid #bbf7d0" }}>
                No high-volume repeat offenders currently exceed the critical threshold.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
                {repeatOffenders.map((offender, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #fca5a5",
                      background: "#fef2f2",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#991b1b" }}>
                        #{idx+1} {offender.manufacturer_name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#7f1d1d", marginTop: "2px" }}>
                        Registered Commodities: {offender.total_products} • Recorded Violations: <strong style={{ color: "#b91c1c" }}>{offender.total_violations}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="badge-gov badge-critical">
                        REPEAT OFFENDER
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Scheduled Priority Inspection Tasks */}
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#0c3b6b", marginBottom: "8px" }}>
              Scheduled Priority Inspection Queue:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
              {priorityInspections.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
                  No pending inspections queued.
                </div>
              ) : (
                priorityInspections.slice(0, 5).map((insp) => (
                  <div
                    key={insp.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "4px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: "#0c3b6b" }}>
                        {insp.inspection_code} • Product #{insp.product_id}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        Status: <strong>{insp.status}</strong> • Priority: <strong>{insp.priority_score?.toFixed(0) || 50}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/checker/scan")}
                      style={{ background: "#0c3b6b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                    >
                      Audit Now
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Feature #20: Statutory Compliance Entity Graph */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>Statutory Compliance Entity Graph (Interconnected Intelligence)</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Relational Provenance</span>
        </div>

        <div style={{ padding: "20px" }}>
          <div style={{ fontSize: "12.5px", color: "#475569", marginBottom: "16px" }}>
            METRAVISION connects every packaging scan into a single holistic provenance graph, linking manufacturers to registered SKUs, physical scans, e-commerce listings, and enforcement actions.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#1e40af", textTransform: "uppercase" }}>1. Manufacturer Entity</div>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#0c3b6b", margin: "4px 0" }}>Global Tech Corp</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>Origin: PRC • LMPC Registered</div>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>2. Monitored Commodity</div>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#0c3b6b", margin: "4px 0" }}>UltraSmart Power Bank</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>SKU #2 • Electronics Category</div>
            </div>

            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", padding: "14px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#c2410c", textTransform: "uppercase" }}>3. E-Commerce Listing</div>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#0c3b6b", margin: "4px 0" }}>QuickMart Online</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>Dual-MRP Discrepancy Flagged</div>
            </div>

            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "14px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#991b1b", textTransform: "uppercase" }}>4. Enforcement Memo</div>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#0c3b6b", margin: "4px 0" }}>VIOL-SEED01 / SCN-SEED01</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>Officer Confirmed • Audit Logged</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RiskIntelligence;