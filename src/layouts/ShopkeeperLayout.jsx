import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import emblemImage from "../assets/india.png";

const ShopkeeperLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const shopkeeperMenu = [
    { name: "Dashboard", path: "/shopkeeper/dashboard" },
    { name: "My Products", path: "/shopkeeper/products" },
    { name: "Add Product", path: "/shopkeeper/add-product" },
    { name: "Scan Package", path: "/shopkeeper/scan" },
    { name: "Compliance Status", path: "/shopkeeper/compliance" },
    { name: "Violations", path: "/shopkeeper/violations" },
    { name: "Online Listing", path: "/shopkeeper/online-listing" },
    { name: "Compliance History", path: "/shopkeeper/history" },
    { name: "Reports", path: "/shopkeeper/reports" },
    { name: "Help", path: "/shopkeeper/help" },
    { name: "Profile", path: "/shopkeeper/profile" },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false); // Close drawer on navigation
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc", overflow: "hidden", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Injected CSS for Unique Shopkeeper Sidebar Hover & Glow Effects & Mobile Responsiveness */}
      <style>{`
        .shopkeeper-nav-item {
          padding: 10px 20px;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          background: transparent;
          border-left: 4px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .shopkeeper-nav-item:hover {
          background: rgba(2, 132, 199, 0.15) !important;
          color: #ffffff !important;
          border-left: 4px solid #38bdf8 !important;
          text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
        }
        .shopkeeper-nav-active {
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
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
          .desktop-sidebar { display: flex !important; }
        }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>

      {/* 🏛️ Official Government Top Header Bar */}
      <div style={{ background: "#0c3b6b", color: "#fff", padding: "6px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #1e40af", fontSize: "11.5px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "#1e3a8a", color: "#fff", border: "1px solid #3b82f6", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center" }}
          >
            ☰ Menu
          </button>
          <img src={emblemImage} alt="National Emblem" style={{ width: "24px", height: "auto", borderRadius: "2px", background: "#fff", padding: "1px" }} />
          <span style={{ fontWeight: 800, letterSpacing: "0.5px" }}>भारत सरकार | GOVERNMENT OF INDIA</span>
          <span style={{ color: "#93c5fd", borderLeft: "1px solid #3b82f6", paddingLeft: "10px", display: window.innerWidth > 768 ? "inline" : "none" }}>Ministry of Consumer Affairs, Food & Public Distribution</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ background: "#1e3a8a", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, color: "#60a5fa", border: "1px solid #3b82f6" }}>
            🔒 SECURE RETAIL TERMINAL (LEVEL-3)
          </span>
          <span style={{ color: "#cbd5e1" }}>📅 08 Sep 2026</span>
        </div>
      </div>

      {/* Main Body Layout with Sidebar & Mobile Drawer */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        
        {/* Fixed Desktop Shopkeeper Sidebar */}
        <div className="desktop-sidebar" style={{ width: "280px", background: "#0f172a", color: "#fff", flexDirection: "column", flexShrink: 0, borderRight: "1px solid #334155" }}>
          
          {/* Portal Title Block */}
          <div style={{ padding: "16px 20px", background: "#090d16", borderBottom: "1px solid #1e293b" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#f8fafc", letterSpacing: "0.5px" }}>RETAIL COMPLIANCE WING</div>
            <div style={{ fontSize: "10.5px", color: "#38bdf8", marginTop: "2px", fontWeight: 600 }}>Packaged Commodities Portal</div>
          </div>

          {/* Shopkeeper Profile Box */}
          <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #1e293b", background: "rgba(30, 41, 59, 0.5)" }}>
            <div style={{ width: "36px", height: "36px", background: "#0284c7", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px", border: "2px solid #38bdf8" }}>
              SHP
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Gupta Kirana & Daily Needs"}
              </div>
              <div style={{ fontSize: "10px", color: "#38bdf8" }}>Authorized Retailer</div>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", padding: "0 20px 8px 20px", letterSpacing: "1px" }}>
              BUSINESS NAVIGATION
            </div>
            {shopkeeperMenu.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className={`shopkeeper-nav-item ${isActive ? "shopkeeper-nav-active" : ""}`}
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
              🔒 Terminate Retail Session
            </button>
          </div>

        </div>

        {/* Mobile Slide-out Drawer */}
        {mobileOpen && (
          <div style={{ position: "absolute", top: 0, left: 0, width: "280px", height: "100%", background: "#0f172a", color: "#fff", zIndex: 100, display: "flex", flexDirection: "column", boxShadow: "4px 0 15px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "14px 20px", background: "#090d16", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
              <span style={{ fontSize: "12px", fontWeight: 900, color: "#38bdf8" }}>RETAIL NAVIGATION</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: "transparent", color: "#fff", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
              {shopkeeperMenu.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <div
                    key={idx}
                    onClick={() => handleNavClick(item.path)}
                    className={`shopkeeper-nav-item ${isActive ? "shopkeeper-nav-active" : ""}`}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid #1e293b", background: "#090d16" }}>
              <button
                onClick={() => logout()}
                style={{ width: "100%", background: "#b91c1c", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
              >
                🔒 Terminate Session
              </button>
            </div>
          </div>
        )}

        {/* Main Scrollable Content Area */}
        <div style={{ flex: 1, height: "100%", overflowY: "auto", background: "#f1f5f9" }}>
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default ShopkeeperLayout;