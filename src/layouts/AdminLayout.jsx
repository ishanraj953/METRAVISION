import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import emblemImage from "../assets/india.png";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const adminMenu = [
    { name: "Command Dashboard", path: "/admin/dashboard" },
    { name: "User Access & Roles", path: "/admin/users" },
    { name: "Registered Products", path: "/admin/products" },
    { name: "Compliance Overview", path: "/admin/compliance" },
    { name: "PCR Violations & Fines", path: "/admin/violations" },
    { name: "Manufacturer Registry", path: "/admin/manufacturers" },
    { name: "Rules & Regulations", path: "/admin/rules" },
    { name: "Field Inspections", path: "/admin/inspections" },
    { name: "Risk Intelligence", path: "/admin/risk" },
    { name: "Enforcement Reports", path: "/admin/reports" },
    { name: "System Audit Logs", path: "/admin/audit" },
    { name: "Portal Settings", path: "/admin/settings" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc", overflow: "hidden", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Injected CSS for Unique Admin Sidebar Hover & Glow Effects */}
      <style>{`
        .admin-nav-item {
          padding: 10px 20px;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          background: transparent;
          border-left: 4px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .admin-nav-item:hover {
          background: rgba(2, 132, 199, 0.15) !important;
          color: #ffffff !important;
          border-left: 4px solid #38bdf8 !important;
          text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
        }
        .admin-nav-active {
          background: rgba(2, 132, 199, 0.25) !important;
          color: #ffffff !important;
          border-left: 4px solid #38bdf8 !important;
          font-weight: 700 !important;
        }
        .terminate-btn {
          transition: all 0.2s ease-in-out;
        }
        .terminate-btn:hover {
          background: #991b1b !important;
          box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
          transform: translateY(-1px);
        }
      `}</style>

      {/* 🏛️ Official Government Top Header Bar */}
      <div style={{ background: "#0c3b6b", color: "#fff", padding: "6px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #1e40af", fontSize: "11.5px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={emblemImage} alt="National Emblem" style={{ width: "24px", height: "auto", borderRadius: "2px", background: "#fff", padding: "1px" }} />
          <span style={{ fontWeight: 800, letterSpacing: "0.5px" }}>भारत सरकार | GOVERNMENT OF INDIA</span>
          <span style={{ color: "#93c5fd", borderLeft: "1px solid #3b82f6", paddingLeft: "10px" }}>Ministry of Consumer Affairs, Food & Public Distribution</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ background: "#1e3a8a", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, color: "#60a5fa", border: "1px solid #3b82f6" }}>
            🔒 SECURE ADMIN TERMINAL (LEVEL-1)
          </span>
          <span style={{ color: "#cbd5e1" }}>📅 08 Sep 2026</span>
        </div>
      </div>

      {/* Main Body Layout with Sidebar */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Fixed Admin Sidebar */}
        <div style={{ width: "280px", background: "#0f172a", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, borderRight: "1px solid #334155" }}>
          
          {/* Portal Title Block */}
          <div style={{ padding: "16px 20px", background: "#090d16", borderBottom: "1px solid #1e293b" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#f8fafc", letterSpacing: "0.5px" }}>LEGAL METROLOGY WING</div>
            <div style={{ fontSize: "10.5px", color: "#38bdf8", marginTop: "2px", fontWeight: 600 }}>Central Enforcement & Regulation</div>
          </div>

          {/* Admin Profile Box */}
          <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #1e293b", background: "rgba(30, 41, 59, 0.5)" }}>
            <div style={{ width: "36px", height: "36px", background: "#0284c7", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px", border: "2px solid #38bdf8" }}>
              ADM
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Dr. Rajesh Sharma"}
              </div>
              <div style={{ fontSize: "10px", color: "#38bdf8" }}>Controller of Legal Metrology</div>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", padding: "0 20px 8px 20px", letterSpacing: "1px" }}>
              REGULATORY NAVIGATION
            </div>
            {adminMenu.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className={`admin-nav-item ${isActive ? "admin-nav-active" : ""}`}
                >
                  {item.name}
                </div>
              );
            })}
          </div>

          {/* Logout Footer */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid #1e293b", background: "#090d16" }}>
            <button
              onClick={() => logout()}
              className="terminate-btn"
              style={{ width: "100%", background: "#b91c1c", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
            >
              🔒 Terminate Admin Session
            </button>
          </div>

        </div>

        {/* Main Scrollable Content Area */}
        <div style={{ flex: 1, height: "calc(100vh - 35px)", overflowY: "auto", background: "#f1f5f9" }}>
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default AdminLayout;