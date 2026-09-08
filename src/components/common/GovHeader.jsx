import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GovHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true }); // Seedhe Main Homepage par bhejega
  };

  return (
    <header>
      <div className="top-accessibility-strip">
        <div className="top-strip-links">
          <span>🏛 GOVT OF INDIA</span>
          <span>Screen Reader Access</span>
        </div>
        <div className="top-strip-links font-resizer">
          <span className="font-box">A-</span>
          <span className="font-box">A</span>
          <span className="font-box">A+</span>
          <span className="contrast-box">A</span>
          <span style={{ fontWeight: "bold" }}>हिन्दी</span>
        </div>
      </div>

      <div className="ministry-header">
        <div className="emblem-brand-group" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="emblem-symbol">⚖️</div>
          <div className="brand-titles">
            <h2>उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय</h2>
            <h4>Legal Metrology & Standards Compliance Portal</h4>
          </div>
        </div>

        <button 
          className="mobile-header-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      <div className="nav-capsule-wrapper">
        <nav className="floating-nav">
          <ul className={`nav-menu-list ${mobileMenuOpen ? "mobile-active" : ""}`}>
            <li><Link to="/">Home</Link></li>
            <li><span>Regulations & Rules ▾</span></li>
            <li><span>Compliance Checks ▾</span></li>
            <li><span>Inspection Directory ▾</span></li>
            <li><span>Helpdesk</span></li>
          </ul>

          <div>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{user.name}</span>
                <button
                  className="login-nav-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="login-nav-btn" 
                onClick={() => navigate("/")}
              >
                ➔| Home / Login
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default GovHeader;