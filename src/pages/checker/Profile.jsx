import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Full Name cannot be empty.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError("Current password is required to set a new password.");
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("New passwords do not match.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = { full_name: fullName.trim() };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      await updateProfile(payload);
      setMessage("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile. Please check current password.");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN": return "Chief Controller & National Administrator";
      case "CHECKER": return "Legal Metrology Enforcement Inspector";
      case "SHOPKEEPER": return "Registered Merchant & Retail Commodity Owner";
      default: return "Authorized Government Official";
    }
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
          Official User Profile & Authority Credentials
        </h1>
        <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
          Authorized credentials, role privileges, and security settings under Legal Metrology Rules, 2011.
        </p>
      </div>

      {/* Profile Card */}
      <div style={{ background: "#ffffff", padding: "30px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", marginBottom: "24px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "24px", marginBottom: "24px" }}>
          <div style={{ width: "70px", height: "70px", background: "#0c3b6b", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold" }}>
            {user?.role || "OFFICIAL"}
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {user?.full_name || user?.name || "Official User"}
            </h2>
            <p style={{ fontSize: "12.5px", color: "#0369a1", margin: "4px 0 0 0", fontWeight: 700 }}>
              {getRoleLabel(user?.role)}
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "11px", background: "#f0fdf4", color: "#166534", padding: "3px 10px", borderRadius: "6px", fontWeight: 700, border: "1px solid #bbf7d0" }}>
                Status: Active Official Terminal [Verified]
              </span>
              <span style={{ fontSize: "11px", background: "#eff6ff", color: "#1e40af", padding: "3px 10px", borderRadius: "6px", fontWeight: 700, border: "1px solid #bfdbfe" }}>
                Role: {user?.role || "USER"}
              </span>
            </div>
          </div>
        </div>

        {/* Real Live User Attributes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700 }}>OFFICIAL EMAIL ADDRESS</div>
            <div style={{ color: "#0f172a", fontWeight: 800, marginTop: "4px" }}>{user?.email || "N/A"}</div>
          </div>

          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700 }}>SYSTEM IDENTIFIER (USER ID)</div>
            <div style={{ color: "#0f172a", fontWeight: 800, marginTop: "4px" }}>METRA-UID-{user?.id || "001"}</div>
          </div>

          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700 }}>STATUTORY JURISDICTION</div>
            <div style={{ color: "#0f172a", fontWeight: 800, marginTop: "4px" }}>Legal Metrology Packaged Commodities Rules 2011</div>
          </div>

          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700 }}>AUTHENTICATION PROTOCOL</div>
            <div style={{ color: "#0f172a", fontWeight: 800, marginTop: "4px" }}>PBKDF2-HMAC-SHA256 • JWT Bearer Token</div>
          </div>
        </div>

      </div>

      {/* Profile & Security Management Form */}
      <div style={{ background: "#ffffff", padding: "28px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0c3b6b", margin: "0 0 16px 0" }}>
          Update Profile & Credentials
        </h3>

        {message && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 700, marginBottom: "16px" }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px 14px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 700, marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "6px", textTransform: "uppercase" }}>
              Full Name / Business Establishment Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
              required
            />
          </div>

          <div style={{ borderTop: "1px dashed #e2e8f0", margin: "20px 0", paddingTop: "16px" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#475569", marginBottom: "12px" }}>
              Change Security PIN / Password (Optional)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none" }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              background: isSaving ? "#64748b" : "#0c3b6b",
              color: "#ffffff",
              border: "none",
              padding: "11px 24px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: isSaving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 10px rgba(12, 59, 107, 0.2)"
            }}
          >
            {isSaving ? "SAVING CHANGES..." : "Save Profile & Credentials"}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Profile;
