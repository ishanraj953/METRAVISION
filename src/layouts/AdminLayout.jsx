import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import emblemImage from "../assets/india.png";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🚀 Clean & Minimalist Taskbar Menu (Merged extra items into Dashboard)
  const adminMenu = [
    { name: "Command Dashboard", path: "/admin/dashboard" },
    { name: "Products", path: "/admin/products" },
    { name: "Compliance", path: "/admin/compliance" },
    { name: "PCR Violations", path: "/admin/violations" },
    { name: "Manufacturers", path: "/admin/manufacturers" },
    { name: "Inspections", path: "/admin/inspections" },
    { name: "Risk Intel", path: "/admin/risk" },
    { name: "Reports", path: "/admin/reports" },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f1f5f9", overflow: "hidden", fontFamily: "Segoe UI, sans-serif" }}>
      
      <style>{`
        .glossy-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }
        .taskbar-pill {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #cbd5e1;
          background: transparent;
          border-radius: 30px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .taskbar-pill:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          transform: translateY(-1px);
        }
        .taskbar-pill-active {
          background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%) !important;
          color: #ffffff !important;
          font-weight: 800 !important;
          box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
        }
        .terminate-btn {
          transition: all 0.2s ease;
        }
        .terminate-btn:hover {
          background: #991b1b !important;
          box-shadow: 0 4px 15px rgba(185, 28, 28, 0.4);
        }
      `}</style>

      {/* 🏛️ Official Government Glossy Top Header Bar */}
      <div className="glossy-header" style={{ padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={emblemImage} alt="National Emblem" style={{ width: "26px", height: "auto" }} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#0c3b6b", letterSpacing: "0.5px" }}>
              भारत सरकार | GOVERNMENT OF INDIA
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
              Ministry of Consumer Affairs — Legal Metrology Command Wing
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#1e293b" }}>{user?.name || "Dr. Rajesh Sharma"}</div>
            <div style={{ fontSize: "9px", color: "#0284c7", fontWeight: 700 }}>SECURE ADMIN TERMINAL (LEVEL-1)</div>
          </div>
          <button
            onClick={() => logout()}
            className="terminate-btn"
            style={{ background: "#dc2626", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
          >
            🔒 Sign Out
          </button>
        </div>
      </div>

      {/* 🟦 Compact Glossy Rounded Central Taskbar */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #1e3a8a 100%)", padding: "10px 16px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 8px 20px -4px rgba(12, 59, 107, 0.3)", flexShrink: 0 }}>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", display: window.innerWidth < 1024 ? "flex" : "none", alignItems: "center", marginRight: "10px" }}
        >
          ☰ Menu
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", overflowX: "auto", gap: "4px", maxWidth: "1200px" }}>
          {adminMenu.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={idx}
                onClick={() => handleNavClick(item.path)}
                className={`taskbar-pill ${isActive ? "taskbar-pill-active" : ""}`}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{ position: "absolute", top: "105px", left: 0, width: "260px", height: "calc(100vh - 105px)", background: "#0f172a", color: "#fff", zIndex: 100, display: "flex", flexDirection: "column", boxShadow: "4px 0 20px rgba(0,0,0,0.5)" }}>
          <div style={{ padding: "12px 16px", background: "#090d16", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 900, color: "#38bdf8" }}>NAVIGATION</span>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: "transparent", color: "#fff", border: "none", fontSize: "14px", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {adminMenu.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={idx}
                  onClick={() => handleNavClick(item.path)}
                  style={{
                    padding: "10px 16px",
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#ffffff" : "#94a3b8",
                    background: isActive ? "rgba(56, 189, 248, 0.2)" : "transparent",
                    borderLeft: isActive ? "4px solid #38bdf8" : "4px solid transparent",
                    cursor: "pointer"
                  }}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, height: "calc(100vh - 105px)", overflowY: "auto", background: "#f8fafc", width: "100%" }}>
        <Outlet />
      </div>

    </div>
  );
};

export default AdminLayout;