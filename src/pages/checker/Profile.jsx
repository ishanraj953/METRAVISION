import React from "react";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: "28px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
          Field Inspector Official Profile
        </h1>
        <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
          Authorized credentials and jurisdictional assignment under Legal Metrology Rules, 2011.
        </p>
      </div>

      {/* Profile Card */}
      <div style={{ background: "#ffffff", padding: "30px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "24px", marginBottom: "24px" }}>
          <div style={{ width: "70px", height: "70px", background: "#0c3b6b", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "bold" }}>
            👮‍♂️
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {user?.name || "CHECKER Officer (CHK-109)"}
            </h2>
            <p style={{ fontSize: "12.5px", color: "#0369a1", margin: "4px 0 0 0", fontWeight: 700 }}>
              Designation: Senior Legal Metrology Enforcement Inspector
            </p>
            <span style={{ display: "inline-block", marginTop: "8px", fontSize: "11px", background: "#f0fdf4", color: "#166534", padding: "3px 10px", borderRadius: "6px", fontWeight: 700 }}>
              Active Field Terminal • SECURE-AUTH-OK
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700 }}>BADGE / OFFICER ID</div>
            <div style={{ color: "#0f172a", fontWeight: 800, marginTop: "4px" }}>CHK-109-LM2026</div>
          </div>

          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700 }}>ASSIGNED JURISDICTION</div>
            <div style={{ color: "#0f172a", fontWeight: 800, marginTop: "4px" }}>Maharashtra - Mumbai (Andheri West Circle)</div>
          </div>

          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700 }}>ENFORCEMENT WING</div>
            <div style={{ color: "#0f172a", fontWeight: 800, marginTop: "4px" }}>Packaged Commodities Division, PCR 2011</div>
          </div>

          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700 }}>COMMUNICATION ENCRYPTION</div>
            <div style={{ color: "#0f172a", fontWeight: 800, marginTop: "4px" }}>AES-256 Secure Gov Protocol</div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;