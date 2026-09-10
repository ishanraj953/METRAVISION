import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FileText, 
  ShieldAlert, 
  Building2, 
  Clock, 
  Download, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  IndianRupee,
  Send,
  XCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "http://127.0.0.1:8000";

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'CONFIRM_RESP', 'ISSUE_NOTICE', 'IMPOSE_PENALTY', 'CLOSE_CASE'
  
  // Action Form States
  const [confirmedRole, setConfirmedRole] = useState("MANUFACTURER");
  const [confirmedEntityName, setConfirmedEntityName] = useState("");
  const [officerNotes, setOfficerNotes] = useState("");
  const [statutorySection, setStatutorySection] = useState("Section 36(1) LM Act, 2009");
  
  const [noticeType, setNoticeType] = useState("SHOW_CAUSE_NOTICE");
  const [noticeDeadlineDays, setNoticeDeadlineDays] = useState(15);
  const [recipientEmail, setRecipientEmail] = useState("");
  
  const [penaltyAmount, setPenaltyAmount] = useState(25000);
  const [resolutionType, setResolutionType] = useState("COMPOUNDED");
  const [collectedAmount, setCollectedAmount] = useState(25000);
  
  const [actionProcessing, setActionProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const fetchCaseDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/cases/${id}`, { headers });
      if (res.data) {
        setCaseData(res.data);
        setConfirmedRole(res.data.entity_type || "MANUFACTURER");
        setConfirmedEntityName(res.data.responsible_party_name || "");
        setStatutorySection(res.data.applicable_act_section || "Section 36(1) LM Act, 2009");
        setPenaltyAmount(res.data.potential_penalty_max || 25000);
        setCollectedAmount(res.data.imposed_penalty || res.data.potential_penalty_max || 25000);
      }
    } catch (err) {
      console.error("Case detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  const handleConfirmResponsibility = async () => {
    setActionProcessing(true);
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE}/cases/${id}/confirm-responsibility`, {
        responsible_party_id: caseData.responsible_party_id,
        entity_name: confirmedEntityName,
        entity_type: confirmedRole,
        statutory_section: statutorySection,
        remarks: officerNotes
      }, { headers });
      
      setActionSuccessMsg("Officer confirmation recorded successfully.");
      setActiveModal(null);
      fetchCaseDetail();
    } catch (err) {
      alert("Failed to confirm responsibility: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionProcessing(false);
    }
  };

  const handleIssueNotice = async () => {
    setActionProcessing(true);
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE}/cases/${id}/issue-notice`, {
        deadline_days: Number(noticeDeadlineDays),
        notice_type: noticeType,
        notice_remarks: officerNotes,
        recipient_email: recipientEmail,
        send_email: true
      }, { headers });
      
      setActionSuccessMsg("Show Cause Notice issued and statutory communication dispatched.");
      setActiveModal(null);
      fetchCaseDetail();
    } catch (err) {
      alert("Failed to issue notice: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionProcessing(false);
    }
  };

  const handleImposePenalty = async () => {
    setActionProcessing(true);
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE}/cases/${id}/impose-penalty`, {
        penalty_amount: Number(penaltyAmount),
        statutory_section: statutorySection,
        penalty_remarks: officerNotes,
        send_email: true
      }, { headers });
      
      setActionSuccessMsg("Compounding Penalty recorded under Legal Metrology Act.");
      setActiveModal(null);
      fetchCaseDetail();
    } catch (err) {
      alert("Failed to impose penalty: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionProcessing(false);
    }
  };

  const handleCloseCase = async () => {
    setActionProcessing(true);
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE}/cases/${id}/close`, {
        resolution_type: resolutionType,
        amount_collected: Number(collectedAmount),
        closing_remarks: officerNotes
      }, { headers });
      
      setActionSuccessMsg("Case resolution finalized.");
      setActiveModal(null);
      fetchCaseDetail();
    } catch (err) {
      alert("Failed to close case: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionProcessing(false);
    }
  };

  const downloadPDF = () => {
    const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
    window.open(`${API_BASE}/cases/${id}/pdf?token=${token}`, "_blank");
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading statutory case file...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Case Not Found</h3>
        <button onClick={() => navigate("/enforcement/cases")} className="btn-gov-secondary">
          Back to Cases
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Top Breadcrumb & Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", background: "#ffffff", padding: "14px 20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/enforcement/cases")} className="btn-gov-secondary" style={{ padding: "6px 10px" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
                {caseData.case_number}
              </h1>
              <span className={`badge-status badge-status-${caseData.status?.toLowerCase().replace('_', '-')}`}>
                {caseData.status}
              </span>
              <span className={`badge-severity-${caseData.severity?.toLowerCase()}`} style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                {caseData.severity} SEVERITY
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              Registered on {new Date(caseData.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} IST
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={downloadPDF} className="btn-gov-secondary">
            <Download size={14} /> Statutory Memo PDF
          </button>
          <button onClick={() => setActiveModal("CONFIRM_RESP")} className="btn-gov-secondary">
            Officer Review
          </button>
          <button onClick={() => setActiveModal("ISSUE_NOTICE")} className="btn-gov-primary" style={{ background: "#991b1b" }}>
            <Mail size={14} /> Issue Notice
          </button>
          <button onClick={() => setActiveModal("IMPOSE_PENALTY")} className="btn-gov-primary" style={{ background: "#c2410c" }}>
            <IndianRupee size={14} /> Impose Penalty
          </button>
          <button onClick={() => setActiveModal("CLOSE_CASE")} className="btn-gov-primary" style={{ background: "#166534" }}>
            <CheckCircle2 size={14} /> Compound / Close
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg("")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#166534", fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* Main Grid: Commodity Details + Responsible Entity + Legal Provisions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "18px" }}>
        
        {/* Commodity Info */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <FileText size={16} color="#0c3b6b" /> Inspected Commodity Details
            </div>
          </div>
          <table style={{ width: "100%", fontSize: "12.5px", lineHeight: "1.8" }}>
            <tbody>
              <tr>
                <td style={{ color: "#64748b", width: "40%" }}>Commodity Name</td>
                <td style={{ fontWeight: 700, color: "#0f172a" }}>{caseData.product_name}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b" }}>Brand / Trade Name</td>
                <td style={{ fontWeight: 600 }}>{caseData.product_brand || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b" }}>Category</td>
                <td>{caseData.product_category || "Packaged Food"}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b" }}>Inspection Officer</td>
                <td style={{ fontWeight: 600 }}>{caseData.officer_name} ({caseData.officer_badge})</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Responsible Entity Info */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <Building2 size={16} color="#0c3b6b" /> Responsible Party Liability
            </div>
            {caseData.responsible_party_id && (
              <button 
                onClick={() => navigate(`/enforcement/responsible-parties/${caseData.responsible_party_id}`)}
                className="btn-gov-secondary"
                style={{ padding: "3px 8px", fontSize: "11px" }}
              >
                View Profile
              </button>
            )}
          </div>
          <table style={{ width: "100%", fontSize: "12.5px", lineHeight: "1.8" }}>
            <tbody>
              <tr>
                <td style={{ color: "#64748b", width: "40%" }}>Entity Name</td>
                <td style={{ fontWeight: 700, color: "#0c3b6b" }}>{caseData.responsible_party_name || "Unassigned"}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b" }}>Entity Role</td>
                <td>
                  <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>
                    {caseData.entity_type}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ color: "#64748b" }}>Statutory Section</td>
                <td style={{ fontWeight: 700, color: "#991b1b" }}>{caseData.applicable_act_section}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b" }}>Applicable PCR Rule</td>
                <td>{caseData.applicable_rule || "PCR 2011 Rule 6(1)"}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Detected Violations Breakdown */}
      <div className="gov-card">
        <div className="gov-card-header">
          <div className="gov-card-title">
            <ShieldAlert size={16} color="#b91c1c" /> Non-Compliance Evidence & Rule Violations
          </div>
        </div>

        <div className="gov-table-wrapper">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Rule Code</th>
                <th>Declaration Field</th>
                <th>Violation Observation</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {caseData.violations_summary && caseData.violations_summary.length > 0 ? (
                caseData.violations_summary.map((v, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: "#0c3b6b" }}>{v.rule_code}</td>
                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{v.field?.replace('_', ' ')}</td>
                    <td>{v.message}</td>
                    <td>
                      <span className={`badge-severity-${v.severity?.toLowerCase()}`} style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700 }}>
                        {v.severity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: "16px", color: "#475569" }}>
                    {caseData.officer_remarks || "Statutory inspection logged under Legal Metrology Act, 2009."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Action Modals */}
      {activeModal === "CONFIRM_RESP" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div className="gov-card" style={{ maxWidth: "550px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="gov-card-header">
              <div className="gov-card-title">Confirm / Reassign Responsible Entity</div>
              <button onClick={() => setActiveModal(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Entity Role:</label>
                <select 
                  value={confirmedRole} 
                  onChange={(e) => setConfirmedRole(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="MANUFACTURER">Manufacturer (Primary Packer / Producer)</option>
                  <option value="PACKER">Packer (Third-party contract packaging)</option>
                  <option value="IMPORTER">Importer (Rule 27 / Imported packages)</option>
                  <option value="BRAND_OWNER">Brand Owner (Deemed Principal)</option>
                  <option value="SELLER_DEALER">Seller / Dealer (MRP alteration / overcharge)</option>
                  <option value="ECOMMERCE_ENTITY">E-Commerce Marketplace (Rule 6(10) omission)</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Entity Name:</label>
                <input 
                  type="text" 
                  value={confirmedEntityName} 
                  onChange={(e) => setConfirmedEntityName(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Statutory Section Applied:</label>
                <input 
                  type="text" 
                  value={statutorySection} 
                  onChange={(e) => setStatutorySection(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Officer Remarks & Legal Justification:</label>
                <textarea 
                  rows="3" 
                  value={officerNotes} 
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="State evidence review rationale..."
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => setActiveModal(null)} className="btn-gov-secondary">Cancel</button>
                <button onClick={handleConfirmResponsibility} disabled={actionProcessing} className="btn-gov-primary">
                  {actionProcessing ? "Saving..." : "Confirm Liability"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "ISSUE_NOTICE" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div className="gov-card" style={{ maxWidth: "550px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="gov-card-header">
              <div className="gov-card-title">Issue Statutory Show Cause Notice</div>
              <button onClick={() => setActiveModal(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Notice Type:</label>
                <select 
                  value={noticeType} 
                  onChange={(e) => setNoticeType(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="SHOW_CAUSE_NOTICE">Show Cause Notice (PCR Rule 6 / Sec 36)</option>
                  <option value="SEIZURE_NOTICE">Seizure & Detention Memo (Sec 15 LM Act)</option>
                  <option value="REGISTRATION_NOTICE">Non-Registration Notice (Rule 27 PCR)</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Response Deadline (Days):</label>
                <input 
                  type="number" 
                  value={noticeDeadlineDays} 
                  onChange={(e) => setNoticeDeadlineDays(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Recipient Email (for Digital Dispatch):</label>
                <input 
                  type="email" 
                  value={recipientEmail} 
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="legal@company.com"
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Notice Observations & Directives:</label>
                <textarea 
                  rows="3" 
                  value={officerNotes} 
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Directives for corrective action..."
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => setActiveModal(null)} className="btn-gov-secondary">Cancel</button>
                <button onClick={handleIssueNotice} disabled={actionProcessing} className="btn-gov-primary" style={{ background: "#991b1b" }}>
                  {actionProcessing ? "Issuing..." : "Issue & Dispatch Notice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "IMPOSE_PENALTY" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div className="gov-card" style={{ maxWidth: "550px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="gov-card-header">
              <div className="gov-card-title">Impose Statutory Penalty / Fine</div>
              <button onClick={() => setActiveModal(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Penalty Amount (INR):</label>
                <input 
                  type="number" 
                  value={penaltyAmount} 
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Statutory Provision:</label>
                <input 
                  type="text" 
                  value={statutorySection} 
                  onChange={(e) => setStatutorySection(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Compounding Order Details:</label>
                <textarea 
                  rows="3" 
                  value={officerNotes} 
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Record compounding order and deadline..."
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => setActiveModal(null)} className="btn-gov-secondary">Cancel</button>
                <button onClick={handleImposePenalty} disabled={actionProcessing} className="btn-gov-primary" style={{ background: "#c2410c" }}>
                  {actionProcessing ? "Imposing..." : "Record Compounding Fine"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "CLOSE_CASE" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div className="gov-card" style={{ maxWidth: "550px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="gov-card-header">
              <div className="gov-card-title">Case Closure & Settlement Record</div>
              <button onClick={() => setActiveModal(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Resolution Type:</label>
                <select 
                  value={resolutionType} 
                  onChange={(e) => setResolutionType(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="COMPOUNDED">Compounded with Payment</option>
                  <option value="CLOSED">Compliance Rectified / Closed</option>
                  <option value="DISMISSED">Dismissed after Officer Review</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Amount Collected (INR):</label>
                <input 
                  type="number" 
                  value={collectedAmount} 
                  onChange={(e) => setCollectedAmount(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 700, display: "block", marginBottom: "4px" }}>Final Settlement Remarks:</label>
                <textarea 
                  rows="3" 
                  value={officerNotes} 
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Record challan/receipt reference..."
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => setActiveModal(null)} className="btn-gov-secondary">Cancel</button>
                <button onClick={handleCloseCase} disabled={actionProcessing} className="btn-gov-primary" style={{ background: "#166534" }}>
                  {actionProcessing ? "Closing..." : "Finalize Closure"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CaseDetail;
