import React, { useState } from "react";

const Settings = () => {
  const [settingsState, setSettingsState] = useState({
    maintenanceMode: false,
    autoAuditLogs: true,
    emailAlerts: true,
    strictRBAC: true,
  });

  const toggleSetting = (key) => {
    setSettingsState({ ...settingsState, [key]: !settingsState[key] });
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          ⚙️ Portal Configuration & Security Settings
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Manage global portal parameters, security controls, and automated compliance protocols.
        </p>
      </div>

      {/* Settings Panel */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden", padding: "24px" }}>
        
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
          System Operational Controls
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Toggle 1 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Strict Role-Based Access Control (RBAC)</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Enforce strict route-level guard rails across all administrative tiers.</div>
            </div>
            <button 
              onClick={() => toggleSetting("strictRBAC")}
              style={{ background: settingsState.strictRBAC ? "#166534" : "#cbd5e1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
            >
              {settingsState.strictRBAC ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Toggle 2 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Automated System Audit Trail</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Record all administrative database mutations into the encrypted ledger.</div>
            </div>
            <button 
              onClick={() => toggleSetting("autoAuditLogs")}
              style={{ background: settingsState.autoAuditLogs ? "#166534" : "#cbd5e1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
            >
              {settingsState.autoAuditLogs ? "Active" : "Inactive"}
            </button>
          </div>

          {/* Toggle 3 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Instant Email Alerts to Controllers</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Trigger automated emails upon critical PCR violation detections.</div>
            </div>
            <button 
              onClick={() => toggleSetting("emailAlerts")}
              style={{ background: settingsState.emailAlerts ? "#166534" : "#cbd5e1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
            >
              {settingsState.emailAlerts ? "Active" : "Inactive"}
            </button>
          </div>

          {/* Toggle 4 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#b91c1c" }}>Portal Maintenance Mode</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Temporarily lock non-admin user access for scheduled schema updates.</div>
            </div>
            <button 
              onClick={() => toggleSetting("maintenanceMode")}
              style={{ background: settingsState.maintenanceMode ? "#b91c1c" : "#166534", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
            >
              {settingsState.maintenanceMode ? "Deactivate Maintenance" : "Activate Maintenance"}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;