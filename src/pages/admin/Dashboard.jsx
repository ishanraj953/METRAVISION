import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedViolation, setSelectedViolation] = useState(0);

  const [systemSettings, setSystemSettings] = useState({ autoCompounding: true, strictOcr: true, emailAlerts: true });
  const [userRoles, setUserRoles] = useState([
    { name: "Dr. Rajesh Sharma", role: "Controller (Level-1 Admin)", loginTime: "08 Sep 2026, 09:30 AM", status: "Active Now" },
    { name: "S. V. Rao", role: "Zonal Commissioner (Level-2)", loginTime: "08 Sep 2026, 10:15 AM", status: "Active" },
    { name: "K. N. Murthy", role: "Enforcement Head (Level-2)", loginTime: "07 Sep 2026, 04:00 PM", status: "Offline" }
  ]);

  const violationsList = [
    { id: "CMP-081", store: "Gupta Kirana & Daily Needs", product: "Sana Coconut Chips (140g)", fine: "₹ 25,000", status: "Critical", rule: "PCR Rule 6(1)(e) - MRP Missing", inspector: "R. Sharma (CHK-109)", summary: "Multi-angle panel scan verified dual-pricing discrepancy and absence of mandatory packer contact details." },
    { id: "CMP-082", store: "Sharma Supermarket", product: "Lotte Choco Pie Box", fine: "₹ 15,000", status: "Pending", rule: "PCR Rule 6(1)(c) - Net Quantity Error", inspector: "A. Verma (CHK-112)", summary: "Net weight variance exceeded maximum permissible error limits during gravimetric audit." },
    { id: "CMP-083", store: "Metro Retail Hub", product: "Imported Olive Oil (500ml)", fine: "₹ 40,000", status: "Escalated", rule: "PCR Rule 6(1)(h) - Importer Details Omitted", inspector: "K. Murthy (CHK-105)", summary: "Customs import label missing mandatory consumer care helpline and importer registration info." }
  ];

  const auditLogs = [
    { time: "08 Sep 2026, 11:20 AM", event: "Penalty Notice Issued for CMP-081", admin: user?.name || "Dr. Rajesh Sharma" },
    { time: "08 Sep 2026, 09:45 AM", event: "New Zonal Inspector Credential Generated", admin: "System Auto" },
    { time: "07 Sep 2026, 04:15 PM", event: "PCR 2011 Rule Compliance Threshold Updated", admin: user?.name || "Dr. Rajesh Sharma" }
  ];

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1600px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif", background: "#f8fafc", minHeight: "100%" }}>
      
      <style>{`
        .glossy-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          transition: all 0.3s ease;
        }
        .glossy-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -8px rgba(12, 59, 107, 0.1);
          border-color: #38bdf8;
        }
        .glossy-dark-card {
          background: linear-gradient(135deg, #0c3b6b 0%, #1e3a8a 100%);
          box-shadow: 0 12px 30px -8px rgba(12, 59, 107, 0.3);
        }
        .tab-btn {
          padding: 6px 18px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 11.5px;
          cursor: pointer;
          border: none;
          transition: all 0.25s;
        }
        .interactive-row:hover {
          background: rgba(255, 255, 255, 0.12) !important;
        }
        .pulse-live {
          width: 8px; height: 8px; background: #22c55e; border-radius: 50%;
          box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>

      {/* 🟢 CURRENT LOGGED-IN ADMIN SESSION PROFILE BANNER */}
      <div className="glossy-card" style={{ padding: "16px 24px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderLeft: "5px solid #0284c7" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", background: "#0c3b6b", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px", border: "2px solid #38bdf8" }}>
            ADM
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>{user?.name || "Dr. Rajesh Sharma"}</span>
              <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="pulse-live"></span> Active Session
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Designation: <strong>Controller of Legal Metrology (Level-1 Command Access)</strong> • Shift: Morning Command
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Secure Terminal IP</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0c3b6b" }}>10.184.22.90 (Encrypted VPN)</div>
        </div>
      </div>

      {/* Top Floating Glass Header with Integrated Sub-Tabs */}
      <div className="glossy-card" style={{ padding: "10px 20px", borderRadius: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #0c3b6b, #0284c7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "13px" }}>
            ⚡
          </div>
          <span style={{ fontSize: "13px", fontWeight: 900, color: "#0c3b6b" }}>Command Center Intelligence</span>
        </div>

        {/* Sub-Tabs */}
        <div style={{ display: "flex", background: "#e2e8f0", padding: "4px", borderRadius: "30px", gap: "3px" }}>
          <button onClick={() => setActiveTab("overview")} className="tab-btn" style={{ background: activeTab === "overview" ? "#0c3b6b" : "transparent", color: activeTab === "overview" ? "#fff" : "#475569" }}>Overview</button>
          <button onClick={() => setActiveTab("users")} className="tab-btn" style={{ background: activeTab === "users" ? "#0c3b6b" : "transparent", color: activeTab === "users" ? "#fff" : "#475569" }}>Admin Roster</button>
          <button onClick={() => setActiveTab("rules")} className="tab-btn" style={{ background: activeTab === "rules" ? "#0c3b6b" : "transparent", color: activeTab === "rules" ? "#fff" : "#475569" }}>PCR Rules</button>
          <button onClick={() => setActiveTab("audit")} className="tab-btn" style={{ background: activeTab === "audit" ? "#0c3b6b" : "transparent", color: activeTab === "audit" ? "#fff" : "#475569" }}>Audit Logs</button>
          <button onClick={() => setActiveTab("settings")} className="tab-btn" style={{ background: activeTab === "settings" ? "#0c3b6b" : "transparent", color: activeTab === "settings" ? "#fff" : "#475569" }}>Settings</button>
        </div>

        <div>
          <button 
            onClick={() => navigate("/admin/violations")}
            style={{ background: "linear-gradient(135deg, #0284c7, #0c3b6b)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "11px", cursor: "pointer", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)" }}
          >
            + New Notice
          </button>
        </div>
      </div>

      {/* CONDITIONAL TABS CONTENT */}
      {activeTab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginBottom: "24px" }}>
            <div className="glossy-card" style={{ padding: "20px", borderRadius: "16px", borderTop: "4px solid #0284c7" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Total Enforcement Cases</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a" }}>43 <span style={{ fontSize: "11.5px", color: "#16a34a" }}>↑ 12%</span></div>
            </div>
            <div className="glossy-card" style={{ padding: "20px", borderRadius: "16px", borderTop: "4px solid #16a34a" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Total Compounding Fines</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a" }}>₹ 1,275,000</div>
            </div>
            <div className="glossy-card" style={{ padding: "20px", borderRadius: "16px", borderTop: "4px solid #dc2626" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Critical PCR Violations</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#dc2626" }}>9</div>
            </div>
            <div className="glossy-card" style={{ padding: "20px", borderRadius: "16px", borderTop: "4px solid #d97706" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Active Field Inspectors</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a" }}>34 Officers</div>
            </div>
          </div>

          <div className="glossy-dark-card" style={{ padding: "24px", borderRadius: "20px", color: "#fff", display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, marginBottom: "14px", color: "#38bdf8" }}>⚡ Real-Time Escalation Feed</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {violationsList.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedViolation(idx)}
                    className="interactive-row"
                    style={{ background: selectedViolation === idx ? "rgba(56, 189, 248, 0.25)" : "rgba(30, 58, 138, 0.5)", border: selectedViolation === idx ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#fff" }}>{item.id} • {item.store}</div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1" }}>{item.product}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", fontWeight: 900, color: "#34d399" }}>{item.fine}</div>
                      <span style={{ fontSize: "9px", background: "#991b1b", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: "20px", borderRadius: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 900, color: "#fff" }}>#{violationsList[selectedViolation].id} • {violationsList[selectedViolation].store}</div>
                  <span style={{ background: "rgba(220, 38, 38, 0.25)", color: "#fca5a5", padding: "3px 8px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 800 }}>CRITICAL</span>
                </div>
                <div style={{ fontSize: "12px", color: "#e2e8f0", background: "rgba(12, 59, 107, 0.4)", padding: "12px", borderRadius: "10px", marginBottom: "12px" }}>
                  <strong>Rule Violated:</strong> {violationsList[selectedViolation].rule}
                </div>
                <div style={{ fontSize: "11.5px", color: "#cbd5e1", lineHeight: "1.5" }}>{violationsList[selectedViolation].summary}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: "11.5px" }}>Fine: <strong style={{ color: "#34d399" }}>{violationsList[selectedViolation].fine}</strong></span>
                <button onClick={() => alert("Judicial Notice Issued!")} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 800, fontSize: "11.5px", cursor: "pointer" }}>Issue Notice 🚀</button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="glossy-card" style={{ padding: "24px", borderRadius: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0c3b6b", marginBottom: "14px" }}>👥 Active Admin & Authority Roster</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Admin Name</th>
                <th style={{ padding: "10px" }}>Designation & Clearance</th>
                <th style={{ padding: "10px" }}>Login Timestamp</th>
                <th style={{ padding: "10px" }}>Session Status</th>
              </tr>
            </thead>
            <tbody>
              {userRoles.map((u, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px", fontWeight: 700, color: "#1e293b" }}>{u.name}</td>
                  <td style={{ padding: "10px", color: "#64748b" }}>{u.role}</td>
                  <td style={{ padding: "10px", color: "#475569" }}>{u.loginTime}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ background: u.status.includes("Active") ? "#dcfce7" : "#f1f5f9", color: u.status.includes("Active") ? "#166534" : "#64748b", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "rules" && (
        <div className="glossy-card" style={{ padding: "24px", borderRadius: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0c3b6b", marginBottom: "14px" }}>⚖️ PCR 2011 Rules Reference</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px", color: "#334155" }}>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}><strong>Rule 6(1)(e):</strong> Mandatory Retail Sale Price (MRP) declaration inclusive of all taxes.</div>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}><strong>Rule 6(1)(c):</strong> Net Quantity declaration in standard units of weight or measure.</div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="glossy-card" style={{ padding: "24px", borderRadius: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0c3b6b", marginBottom: "14px" }}>📋 System Audit Logs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {auditLogs.map((log, i) => (
              <div key={i} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>{log.event}</span>
                <span style={{ color: "#64748b" }}>{log.time} • <strong>{log.admin}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="glossy-card" style={{ padding: "24px", borderRadius: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0c3b6b", marginBottom: "14px" }}>⚙️ Portal Automation Settings</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px", color: "#1e293b" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={systemSettings.autoCompounding} onChange={() => setSystemSettings({...systemSettings, autoCompounding: !systemSettings.autoCompounding})} />
              Enable Automatic Judicial Compounding Fine Calculations
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={systemSettings.strictOcr} onChange={() => setSystemSettings({...systemSettings, strictOcr: !systemSettings.strictOcr})} />
              Enforce Strict AI OCR Label Matching on Field Scans
            </label>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;