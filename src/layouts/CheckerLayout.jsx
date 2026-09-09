import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import emblemImage from "../assets/india.png";

const CheckerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const checkerMenu = [
    { name: "Dashboard", path: "/checker/dashboard" },
    { name: "Inspections", path: "/checker/inspections" },
    { name: "Scan Package", path: "/checker/scan" },
    { name: "Products", path: "/checker/products" },
    { name: "Compliance Results", path: "/checker/results" },
    { name: "Violations", path: "/checker/violations" },
    { name: "Evidence Review", path: "/checker/evidence" },
    { name: "Risk Intelligence", path: "/checker/risk" },
    { name: "Repeat Offenders", path: "/checker/offenders" },
    { name: "Inspection Priority", path: "/checker/priority" },
    { name: "Reports", path: "/checker/reports" },
    { name: "Profile", path: "/checker/profile" },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false); // Close mobile drawer on navigation
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc", overflow: "hidden" }}>
      
      {/* Injected CSS for Smooth Hover Effects & Responsive Design */}
      <style>{`
        .checker-nav-item {
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
          background: transparent;
          border-left: 4px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .checker-nav-item:hover {
          background: rgba(96, 165, 250, 0.12) !important;
          color: #ffffff !important;
          border-left: 4px solid #93c5fd !important;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
        }
        .checker-nav-active {
          background: rgba(255, 255, 255, 0.12) !important;
          color: #ffffff !important;
          border-left: 4px solid #60a5fa !important;
          font-weight: 700 !important;
        }
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
          .desktop-sidebar { display: flex !important; }
        }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>

      {/* Top Mobile/Header Bar */}
      <div style={{ background: "#0c3b6b", color: "#fff", padding: "8px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #1e40af", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "#1e3a8a", color: "#fff", border: "1px solid #60a5fa", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center" }}
          >
            ☰ Menu
          </button>
          <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.5px" }}>FIELD INSPECTOR CONSOLE</span>
        </div>
        <div style={{ fontSize: "11px", color: "#93c5fd", fontWeight: 600 }}>
          CHK-109 • Active
        </div>
      </div>

      {/* Main Body Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        
        {/* Fixed Desktop Sidebar */}
        <div className="desktop-sidebar" style={{ width: "270px", background: "#0c3b6b", color: "#fff", flexDirection: "column", flexShrink: 0, boxShadow: "4px 0 10px rgba(0,0,0,0.1)" }}>
          
          {/* Portal Branding */}
          <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "14px", fontWeight: 900, letterSpacing: "0.5px" }}>FIELD INSPECTOR CONSOLE</div>
            <div style={{ fontSize: "10px", color: "#93c5fd", marginTop: "2px" }}>Inspection, Verification & Enforcement</div>
          </div>

          {/* Clickable Circular Profile Widget */}
          <div 
            onClick={() => navigate("/checker/profile")}
            title="Click to view Official Inspector Profile"
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              background: location.pathname === "/checker/profile" ? "rgba(255, 255, 255, 0.15)" : "transparent",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            <div style={{ position: "relative" }}>
              <img 
                src={emblemImage} 
                alt="Inspector Avatar" 
                style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid #60a5fa" }} 
              />
              <span style={{ position: "absolute", bottom: "0", right: "0", width: "10px", height: "10px", background: "#22c55e", borderRadius: "50%", border: "2px solid #0c3b6b" }}></span>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12.5px", fontWeight: "bold", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "CHECKER Officer"}
              </div>
              <div style={{ fontSize: "10.5px", color: "#93c5fd" }}>CHK-109 • Active</div>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#93c5fd", padding: "0 20px 8px 20px", letterSpacing: "1px" }}>
              CHECKER NAVIGATION
            </div>
            {checkerMenu.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className={`checker-nav-item ${isActive ? "checker-nav-active" : ""}`}
                >
                  {item.name}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer Logout */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              onClick={() => logout()}
              style={{ width: "100%", background: "#dc2626", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              Sign Out Securely
            </button>
          </div>

        </div>

        {/* Mobile Slide-out Drawer */}
        {mobileOpen && (
          <div style={{ position: "absolute", top: 0, left: 0, width: "270px", height: "100%", background: "#0c3b6b", color: "#fff", zIndex: 100, display: "flex", flexDirection: "column", boxShadow: "4px 0 15px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 900, color: "#93c5fd" }}>INSPECTOR MENU</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: "transparent", color: "#fff", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
              {checkerMenu.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <div
                    key={idx}
                    onClick={() => handleNavClick(item.path)}
                    className={`checker-nav-item ${isActive ? "checker-nav-active" : ""}`}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => logout()}
                style={{ width: "100%", background: "#dc2626", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                Sign Out Securely
              </button>
            </div>
          </div>
        )}

        {/* Independent Scrollable Main Content Area */}
        <div style={{ flex: 1, height: "100%", overflowY: "auto", background: "#f8fafc" }}>
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default CheckerLayout;