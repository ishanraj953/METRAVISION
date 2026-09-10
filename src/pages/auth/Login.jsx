import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Scale
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import emblemImg from "../../assets/india.png";

const API_BASE = "http://127.0.0.1:8000";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState(location.state?.authMode || "LOGIN"); // 'LOGIN' or 'REGISTER'

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("checker@metrax.gov.in");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("CHECKER");
  const [regOrganization, setRegOrganization] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: loginEmail.trim(),
        password: loginPassword
      });

      if (res.data && res.data.access_token) {
        localStorage.setItem("metrax_token", res.data.access_token);
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data));
        
        if (login) {
          login(res.data, res.data.access_token);
        }

        // Direct to official enforcement command center
        navigate("/enforcement/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError(err.response?.data?.detail || "Authentication failed. Please verify your official credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    setRegLoading(true);

    if (!regFullName.trim()) {
      setRegError("Full name is required.");
      setRegLoading(false);
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setRegError("Please enter a valid official email address.");
      setRegLoading(false);
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters long.");
      setRegLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        full_name: regFullName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role: regRole
      });

      if (res.data && res.data.access_token) {
        setRegSuccess("Official account registered successfully! Redirecting...");
        localStorage.setItem("metrax_token", res.data.access_token);
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data));

        if (login) {
          login(res.data, res.data.access_token);
        }

        setTimeout(() => {
          navigate("/enforcement/dashboard", { replace: true });
        }, 800);
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setRegError(err.response?.data?.detail || "Failed to register official account. Email may already be in use.");
    } finally {
      setRegLoading(false);
    }
  };

  const setOneClickCredentials = (email, roleLabel) => {
    setLoginEmail(email);
    setLoginPassword("password123");
    setLoginError("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* 1. Indian National Tricolor Ribbon */}
      <div className="india-tricolor-bar" />

      {/* 2. Top Accessibility Strip */}
      <div className="gov-accessibility-strip">
        <div>भारत सरकार | GOVERNMENT OF INDIA • National Legal Metrology Gateway</div>
        <div>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} IST</div>
      </div>

      {/* 3. Header Banner */}
      <div className="gov-ministry-banner">
        <div onClick={() => navigate("/")} className="gov-emblem-title-group" style={{ cursor: "pointer" }}>
          <img src={emblemImg} alt="State Emblem of India" className="gov-emblem-img" />
          <div>
            <div className="gov-titles-hindi">उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय</div>
            <div className="gov-titles-english">Ministry of Consumer Affairs, Food & Public Distribution</div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#0c3b6b", marginTop: "2px" }}>
              METRAVISION : Official Authentication & Registration Portal
            </div>
          </div>
        </div>

        <Link to="/" style={{ fontSize: "12.5px", color: "#0c3b6b", fontWeight: 700, textDecoration: "none" }}>
          ← Back to Portal Home
        </Link>
      </div>

      {/* 4. Auth Container */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ maxWidth: "520px", width: "100%", background: "#ffffff", borderRadius: "10px", border: "1px solid #cbd5e1", boxShadow: "0 4px 16px rgba(0, 33, 71, 0.08)", overflow: "hidden" }}>
          
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
            <button
              onClick={() => { setActiveTab("LOGIN"); setLoginError(""); }}
              style={{
                flex: 1,
                padding: "14px 16px",
                border: "none",
                background: activeTab === "LOGIN" ? "#ffffff" : "transparent",
                color: activeTab === "LOGIN" ? "#0c3b6b" : "#64748b",
                fontWeight: 800,
                fontSize: "13.5px",
                cursor: "pointer",
                borderBottom: activeTab === "LOGIN" ? "3px solid #0c3b6b" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Official Sign In
            </button>
            <button
              onClick={() => { setActiveTab("REGISTER"); setRegError(""); setRegSuccess(""); }}
              style={{
                flex: 1,
                padding: "14px 16px",
                border: "none",
                background: activeTab === "REGISTER" ? "#ffffff" : "transparent",
                color: activeTab === "REGISTER" ? "#0c3b6b" : "#64748b",
                fontWeight: 800,
                fontSize: "13.5px",
                cursor: "pointer",
                borderBottom: activeTab === "REGISTER" ? "3px solid #0c3b6b" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Register Official Account
            </button>
          </div>

          <div style={{ padding: "24px 28px" }}>
            
            {/* ======================================================= */}
            {/* TAB 1: LOGIN FORM */}
            {/* ======================================================= */}
            {activeTab === "LOGIN" && (
              <div>
                <div style={{ textAlign: "center", marginBottom: "18px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    OFFICIAL ENFORCEMENT ACCESS
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0c3b6b", margin: "4px 0 0 0" }}>
                    Legal Metrology Officer Sign In
                  </h2>
                </div>

                {loginError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "10px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={15} /> {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Official Email / Badge ID:
                    </label>
                    <input 
                      type="text" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="checker@metrax.gov.in or CHK-109"
                      required
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Security PIN / Password:
                    </label>
                    <input 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loginLoading}
                    style={{
                      background: "#0c3b6b",
                      color: "#ffffff",
                      border: "none",
                      padding: "11px 16px",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 2px 6px rgba(12, 59, 107, 0.2)"
                    }}
                  >
                    {loginLoading ? "Authenticating Official..." : "SIGN IN TO PORTAL →"}
                  </button>
                </form>

                {/* 1-Click Demo Credentials */}
                <div style={{ marginTop: "22px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>
                    Quick Evaluation Credentials (1-Click Fill)
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setOneClickCredentials("checker@metrax.gov.in", "Inspector")}
                      style={{
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        color: "#065f46",
                        padding: "7px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>Field Officer (Checker / Inspector)</span>
                      <span style={{ fontSize: "11px", color: "#047857" }}>checker@metrax.gov.in</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOneClickCredentials("admin@metrax.gov.in", "Admin")}
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        color: "#1e40af",
                        padding: "7px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>Central Chief Controller (Admin)</span>
                      <span style={{ fontSize: "11px", color: "#1d4ed8" }}>admin@metrax.gov.in</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOneClickCredentials("shopkeeper@metrax.com", "Merchant")}
                      style={{
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        color: "#9a3412",
                        padding: "7px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>Commercial Entity / Registered Store</span>
                      <span style={{ fontSize: "11px", color: "#c2410c" }}>shopkeeper@metrax.com</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* TAB 2: REGISTER FORM */}
            {/* ======================================================= */}
            {activeTab === "REGISTER" && (
              <div>
                <div style={{ textAlign: "center", marginBottom: "18px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    NEW REGISTRATION
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0c3b6b", margin: "4px 0 0 0" }}>
                    Register Official / Commercial Account
                  </h2>
                </div>

                {regError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "10px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={15} /> {regError}
                  </div>
                )}

                {regSuccess && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={15} /> {regSuccess}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Full Name of Official / Officer:
                    </label>
                    <input 
                      type="text" 
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Inspector Rajesh Verma"
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Official Email Address:
                    </label>
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="r.verma@metravision.gov.in"
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Designation / Role:
                    </label>
                    <select 
                      value={regRole} 
                      onChange={(e) => setRegRole(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#ffffff" }}
                    >
                      <option value="CHECKER">Legal Metrology Inspector (Checker / Field Officer)</option>
                      <option value="ADMIN">Chief Controller / Regulatory Admin</option>
                      <option value="SHOPKEEPER">Commercial Entity / Store Representative</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Jurisdiction / Establishment Name (Optional):
                    </label>
                    <input 
                      type="text" 
                      value={regOrganization}
                      onChange={(e) => setRegOrganization(e.target.value)}
                      placeholder="e.g. Enforcement Directorate, Delhi Zone"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Set Security Password:
                    </label>
                    <input 
                      type="password" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={regLoading}
                    style={{
                      background: "#166534",
                      color: "#ffffff",
                      border: "none",
                      padding: "11px 16px",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    {regLoading ? "Registering..." : "CREATE OFFICIAL ACCOUNT →"}
                  </button>
                </form>
              </div>
            )}

          </div>

          <div style={{ background: "#f8fafc", padding: "10px 16px", borderTop: "1px solid #e2e8f0", fontSize: "11px", color: "#64748b", textAlign: "center" }}>
            Statutory Notice: Unauthorized access or tampering is punishable under Section 66 of IT Act & Legal Metrology Act, 2009.
          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <footer style={{ background: "#071f38", color: "#94a3b8", padding: "12px 24px", fontSize: "11.5px", textAlign: "center", borderTop: "1px solid #1e293b" }}>
        Legal Metrology Division • Ministry of Consumer Affairs, Food & Public Distribution • Government of India
      </footer>
    </div>
  );
};

export default Login;
