import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Bell, 
  Menu, 
  X, 
  ShieldAlert, 
  FileText, 
  Building2, 
  Sliders, 
  CheckCircle2, 
  LogOut,
  LayoutDashboard,
  Camera,
  FolderOpen
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import emblemImg from "../../assets/india.png";

const API_BASE = "http://127.0.0.1:8000";

const GovHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE}/notifications/unread-count`, { headers }).catch(() => null);
        if (res && res.data) {
          setUnreadCount(res.data.unread_count || 0);
        }
      } catch (err) {}
    };
    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navLinks = [
    { name: "Command Center", path: "/enforcement/dashboard", icon: <LayoutDashboard size={14} /> },
    { name: "New Inspection", path: "/enforcement/inspect", icon: <Camera size={14} /> },
    { name: "Enforcement Cases", path: "/enforcement/cases", icon: <FileText size={14} /> },
    { name: "Responsible Parties", path: "/enforcement/responsible-parties", icon: <Building2 size={14} /> },
    { name: "Evidence Dossiers", path: "/checker/evidence", icon: <FolderOpen size={14} /> },
    { name: "PCR 2011 Rules", path: "/admin/rules", icon: <Sliders size={14} /> },
  ];

  return (
    <header style={{ width: "100%", zIndex: 1000, position: "relative" }}>
      {/* 1. Indian National Tricolor Ribbon */}
      <div className="india-tricolor-bar" />

      {/* 2. Top Accessibility & National Links Strip */}
      <div className="gov-accessibility-strip">
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <span>भारत सरकार | Government of India</span>
          <span style={{ color: "#94a3b8" }}>•</span>
          <span>National Legal Metrology Portal</span>
          <span style={{ color: "#94a3b8" }}>•</span>
          <span>PCR 2011 & Legal Metrology Act, 2009</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ cursor: "pointer", fontWeight: 700 }}>हिन्दी</span>
          <span>|</span>
          <span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} IST</span>
        </div>
      </div>

      {/* 3. National Ministry & Directorate Banner */}
      <div className="gov-ministry-banner">
        <div 
          onClick={() => navigate("/enforcement/dashboard")} 
          className="gov-emblem-title-group"
          style={{ cursor: "pointer" }}
        >
          <img 
            src={emblemImg} 
            alt="State Emblem of India" 
            className="gov-emblem-img"
          />
          <div>
            <div className="gov-titles-hindi">
              उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय
            </div>
            <div className="gov-titles-english">
              Ministry of Consumer Affairs, Food & Public Distribution • Legal Metrology Division
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#0c3b6b", marginTop: "2px" }}>
              METRAVISION : Legal Metrology Compliance & Enforcement Platform
            </div>
          </div>
        </div>

        {/* Right Section: Notification & User Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Notification Bell with Badge */}
              <Link 
                to="/enforcement/notifications" 
                style={{ position: "relative", background: "#f1f5f9", padding: "8px", borderRadius: "50%", color: "#0c3b6b", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Officer Alerts & Deadlines"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: "-2px", right: "-2px", background: "#dc2626", color: "#ffffff", fontSize: "10px", fontWeight: 800, width: "17px", height: "17px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Identity */}
              <div style={{ textAlign: "right" }} className="hidden sm:block">
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                  {user.full_name || "Enforcement Inspector"}
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "flex-end", marginTop: "2px" }}>
                  <span className="gov-portal-badge">
                    {user.role === "ADMIN" ? "CHIEF CONTROLLER (ADMIN)" : "LEGAL METROLOGY OFFICER"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "11.5px", fontWeight: 700, padding: "5px 10px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="btn-gov-primary"
            >
              Official Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "none" }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} color="#0c3b6b" /> : <Menu size={24} color="#0c3b6b" />}
          </button>
        </div>
      </div>

      {/* 4. Streamlined Enforcement Navigation Bar */}
      <nav className="gov-navbar">
        <ul className="gov-nav-links">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/enforcement/dashboard" && location.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link to={item.path} className={`gov-nav-link ${isActive ? "active" : ""}`}>
                  {item.icon} {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ fontSize: "11px", color: "#93c5fd", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
          <CheckCircle2 size={12} color="#86efac" /> NIC Gov Gateway Active
        </div>
      </nav>
    </header>
  );
};

export default GovHeader;
