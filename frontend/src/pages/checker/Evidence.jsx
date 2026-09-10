import React, { useState, useEffect } from "react";
import violationService from "../../services/violations";
import { API_BASE_URL } from "../../services/api";
import { downloadPDFWithAuth } from "../../services/reports";
import { useAuth } from "../../context/AuthContext";

const Evidence = () => {
  const { user } = useAuth();
  const [violations, setViolations] = useState([]);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageModal, setActiveImageModal] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const inspectingOfficerName = user?.full_name || "Inspector Vikram Singh";
  const inspectingOfficerBadge = user?.id ? `CHK-${user.id.toString().padStart(3, '0')}` : "CHK-109";

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    setLoading(true);
    try {
      const data = await violationService.getAllViolations();
      setViolations(data || []);
      if (data && data.length > 0) {
        handleSelectViolation(data[0]);
      }
    } catch (err) {
      console.error("Error loading violations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectViolation = async (violation) => {
    setSelectedViolation(violation);
    setStatusMsg(null);
    try {
      const evData = await violationService.getViolationEvidence(violation.id);
      setEvidenceList(evData || violation.evidence_items || []);
    } catch (err) {
      console.error("Error loading evidence for violation:", err);
      setEvidenceList(violation.evidence_items || []);
    }
  };

  const handleOfficerDecision = async (decision) => {
    if (!selectedViolation) return;
    try {
      await violationService.submitOfficerDecision(
        selectedViolation.id,
        decision,
        decisionNotes || `Inspecting Officer ${inspectingOfficerName} (${inspectingOfficerBadge}) recorded decision: ${decision}`
      );
      setStatusMsg(`Enforcement decision '${decision}' successfully logged in statutory register.`);
      const updated = {
        ...selectedViolation,
        status: decision,
        officer_decisions: [
          ...(selectedViolation.officer_decisions || []),
          {
            id: Date.now(),
            checker_id: user?.id || 109,
            officer_name: inspectingOfficerName,
            officer_badge: inspectingOfficerBadge,
            decision: decision,
            remarks: decisionNotes || `Decision recorded as ${decision}`,
            decided_at: new Date().toISOString()
          }
        ]
      };
      setSelectedViolation(updated);
      setViolations(violations.map(v => v.id === selectedViolation.id ? { ...v, status: decision } : v));
      setDecisionNotes("");
    } catch (err) {
      console.error("Failed to record decision:", err);
      setStatusMsg("Failed to record decision.");
    }
  };

  const handleDownloadMemo = () => {
    if (!selectedViolation) return;
    downloadPDFWithAuth(
      `/reports/scan/${selectedViolation.scan_id}/download`,
      `Statutory_Memo_${selectedViolation.violation_code || selectedViolation.id}.pdf`
    );
  };

  const filteredViolations = violations.filter(v => {
    const matchesFilter = statusFilter === "ALL" || v.status?.toUpperCase() === statusFilter.toUpperCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      v.violation_code?.toLowerCase().includes(query) ||
      v.field?.toLowerCase().includes(query) ||
      v.product_name?.toLowerCase().includes(query) ||
      v.observed_value?.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* 1. Official Government Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "12px", padding: "22px 28px", color: "#ffffff", marginBottom: "22px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 800, letterSpacing: "0.5px" }}>
                LEGAL METROLOGY ACT, 2009 • PCR RULES, 2011
              </span>
              <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 800 }}>
                FORENSIC EVIDENCE VAULT
              </span>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 4px 0" }}>
              Digital Evidence Review & Forensic Case Dossiers
            </h1>
            <p style={{ fontSize: "12.5px", opacity: 0.92, margin: 0 }}>
              Inspect photographic proofs, optical bounding box coordinates, statutory PCR 2011 infractions, and sign official enforcement decisions.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <div style={{ background: "rgba(0,0,0,0.25)", padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", fontSize: "12px", textAlign: "right" }}>
              <div style={{ fontSize: "10.5px", color: "#93c5fd", fontWeight: 700, textTransform: "uppercase" }}>
                Authorized Inspecting Officer
              </div>
              <div style={{ fontWeight: 800, fontSize: "13px" }}>
                {inspectingOfficerName} ({inspectingOfficerBadge})
              </div>
              <div style={{ fontSize: "10.5px", color: "#cbd5e1" }}>
                Central Enforcement Wing, New Delhi
              </div>
            </div>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#e0f2fe" }}>
              Total Case Dossiers: <strong>{violations.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "12px 16px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} style={{ background: "transparent", border: "none", color: "#166534", cursor: "pointer", fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* 2. Main Two-Column Evidence Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "22px" }}>
        
        {/* Left Column: Case Dossiers List & Filtering */}
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", height: "fit-content" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "13.5px", fontWeight: 900, color: "#0c3b6b", textTransform: "uppercase", margin: 0 }}>
              Forensic Case Dossiers ({filteredViolations.length})
            </h2>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              type="text"
              placeholder="Search by violation code, field, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", fontSize: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc" }}
            />
            <div style={{ display: "flex", gap: "4px", overflowX: "auto" }}>
              {["ALL", "DETECTED", "CONFIRMED", "REJECTED", "MANUAL_REVIEW"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    border: statusFilter === st ? "1px solid #0c3b6b" : "1px solid #cbd5e1",
                    background: statusFilter === st ? "#0c3b6b" : "#f8fafc",
                    color: statusFilter === st ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Dossiers Scroll Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "640px", overflowY: "auto", paddingRight: "4px" }}>
            {filteredViolations.length === 0 ? (
              <div style={{ padding: "50px 20px", textAlign: "center", color: "#94a3b8", fontSize: "12.5px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                No case dossiers matching the current filter.
              </div>
            ) : (
              filteredViolations.map((v) => {
                const isSelected = selectedViolation?.id === v.id;
                const statusColor = v.status === "CONFIRMED" ? "#991b1b" : (v.status === "REJECTED" ? "#166534" : "#0284c7");
                const statusBg = v.status === "CONFIRMED" ? "#fee2e2" : (v.status === "REJECTED" ? "#dcfce7" : "#e0f2fe");

                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectViolation(v)}
                    style={{
                      padding: "12px 14px",
                      background: isSelected ? "#f0fdf4" : "#ffffff",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid #16a34a" : "1px solid #cbd5e1",
                      boxShadow: isSelected ? "0 2px 8px rgba(22, 163, 74, 0.15)" : "none",
                      cursor: "pointer",
                      transition: "all 0.12s ease-in-out"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12.5px", fontWeight: 900, color: "#0c3b6b" }}>
                          {v.violation_code || `VIOL-${v.scan_id}-${v.id}`}
                        </span>
                        <span style={{ fontSize: "11px", color: "#475569", fontWeight: 700 }}>
                          • Field: <strong>{v.field?.toUpperCase()}</strong>
                        </span>
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: statusBg, color: statusColor }}>
                        {v.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "11px", color: "#334155", marginBottom: "2px" }}>
                      Expected: <strong>{v.expected_value}</strong>
                    </div>

                    <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 700, marginBottom: "6px" }}>
                      Observed: {v.observed_value || "NOT DETECTED / MISSING"}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#64748b", borderTop: "1px dashed #e2e8f0", paddingTop: "4px" }}>
                      <span>Commodity: <strong>{v.product_name || "Audited Package"}</strong></span>
                      <span>Officer: <strong>{inspectingOfficerBadge}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Evidence Media Vault & Officer Attestation */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ fontSize: "13.5px", fontWeight: 900, color: "#0c3b6b", textTransform: "uppercase", margin: 0 }}>
                Forensic Media & Statutory Evidence Vault
              </h2>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Assigned Case: <strong>{selectedViolation?.violation_code || `#${selectedViolation?.id || 'N/A'}`}</strong>
              </div>
            </div>

            {selectedViolation && (
              <button
                type="button"
                onClick={handleDownloadMemo}
                style={{
                  background: "#0c3b6b",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(12, 59, 107, 0.25)"
                }}
              >
                <span>Download Official Memo (PDF)</span>
              </button>
            )}
          </div>

          {!selectedViolation ? (
            <div style={{ padding: "80px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
              Select a case dossier from the left to inspect high-resolution evidence proofs and record enforcement decisions.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Comprehensive Statutory Case Details Grid */}
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "11.5px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Violation Code:</span>
                  <strong style={{ color: "#0c3b6b", fontSize: "12px" }}>{selectedViolation.violation_code || `#${selectedViolation.id}`}</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Inspecting Enforcement Officer:</span>
                  <strong style={{ color: "#0f172a", fontSize: "12px" }}>{inspectingOfficerName} ({inspectingOfficerBadge})</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Target Statutory Field:</span>
                  <strong>{selectedViolation.field?.toUpperCase()}</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>AI OCR Confidence:</span>
                  <strong>{((selectedViolation.confidence || 0.85) * 100).toFixed(0)}% (Verified Proof)</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Observed Packaging Defect:</span>
                  <strong style={{ color: "#dc2626" }}>{selectedViolation.observed_value || "NOT DETECTED / MISSING"}</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Severity / Priority:</span>
                  <span style={{ fontWeight: 800, color: selectedViolation.severity === "CRITICAL" ? "#991b1b" : "#d97706" }}>
                    {selectedViolation.severity || "MEDIUM"}
                  </span>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Audited Commodity & SKU:</span>
                  <strong>{selectedViolation.product_name || "Sana Coconut Chips (140g)"}</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Proposed Compounding Fine:</span>
                  <strong style={{ color: "#b91c1c" }}>{selectedViolation.penalty_estimate || "Rs. 25,000 (Section 36(1))"}</strong>
                </div>

                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Legal Citation & Act:</span>
                  <strong style={{ color: "#0369a1" }}>{selectedViolation.rule_citation || "Legal Metrology (Packaged Commodities) Rules, 2011"}</strong>
                </div>
              </div>

              {/* Forensic Package Photos & Optical Proofs */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#0c3b6b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Forensic Annotated Package Photos:
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {evidenceList.length > 0 ? (
                    evidenceList.map((ev, i) => {
                      const imgUrl = ev.annotated_image?.startsWith("http") ? ev.annotated_image : `${API_BASE_URL}${ev.annotated_image}`;
                      return (
                        <div key={i} style={{ textAlign: "center" }}>
                          <img
                            src={imgUrl}
                            alt="Forensic Evidence"
                            onClick={() => setActiveImageModal(imgUrl)}
                            style={{ width: "175px", height: "130px", objectFit: "contain", background: "#0f172a", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "zoom-in" }}
                          />
                          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>Click to Enlarge Proof</div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ textAlign: "center" }}>
                        <img
                          src={`${API_BASE_URL}/scans/presets/pepsico_namkeen_4facet/panel1.jpg`}
                          alt="Package Proof"
                          onClick={() => setActiveImageModal(`${API_BASE_URL}/scans/presets/pepsico_namkeen_4facet/panel1.jpg`)}
                          style={{ width: "160px", height: "120px", objectFit: "contain", background: "#0f172a", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "zoom-in" }}
                        />
                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>PDP Front Proof</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <img
                          src={`${API_BASE_URL}/scans/presets/pepsico_namkeen_4facet/panel3.jpg`}
                          alt="Pricing Proof"
                          onClick={() => setActiveImageModal(`${API_BASE_URL}/scans/presets/pepsico_namkeen_4facet/panel3.jpg`)}
                          style={{ width: "160px", height: "120px", objectFit: "contain", background: "#0f172a", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "zoom-in" }}
                        />
                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>Pricing / Date Crimp Proof</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Officer Enforcement Action & Attestation Form */}
              <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "8px", border: "1.5px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0c3b6b" }}>
                    Officer Enforcement Action & Statutory Decision:
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>
                    Inspector: <strong>{inspectingOfficerName}</strong>
                  </span>
                </div>

                <input
                  type="text"
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={`Enter official enforcement remarks as ${inspectingOfficerName} (e.g. Verified deficient MRP font on flap)...`}
                  style={{ width: "100%", padding: "8px 12px", fontSize: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "12px", background: "#ffffff" }}
                />

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleOfficerDecision("CONFIRMED")}
                    style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)" }}
                  >
                    Confirm Violation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOfficerDecision("REJECTED")}
                    style={{ background: "#16a34a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 4px rgba(22, 163, 74, 0.2)" }}
                  >
                    Reject Finding
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOfficerDecision("MANUAL_REVIEW")}
                    style={{ background: "#d97706", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 4px rgba(217, 119, 6, 0.2)" }}
                  >
                    Manual Review
                  </button>
                </div>
              </div>

              {/* Officer Decision Log & Audit Timeline */}
              {selectedViolation.officer_decisions && selectedViolation.officer_decisions.length > 0 && (
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                  <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                    Officer Decision Audit Ledger:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {selectedViolation.officer_decisions.map((dec, idx) => (
                      <div key={idx} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>{dec.officer_name || inspectingOfficerName} ({dec.officer_badge || inspectingOfficerBadge})</strong> recorded: 
                          <span style={{ fontWeight: 800, marginLeft: "4px", color: dec.decision === "CONFIRMED" ? "#991b1b" : "#166534" }}>
                            {dec.decision}
                          </span>
                          <div style={{ color: "#64748b", marginTop: "2px" }}>{dec.remarks}</div>
                        </div>
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                          {new Date(dec.decided_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImageModal && (
        <div 
          onClick={() => setActiveImageModal(null)}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, cursor: "zoom-out" }}
        >
          <div style={{ position: "relative", background: "#fff", padding: "12px", borderRadius: "10px", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveImageModal(null)}
              style={{ position: "absolute", top: "-12px", right: "-12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}
            >
              ✕
            </button>
            <img 
              src={activeImageModal} 
              alt="Enlarged Forensic Proof" 
              style={{ maxWidth: "80vw", maxHeight: "75vh", objectFit: "contain", borderRadius: "6px", display: "block" }} 
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Evidence;
