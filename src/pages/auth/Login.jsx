import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const translations = {
  en: {
    govIndia: "भारत सरकार | GOVT. OF INDIA",
    division: "Legal Metrology Division",
    screenReader: "Screen Reader",
    ministryHindi: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    ministryEng: "Ministry of Consumer Affairs, Food & Public Distribution",
    searchPlaceholder: "Search Acts, Rules, Orders...",
    searchBtn: "Search",
    home: "Home",
    aboutUs: "About Us",
    aboutItems: [
      { id: "setup", label: "Organizational Setup", desc: "Hierarchy, official administrative wings and directorates under the Ministry." },
      { id: "charter", label: "Charter of Services", desc: "Citizen charter, service timelines, and statutory commitment metrics." },
      { id: "gazette", label: "Gazette Notifications", desc: "Latest regulatory gazette orders, statutory amendments and notifications." }
    ],
    acts: "Compliance Acts",
    actItems: [
      { id: "act2009", label: "Legal Metrology Act 2009", desc: "Core legislative framework governing metric enforcement, trade standards and weights." },
      { id: "pcr", label: "Packaged Commodities Rules", desc: "Mandatory declaration guidelines: MRP, net quantity, batch details and manufacturer address." },
      { id: "standards", label: "National Standards Rules", desc: "Calibration tolerances, primary laboratory benchmarks and verification cycles." }
    ],
    enforcement: "Field Enforcement",
    enforcementItems: [
      { id: "protocols", label: "Inspection Protocols", desc: "Field officer standard operating procedures (SOP), spot verifications and checks." },
      { id: "seizure", label: "Seizure Guidelines", desc: "Legal seizure procedures, non-compliant packaging confiscation and memo generation." },
      { id: "schedule", label: "Verification Schedule", desc: "State-wide mandatory stamped instrument re-verification cycles." }
    ],
    reports: "Reports & Matrix",
    helpdesk: "Helpdesk",
    loginBtn: "→| Login",
    roles: {
      ADMIN: { label: "Admin Login", title: "Central Admin Portal", badge: "ADM-902" },
      SHOPKEEPER: { label: "Shopkeeper Login", title: "Merchant & Store Self-Audit", badge: "SHP-401" },
      CHECKER: { label: "Checker Login", title: "Field Enforcement & Inspection", badge: "CHK-109" }
    },
    warningNotice: "🔒 NOTICE: Unauthorized access, manipulation or inspection forgery is penal under Section 66 of IT Act.",
    accessPortal: "Official Access Portal",
    selectSubtitle: "Authenticate to enter designated regulatory system",
    idLabel: "Official Registration ID",
    pinLabel: "Security PIN / Password",
    submitBtn: "SIGN IN AS",
    modalClose: "Close Window"
  },
  hi: {
    govIndia: "भारत सरकार | GOVT. OF INDIA",
    division: "विधिक मापविज्ञान प्रभाग",
    screenReader: "स्क्रीन रीडर",
    ministryHindi: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    ministryEng: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    searchPlaceholder: "अधिनियम, नियम और आदेश खोजें...",
    searchBtn: "खोजें",
    home: "होम",
    aboutUs: "हमारे बारे में",
    aboutItems: [
      { id: "setup", label: "संगठनात्मक संरचना", desc: "मंत्रालय के अंतर्गत प्रशासनिक विंग, पदानुक्रम और क्षेत्रीय निदेशालय।" },
      { id: "charter", label: "नागरिक चार्टर", desc: "सेवा समय-सीमा, वैधानिक उत्तरदायित्व और नागरिक चार्टर विनिर्देश।" },
      { id: "gazette", label: "राजपत्र अधिसूचनाएं", desc: "नवीनतम राजपत्र आदेश, वैधानिक संशोधन और प्रवर्तन सूचनाएं।" }
    ],
    acts: "अनुपालन अधिनियम",
    actItems: [
      { id: "act2009", label: "विधिक मापविज्ञान अधिनियम 2009", desc: "माप, भार और विधिक मानकों को नियंत्रित करने वाला मुख्य अधिनियम।" },
      { id: "pcr", label: "पैकेज्ड कमोडिटीज नियम", desc: "एमआरपी, शुद्ध मात्रा, निर्माण तिथि और आयातक घोषणा के अनिवार्य नियम।" },
      { id: "standards", label: "राष्ट्रीय मानक नियम", desc: "मानक अंशांकन सीमाएं, प्राथमिक प्रयोगशाला मानक और सत्यापन चक्र।" }
    ],
    enforcement: "क्षेत्रीय प्रवर्तन",
    enforcementItems: [
      { id: "protocols", label: "निरीक्षण नियमावली", desc: "फील्ड चेकरों के लिए मानक संचालन प्रक्रियाएं (एसओपी) और स्थल निरीक्षण।" },
      { id: "seizure", label: "जब्ती दिशानिर्देश", desc: "अमानक पैकेटों को जब्त करने और जब्ती मेमो तैयार करने के कानूनी नियम।" },
      { id: "schedule", label: "सत्यापन अनुसूची", desc: "राज्य-स्तरीय उपकरणों और मुहरों की समयबद्ध पुनः सत्यापन अनुसूची।" }
    ],
    reports: "रिपोर्ट्स और मैट्रिक्स",
    helpdesk: "सहायता केंद्र",
    loginBtn: "→| लॉगिन",
    roles: {
      ADMIN: { label: "एडमिन लॉगिन", title: "केंद्रीय व्यवस्थापक पोर्टल", badge: "ADM-902" },
      SHOPKEEPER: { label: "दुकानदार लॉगिन", title: "दुकान एवं इन्वेंट्री सत्यापन", badge: "SHP-401" },
      CHECKER: { label: "निरीक्षक लॉगिन", title: "क्षेत्रीय प्रवर्तन एवं जांच", badge: "CHK-109" }
    },
    warningNotice: "🔒 सूचना: अनधिकृत पहुंच, रिकॉर्ड में फेरबदल आईटी अधिनियम की धारा 66 के तहत दंडनीय है।",
    accessPortal: "आधिकारिक प्रवेश पोर्टल",
    selectSubtitle: "निर्धारित नियामक प्रणाली में प्रवेश हेतु प्रमाणित करें",
    idLabel: "आधिकारिक पंजीकरण आईडी",
    pinLabel: "सुरक्षा पिन / पासवर्ड",
    submitBtn: "लॉग इन करें बतौर",
    modalClose: "बंद करें"
  },
  te: {
    govIndia: "భారత ప్రభుత్వం | GOVT. OF INDIA",
    division: "లీగల్ మెట్రాలజీ విభాగం",
    screenReader: "స్క్రీన్ రీడర్",
    ministryHindi: "వినియోగదారుల వ్యవహారాల మంత్రిత్వ శాఖ",
    ministryEng: "Ministry of Consumer Affairs, Food & Public Distribution",
    searchPlaceholder: "చట్టాలు, నిబంధనలు శోధించండి...",
    searchBtn: "శోధించండి",
    home: "హోమ్",
    aboutUs: "మా గురించి",
    aboutItems: [
      { id: "setup", label: "సంస్థాగత నిర్మాణం", desc: "మంత్రిత్వ శాఖ పరిధిలోని అధికారిక విభాగాలు మరియు వ్యవస్థాపక నిర్మాణం." },
      { id: "charter", label: "సేవా పత్రం", desc: "పౌర సేవా పత్రం, సేవల కాలపరిమితి మరియు అధికారిక నిబంధనలు." },
      { id: "gazette", label: "గెజిట్ నోటిఫికేషన్లు", desc: "తాజా నియంత్రణ ఆదేశాలు, గెజిట్ సవరణలు మరియు నోటిఫికేషన్లు." }
    ],
    acts: "నిబంధనల చట్టాలు",
    actItems: [
      { id: "act2009", label: "లీగల్ మెట్రాలజీ చట్టం 2009", desc: "కొలతలు, తూకాలు మరియు ప్రమాణాల నియంత్రణ ప్రధాన చట్టం." },
      { id: "pcr", label: "ప్యాకేజ్డ్ కమోడిటీస్ రూల్స్", desc: "MRP, పరిమాణం, తయారీ వివరాలు మరియు ప్యాకేజింగ్ నిబంధనలు." },
      { id: "standards", label: "జాతీయ ప్రమాణాలు", desc: "క్యాలిబ్రేషన్ నియమాలు మరియు లేబొరేటరీ ప్రమాణాల ధృవీకరణ." }
    ],
    enforcement: "క్షేత్ర తనిఖీలు",
    enforcementItems: [
      { id: "protocols", label: "తనిఖీ నిబంధనలు", desc: "క్షేత్ర తనిఖీ అధికారుల కార్యాచరణ విధానాలు (SOP) మరియు తనిఖీ మార్గదర్శకాలు." },
      { id: "seizure", label: "సీజ్ మార్గదర్శకాలు", desc: "నిబంధనలు పాటించని వస్తువుల సీజింగ్ మరియు మెమో నమోదు విధానం." },
      { id: "schedule", label: "ధృవీకరణ షెడ్యూల్", desc: "తూనికలు మరియు కొలతల సాధనాల ఆవర్తన పునఃపరిశీలన షెడ్యూల్." }
    ],
    reports: "నివేదికలు & గణాంకాలు",
    helpdesk: "సహాయ కేంద్రం",
    loginBtn: "→| లాగిన్",
    roles: {
      ADMIN: { label: "అడ్మిన్ లాగిన్", title: "కేంద్ర పరిపాలన పోర్టల్", badge: "ADM-902" },
      SHOPKEEPER: { label: "షాప్‌కీపర్ లాగిన్", title: "దుకాణం & నిబంధనల సమీక్ష", badge: "SHP-401" },
      CHECKER: { label: "తనిఖీ అధికారి లాగిన్", title: "ఫీల్డ్ ఎన్‌ఫోర్స్‌మెంట్ తనిఖీ", badge: "CHK-109" }
    },
    warningNotice: "🔒 హెచ్చరిక: అనధికారిక ప్రవేశం లేదా రికార్డుల మార్పు ఐటీ చట్టం సెక్షన్ 66 కింద నేరం.",
    accessPortal: "అధికారిక ప్రవేశ పోర్టల్",
    selectSubtitle: "ప్రవేశించడానికి అధికారాన్ని ధృవీకరించండి",
    idLabel: "అధికారిక ఐడీ",
    pinLabel: "సెక్యూరిటీ పిన్",
    submitBtn: "లాగిన్ అవ్వండి -",
    modalClose: "మూసివేయి"
  }
};

const Login = () => {
  const [lang, setLang] = useState("en");
  const [fontScale, setFontScale] = useState(1);
  const [modalContent, setModalContent] = useState(null);

  const [activeMenu, setActiveMenu] = useState(null);
  const [isLoginHovered, setIsLoginHovered] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = translations[lang];

  // Check if routed from Home with specific role state
  const incomingRole = location.state?.defaultRole || "ADMIN";
  const [selectedRole, setSelectedRole] = useState(incomingRole);
  const [credentials, setCredentials] = useState({
    id: t.roles[incomingRole] ? t.roles[incomingRole].badge : "ADM-902",
    password: "password123"
  });

  useEffect(() => {
    if (location.state?.defaultRole && t.roles[location.state.defaultRole]) {
      const targetRole = location.state.defaultRole;
      setSelectedRole(targetRole);
      setCredentials({
        id: t.roles[targetRole].badge,
        password: "password123"
      });
    }
  }, [location.state, lang]);

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    setCredentials({
      id: t.roles[roleKey].badge,
      password: "password123"
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login({
      token: "gov-token-" + Date.now(),
      role: selectedRole,
      name: `${selectedRole} Officer (${credentials.id})`,
    });

    if (selectedRole === "ADMIN") navigate("/admin/dashboard");
    if (selectedRole === "SHOPKEEPER") navigate("/shopkeeper/dashboard");
    if (selectedRole === "CHECKER") navigate("/checker/dashboard");
  };

  const openInfoModal = (title, body) => {
    setActiveMenu(null);
    setModalContent({ title, body });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f0f4f8", fontFamily: "Segoe UI, Arial, sans-serif", fontSize: `${14 * fontScale}px` }}>
      
      {/* 1. Top Accessibility Strip */}
      <div style={{ background: "#0b427b", color: "#ffffff", padding: "6px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", fontWeight: 600 }}>
          <span>🏛️ {t.govIndia}</span>
          <span style={{ opacity: 0.8 }}>{t.division}</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ cursor: "pointer", opacity: 0.9 }}>{t.screenReader}</span>
          <div style={{ display: "flex", gap: "3px" }}>
            <span onClick={() => setFontScale(0.9)} style={{ background: "rgba(255,255,255,0.2)", padding: "1px 6px", borderRadius: "2px", cursor: "pointer" }}>A-</span>
            <span onClick={() => setFontScale(1)} style={{ background: "rgba(255,255,255,0.2)", padding: "1px 6px", borderRadius: "2px", cursor: "pointer" }}>A</span>
            <span onClick={() => setFontScale(1.15)} style={{ background: "rgba(255,255,255,0.2)", padding: "1px 6px", borderRadius: "2px", cursor: "pointer" }}>A+</span>
          </div>
          <div style={{ display: "flex", gap: "6px", marginLeft: "10px", borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: "10px" }}>
            <span onClick={() => setLang("en")} style={{ cursor: "pointer", fontWeight: lang === "en" ? 800 : 400, textDecoration: lang === "en" ? "underline" : "none" }}>English</span>
            <span>|</span>
            <span onClick={() => setLang("hi")} style={{ cursor: "pointer", fontWeight: lang === "hi" ? 800 : 400, textDecoration: lang === "hi" ? "underline" : "none" }}>हिन्दी</span>
            <span>|</span>
            <span onClick={() => setLang("te")} style={{ cursor: "pointer", fontWeight: lang === "te" ? 800 : 400, textDecoration: lang === "te" ? "underline" : "none" }}>తెలుగు</span>
          </div>
        </div>
      </div>

      {/* 2. Official Ministry Brand Header */}
      <div style={{ background: "#ffffff", padding: "14px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dce4ec" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ fontSize: "34px", lineHeight: 1 }}>⚖️</div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", margin: 0 }}>{t.ministryHindi}</h1>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#4b5563", margin: "2px 0 0 0" }}>{t.ministryEng}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            style={{ padding: "7px 12px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "4px", outline: "none", width: "220px" }}
          />
          <button type="button" style={{ background: "#0b427b", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            {t.searchBtn}
          </button>
        </div>
      </div>

      {/* 3. Floating Navbar Container */}
      <div 
        style={{ padding: "12px 5% 4px 5%", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 100 }}
        onMouseLeave={() => { setIsLoginHovered(false); setActiveMenu(null); }}
      >
        <nav style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "1200px",
          borderRadius: "32px",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 6px 16px rgba(0, 47, 108, 0.08)",
          border: "1px solid #e2e8f0",
          minHeight: "48px"
        }}>
          <ul style={{ display: "flex", listStyle: "none", gap: "24px", margin: 0, padding: 0, fontSize: "13px", fontWeight: 600, color: "#1e293b", alignItems: "center", height: "48px" }}>
            
            {/* Home navigates back to landing screen */}
            <li 
              onClick={() => navigate("/")} 
              onMouseEnter={() => { setActiveMenu(null); setIsLoginHovered(false); }}
              style={{ cursor: "pointer", color: "#0b427b" }}
            >
              {t.home}
            </li>

            {/* About Us */}
            <li 
              style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
              onMouseEnter={() => { setActiveMenu("about"); setIsLoginHovered(false); }}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <span style={{ 
                cursor: "pointer", 
                color: activeMenu === "about" ? "#0b427b" : "#1e293b", 
                fontWeight: activeMenu === "about" ? 800 : 600,
                padding: "8px 0"
              }}>
                {t.aboutUs} ▾
              </span>

              {activeMenu === "about" && (
                <div 
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    paddingTop: "6px",
                    zIndex: 200
                  }}
                  onMouseEnter={() => setActiveMenu("about")}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "6px",
                    width: "220px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}>
                    {t.aboutItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openInfoModal(item.label, item.desc)}
                        style={{
                          padding: "9px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#334155",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#e0edfa"; e.currentTarget.style.color = "#0b427b"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {/* Compliance Acts */}
            <li 
              style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
              onMouseEnter={() => { setActiveMenu("acts"); setIsLoginHovered(false); }}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <span style={{ 
                cursor: "pointer", 
                color: activeMenu === "acts" ? "#0b427b" : "#1e293b", 
                fontWeight: activeMenu === "acts" ? 800 : 600,
                padding: "8px 0"
              }}>
                {t.acts} ▾
              </span>

              {activeMenu === "acts" && (
                <div 
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    paddingTop: "6px",
                    zIndex: 200
                  }}
                  onMouseEnter={() => setActiveMenu("acts")}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "6px",
                    width: "240px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}>
                    {t.actItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openInfoModal(item.label, item.desc)}
                        style={{
                          padding: "9px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#334155",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#e0edfa"; e.currentTarget.style.color = "#0b427b"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {/* Field Enforcement */}
            <li 
              style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
              onMouseEnter={() => { setActiveMenu("enforcement"); setIsLoginHovered(false); }}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <span style={{ 
                cursor: "pointer", 
                color: activeMenu === "enforcement" ? "#0b427b" : "#1e293b", 
                fontWeight: activeMenu === "enforcement" ? 800 : 600,
                padding: "8px 0"
              }}>
                {t.enforcement} ▾
              </span>

              {activeMenu === "enforcement" && (
                <div 
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    paddingTop: "6px",
                    zIndex: 200
                  }}
                  onMouseEnter={() => setActiveMenu("enforcement")}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "6px",
                    width: "230px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}>
                    {t.enforcementItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openInfoModal(item.label, item.desc)}
                        style={{
                          padding: "9px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#334155",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#e0edfa"; e.currentTarget.style.color = "#0b427b"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {/* Reports & Matrix */}
            <li 
              onClick={() => openInfoModal(t.reports, "State-wise verification reports, audit trails and risk intelligence matrices are accessible to authenticated officers.")} 
              onMouseEnter={() => { setActiveMenu(null); setIsLoginHovered(false); }}
              style={{ cursor: "pointer" }}
            >
              {t.reports}
            </li>

            {/* Helpdesk */}
            <li 
              onClick={() => openInfoModal(t.helpdesk, "National Legal Metrology Toll-Free Helpline: 1800-11-4000 (Mon-Sat, 9:00 AM - 5:30 PM). Email: contact@metrology-support.gov.in")} 
              onMouseEnter={() => { setActiveMenu(null); setIsLoginHovered(false); }}
              style={{ cursor: "pointer" }}
            >
              {t.helpdesk}
            </li>
          </ul>

          {/* Login Target Button */}
          <div 
            onMouseEnter={() => { setIsLoginHovered(true); setActiveMenu(null); }}
            style={{
              background: isLoginHovered ? "#0b427b" : "#f1f5f9",
              color: isLoginHovered ? "#ffffff" : "#0b427b",
              padding: "7px 22px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              border: "1px solid #cbd5e1",
              transition: "all 0.2s ease"
            }}
          >
            {t.loginBtn}
          </div>
        </nav>

        {/* Secondary Sub-Bar for Login */}
        {isLoginHovered && (
          <div 
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
            style={{
              width: "100%",
              maxWidth: "1150px",
              marginTop: "6px",
              background: "#ffffff",
              borderRadius: "24px",
              padding: "8px 30px",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              border: "1px solid #cbd5e1"
            }}
          >
            {["ADMIN", "SHOPKEEPER", "CHECKER"].map((roleKey) => (
              <div
                key={roleKey}
                onClick={() => handleSelectRole(roleKey)}
                style={{
                  padding: "7px 24px",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: selectedRole === roleKey ? 800 : 600,
                  color: selectedRole === roleKey ? "#0b427b" : "#475569",
                  background: selectedRole === roleKey ? "#e0edfa" : "transparent",
                  border: selectedRole === roleKey ? "1px solid #93c5fd" : "1px solid transparent",
                  transition: "background 0.15s ease, color 0.15s ease"
                }}
              >
                {t.roles[roleKey].label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Caution Strip */}
      <div style={{ background: "#fff7ed", borderTop: "1px solid #ffedd5", borderBottom: "1px solid #fed7aa", padding: "6px 20px", textAlign: "center", fontSize: "11px", color: "#9a3412", fontWeight: 600, marginTop: "8px" }}>
        {t.warningNotice}
      </div>

      {/* 5. Central Dynamic Login Box */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "30px 16px" }}>
        <div style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "410px",
          borderRadius: "14px",
          borderTop: "5px solid #0b427b",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          padding: "32px 28px",
          borderLeft: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0"
        }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>🏛️</div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0b427b", margin: 0 }}>
              {t.roles[selectedRole].label}
            </h2>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
              {t.roles[selectedRole].title}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "6px", textTransform: "uppercase" }}>
                {t.idLabel}
              </label>
              <input
                type="text"
                value={credentials.id}
                onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "6px", textTransform: "uppercase" }}>
                {t.pinLabel}
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "#0b427b",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(11, 66, 123, 0.25)"
              }}
            >
              {t.submitBtn} {selectedRole}
            </button>
          </form>
        </div>
      </div>

      {/* Informational Modal */}
      {modalContent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: "#ffffff", maxWidth: "480px", width: "100%", borderRadius: "10px", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: 0, color: "#0b427b", fontSize: "16px", borderBottom: "2px solid #0b427b", paddingBottom: "8px" }}>
              {modalContent.title}
            </h3>
            <p style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6, margin: "16px 0 24px 0" }}>
              {modalContent.body}
            </p>
            <div style={{ textAlign: "right" }}>
              <button 
                onClick={() => setModalContent(null)}
                style={{ background: "#0b427b", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "4px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                {t.modalClose}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;