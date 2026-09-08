import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import chipsImg from "../assets/chips-pack.png.png";

const translations = {
  en: {
    govIndia: "भारत सरकार | GOVERNMENT OF INDIA",
    ministryHindi: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    ministryEng: "Ministry of Consumer Affairs, Food & Public Distribution",
    division: "Legal Metrology Division",
    sloganTop: "सही माप, सही व्यापार, सशक्त उपभोक्ता",
    sloganSub: "Fair Measurement Stronger India",
    navHome: "Home",
    navAbout: "About",
    aboutItems: [
      { id: "setup", label: "Organizational Setup", desc: "Hierarchy, official administrative wings and directorates under the Ministry." },
      { id: "charter", label: "Charter of Services", desc: "Citizen charter, service timelines, and statutory commitment metrics." },
      { id: "gazette", label: "Gazette Notifications", desc: "Latest regulatory gazette orders, statutory amendments and notifications." }
    ],
    navRules: "Compliance Rules",
    ruleItems: [
      { id: "act2009", label: "Legal Metrology Act 2009", desc: "Core legislative framework governing metric enforcement, trade standards and weights." },
      { id: "pcr2011", label: "Packaged Commodities Rules 2011", desc: "Mandatory declarations: MRP, Net Quantity, Batch No., Mfg. Date and Customer Care." },
      { id: "standards", label: "National Standards Rules", desc: "Calibration tolerances, primary laboratory benchmarks and verification cycles." }
    ],
    navScanner: "Product Scanner",
    navReports: "Reports & Analytics",
    reportItems: [
      { id: "auditLogs", label: "National Inspection Logs", desc: "State-wise verification records, live enforcement tallies and field actions." },
      { id: "matrix", label: "Risk & Violation Matrix", desc: "High-risk commodity tracking, repeated label forgery alerts and market analytics." }
    ],
    navHelpdesk: "Helpdesk",
    loginBtn: "Login",
    heroTag: "AI FOR FAIR TRADE",
    heroTitle1: "AI-Powered",
    heroTitle2: "Packaged Commodity Compliance",
    heroDesc: "Scan product labels and verify compliance under the Legal Metrology (Packaged Commodities) Rules, 2011 using Artificial Intelligence.",
    scanBtn: "Scan Product →",
    rulesBtn: "View Compliance Rules",
    badges: ["Accurate", "Fast", "Trusted", "For a Fairer Marketplace"],
    compliantTitle: "Compliant",
    compliantSubtitle: "Conforms to Legal Metrology (Packaged Commodities) Rules, 2011",
    roles: [
      {
        id: "ADMIN",
        title: "Admin Portal",
        desc: "Manage master data, user access, monitor compliance and view analytics.",
        btn: "Go to Admin Portal →",
        bg: "#ebf5ff",
        accent: "#1e40af",
        btnColor: "#1d4ed8",
        icon: "👥",
        badge: "ADM-902",
        roleDesc: "Central Regulatory Command"
      },
      {
        id: "CHECKER",
        title: "Inspector Portal",
        desc: "Field inspection, scan products, generate reports and take action.",
        btn: "Go to Inspector Portal →",
        bg: "#ecfdf5",
        accent: "#065f46",
        btnColor: "#059669",
        icon: "👮",
        badge: "CHK-109",
        roleDesc: "Field Enforcement & Inspection"
      },
      {
        id: "SHOPKEEPER",
        title: "Business Portal",
        desc: "Verify your product compliance, access resources and raise queries.",
        btn: "Go to Business Portal →",
        bg: "#fff7ed",
        accent: "#9a3412",
        btnColor: "#ea580c",
        icon: "🏪",
        badge: "SHP-401",
        roleDesc: "Merchant & Store Self-Audit"
      }
    ],
    stats: [
      { label: "Products Scanned", val: "12,48,320", change: "↑ 28% from last month", color: "#2563eb", icon: "📦" },
      { label: "Compliance Rate", val: "96.7%", change: "↑ 2.3% from last month", color: "#16a34a", icon: "✅" },
      { label: "Violations Detected", val: "8,421", change: "↓ 18% from last month", color: "#dc2626", icon: "⚠️" },
      { label: "Active Inspectors", val: "1,156", change: "↑ 12% from last month", color: "#7c3aed", icon: "🛡️" }
    ],
    modalIdLabel: "Official Registration ID",
    modalPinLabel: "Security PIN / Password",
    modalSignIn: "SIGN IN AS",
    warningNotice: "🔒 NOTICE: Unauthorized access, manipulation or inspection forgery is penal under Section 66 of IT Act."
  },
  hi: {
    govIndia: "भारत सरकार | GOVERNMENT OF INDIA",
    ministryHindi: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    ministryEng: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    division: "विधिक मापविज्ञान प्रभाग",
    sloganTop: "सही माप, सही व्यापार, सशक्त उपभोक्ता",
    sloganSub: "उचित मापन सशक्त भारत",
    navHome: "होम",
    navAbout: "परिचय",
    aboutItems: [
      { id: "setup", label: "संगठनात्मक संरचना", desc: "मंत्रालय के अंतर्गत प्रशासनिक विंग, पदानुक्रम और क्षेत्रीय निदेशालय।" },
      { id: "charter", label: "नागरिक चार्टर", desc: "सेवा समय-सीमा, वैधानिक उत्तरदायित्व और नागरिक चार्टर विनिर्देश।" },
      { id: "gazette", label: "राजपत्र अधिसूचनाएं", desc: "नवीनतम राजपत्र आदेश, वैधानिक संशोधन और प्रवर्तन सूचनाएं।" }
    ],
    navRules: "अनुपालन नियम",
    ruleItems: [
      { id: "act2009", label: "विधिक मापविज्ञान अधिनियम 2009", desc: "माप, भार और विधिक मानकों को नियंत्रित करने वाला मुख्य अधिनियम।" },
      { id: "pcr2011", label: "पैकेज्ड कमोडिटीज नियम 2011", desc: "एमआरपी, शुद्ध मात्रा, निर्माण तिथि और आयातक घोषणा के अनिवार्य नियम।" },
      { id: "standards", label: "राष्ट्रीय मानक नियम", desc: "मानक अंशांकन सीमाएं, प्राथमिक प्रयोगशाला मानक और सत्यापन चक्र।" }
    ],
    navScanner: "उत्पाद स्कैनर",
    navReports: "रिपोर्ट्स व विश्लेषण",
    reportItems: [
      { id: "auditLogs", label: "राष्ट्रीय निरीक्षण लॉग", desc: "राज्य-स्तरीय सत्यापन रिकॉर्ड, प्रवर्तन आंकड़े और क्षेत्रीय कार्रवाई।" },
      { id: "matrix", label: "उल्लंघन मैट्रिक्स", desc: "संवेदनशील पैकेजिंग ट्रैकिंग और बार-बार उल्लंघन करने वालों की सूची।" }
    ],
    navHelpdesk: "सहायता केंद्र",
    loginBtn: "लॉगिन",
    heroTag: "निष्पक्ष व्यापार हेतु एआई",
    heroTitle1: "एआई-संचालित",
    heroTitle2: "पैकेज्ड वस्तु अनुपालन",
    heroDesc: "आर्टिफिशियल इंटेलिजेंस की मदद से लीगल मेट्रोलॉजी (पैकेज्ड कमोडिटीज) रूल्स, 2011 के तहत उत्पाद लेबल स्कैन करें और अनुपालन जांचें।",
    scanBtn: "उत्पाद स्कैन करें →",
    rulesBtn: "अनुपालन नियम देखें",
    badges: ["सटीक", "त्वरित", "विश्वसनीय", "निष्पक्ष बाज़ार हेतु"],
    compliantTitle: "पूर्णतः अनुरूप",
    compliantSubtitle: "विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011 के अनुसार सही",
    roles: [
      {
        id: "ADMIN",
        title: "व्यवस्थापक पोर्टल",
        desc: "मास्टर डेटा, उपयोगकर्ता पहुंच प्रबंधित करें और निगरानी करें।",
        btn: "एडमिन पोर्टल पर जाएं →",
        bg: "#ebf5ff",
        accent: "#1e40af",
        btnColor: "#1d4ed8",
        icon: "👥",
        badge: "ADM-902",
        roleDesc: "केंद्रीय प्रशासनिक विंग"
      },
      {
        id: "CHECKER",
        title: "निरीक्षक पोर्टल",
        desc: "क्षेत्रीय निरीक्षण, उत्पाद लेबल जांच, रिपोर्ट निर्माण और जब्ती कार्रवाई।",
        btn: "इंस्पेक्टर पोर्टल पर जाएं →",
        bg: "#ecfdf5",
        accent: "#065f46",
        btnColor: "#059669",
        icon: "👮",
        badge: "CHK-109",
        roleDesc: "क्षेत्रीय प्रवर्तन एवं जांच"
      },
      {
        id: "SHOPKEEPER",
        title: "व्यवसाय पोर्टल",
        desc: "अपने उत्पादों का स्व-सत्यापन करें, नियम देखें व सहायता प्राप्त करें।",
        btn: "बिज़नेस पोर्टल पर जाएं →",
        bg: "#fff7ed",
        accent: "#9a3412",
        btnColor: "#ea580c",
        icon: "🏪",
        badge: "SHP-401",
        roleDesc: "दुकान एवं इन्वेंट्री सत्यापन"
      }
    ],
    stats: [
      { label: "कुल स्कैन उत्पाद", val: "12,48,320", change: "↑ पिछले माह से 28% अधिक", color: "#2563eb", icon: "📦" },
      { label: "अनुपालन दर", val: "96.7%", change: "↑ पिछले माह से 2.3% अधिक", color: "#16a34a", icon: "✅" },
      { label: "पकड़े गए उल्लंघन", val: "8,421", change: "↓ पिछले माह से 18% कम", color: "#dc2626", icon: "⚠️" },
      { label: "सक्रिय निरीक्षक", val: "1,156", change: "↑ पिछले माह से 12% अधिक", color: "#7c3aed", icon: "🛡️" }
    ],
    modalIdLabel: "आधिकारिक पंजीकरण आईडी",
    modalPinLabel: "सुरक्षा पिन / पासवर्ड",
    modalSignIn: "लॉग इन करें बतौर",
    warningNotice: "🔒 सूचना: अनधिकृत पहुंच, रिकॉर्ड में फेरबदल आईटी अधिनियम की धारा 66 के तहत दंडनीय है।"
  },
  te: {
    govIndia: "భారత ప్రభుత్వం | GOVERNMENT OF INDIA",
    ministryHindi: "వినియోగదారుల వ్యవహారాల మంత్రిత్వ శాఖ",
    ministryEng: "Ministry of Consumer Affairs, Food & Public Distribution",
    division: "లీగల్ మెట్రాలజీ విభాగం",
    sloganTop: "సరైన కొలత, నిజాయితీ వ్యాపారం",
    sloganSub: "Fair Measurement Stronger India",
    navHome: "హోమ్",
    navAbout: "వివరాలు",
    aboutItems: [
      { id: "setup", label: "సంస్థాగత నిర్మాణం", desc: "మంత్రిత్వ శాఖ పరిధిలోని అధికారిక విభాగాలు మరియు వ్యవస్థాపక నిర్మాణం." },
      { id: "charter", label: "సేవా పత్రం", desc: "పౌర సేవా పత్రం, సేవల కాలపరిమితి మరియు అధికారిక నిబంధనలు." },
      { id: "gazette", label: "గెజిట్ నోటిఫికేషన్లు", desc: "తాజా నియంత్రణ ఆదేశాలు, గెజిట్ సవరణలు మరియు నోటిఫికేషన్లు." }
    ],
    navRules: "నిబంధనలు",
    ruleItems: [
      { id: "act2009", label: "లీగల్ మెట్రాలజీ చట్టం 2009", desc: "కొలతలు, తూకాలు మరియు ప్రమాణాల నియంత్రణ ప్రధాన చట్టం." },
      { id: "pcr2011", label: "ప్యాకేజ్డ్ కమోడిటీస్ రూల్స్ 2011", desc: "MRP, పరిమాణం, తయారీ వివరాలు మరియు ప్యాకేజింగ్ నిబంధనలు." },
      { id: "standards", label: "జాతీయ ప్రమాణాలు", desc: "క్యాలిబ్రేషన్ నియమాలు మరియు లేబొరేటరీ ప్రమాణాల ధృవీకరణ." }
    ],
    navScanner: "ఉత్పత్తి స్కానర్",
    navReports: "నివేదికలు & విశ్లేషణ",
    reportItems: [
      { id: "auditLogs", label: "జాతీయ తనిఖీ లాగ్‌లు", desc: "రాష్ట్రాల వారీగా తనిఖీ రికార్డులు మరియు క్షేత్రస్థాయి చర్యల వివరాలు." },
      { id: "matrix", label: "ఉల్లంఘనల నివేదిక", desc: "నిబంధనలు పాటించని ఉత్పత్తుల పర్యవేక్షణ మరియు విశ్లేషణ." }
    ],
    navHelpdesk: "సహాయ కేంద్రం",
    loginBtn: "లాగిన్",
    heroTag: "న్యాయమైన వ్యాపారం కోసం AI",
    heroTitle1: "AI ఆధారిత",
    heroTitle2: "ప్యాకేజ్డ్ ఉత్పత్తుల ధృవీకరణ",
    heroDesc: "లీగల్ మెట్రాలజీ నిబంధనలు 2011 ప్రకారం ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ ఉపయోగించి వస్తువుల లేబుల్స్‌ను ధృవీకరించండి.",
    scanBtn: "ఉత్పత్తిని స్కాన్ చేయండి →",
    rulesBtn: "నిబంధనలు చూడండి",
    badges: ["ఖచ్చితమైనది", "వేగవంతమైనది", "విశ్వసనీయమైనది", "న్యాయమైన మార్కెట్"],
    compliantTitle: "అనుకూలమైనది",
    compliantSubtitle: "లీగల్ మెట్రాలజీ నిబంధనలకు అనుగుణంగా ఉంది",
    roles: [
      {
        id: "ADMIN",
        title: "అడ్మిన్ పోర్టల్",
        desc: "మాస్టర్ డేటా, యూజర్ యాక్సెస్ నిర్వహణ మరియు అనలిటిక్స్.",
        btn: "అడ్మిన్ పోర్టల్‌కి వెళ్లండి →",
        bg: "#ebf5ff",
        accent: "#1e40af",
        btnColor: "#1d4ed8",
        icon: "👥",
        badge: "ADM-902",
        roleDesc: "కేంద్ర పరిపాలన పోర్టల్"
      },
      {
        id: "CHECKER",
        title: "ఇన్‌స్పెక్టర్ పోర్టల్",
        desc: "క్షేత్ర తనిఖీలు, ఉత్పత్తుల స్కానింగ్ మరియు చర్యలు.",
        btn: "ఇన్‌స్పెక్టర్ పోర్టల్‌కి వెళ్లండి →",
        bg: "#ecfdf5",
        accent: "#065f46",
        btnColor: "#059669",
        icon: "👮",
        badge: "CHK-109",
        roleDesc: "ఫీల్డ్ ఎన్‌ఫోర్స్‌మెంట్ తనిఖీ"
      },
      {
        id: "SHOPKEEPER",
        title: "వ్యాపార పోర్టల్",
        desc: "మీ ఉత్పత్తుల ధృవీకరణ మరియు నిబంధనల సమాచారం.",
        btn: "బిజినెస్ పోర్టల్‌కి వెళ్లండి →",
        bg: "#fff7ed",
        accent: "#9a3412",
        btnColor: "#ea580c",
        icon: "🏪",
        badge: "SHP-401",
        roleDesc: "దుకాణం & నిబంధనల సమీక్ష"
      }
    ],
    stats: [
      { label: "స్కాన్ చేసిన ఉత్పత్తులు", val: "12,48,320", change: "↑ గత నెల కంటే 28% ఎక్కువ", color: "#2563eb", icon: "📦" },
      { label: "అనుకూలత రేటు", val: "96.7%", change: "↑ గత నెల కంటే 2.3% ఎక్కువ", color: "#16a34a", icon: "✅" },
      { label: "గుర్తించిన ఉల్లంఘనలు", val: "8,421", change: "↓ గత నెల కంటే 18% తక్కువ", color: "#dc2626", icon: "⚠️" },
      { label: "క్రియాశీల అధికారులు", val: "1,156", change: "↑ గత నెల కంటే 12% ఎక్కువ", color: "#7c3aed", icon: "🛡️" }
    ],
    modalIdLabel: "అధికారిక ఐడీ",
    modalPinLabel: "సెక్యూరిటీ పిన్",
    modalSignIn: "లాగిన్ అవ్వండి -",
    warningNotice: "🔒 హెచ్చరిక: అనధికారిక ప్రవేశం లేదా రికార్డుల మార్పు ఐటీ చట్టం సెక్షన్ 66 కింద నేరం."
  }
};

const Home = () => {
  const [lang, setLang] = useState("en");
  const [fontScale, setFontScale] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState(null);

  // Merged Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("ADMIN");
  const [credentials, setCredentials] = useState({ id: "ADM-902", password: "password123" });

  const navigate = useNavigate();
  const { login } = useAuth();
  const t = translations[lang];

  const openLoginModal = (roleKey) => {
    setIsLoginHovered(false);
    setActiveMenu(null);
    setSelectedRole(roleKey);
    const roleObj = t.roles.find((r) => r.id === roleKey) || t.roles[0];
    setCredentials({
      id: roleObj.badge,
      password: "password123"
    });
    setIsLoginModalOpen(true);
  };

  const handleRoleTabChange = (roleKey) => {
    setSelectedRole(roleKey);
    const roleObj = t.roles.find((r) => r.id === roleKey) || t.roles[0];
    setCredentials({
      id: roleObj.badge,
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

    setIsLoginModalOpen(false);
    if (selectedRole === "ADMIN") navigate("/admin/dashboard");
    if (selectedRole === "SHOPKEEPER") navigate("/shopkeeper/dashboard");
    if (selectedRole === "CHECKER") navigate("/checker/dashboard");
  };

  const openInfoModal = (title, body) => {
    setActiveMenu(null);
    setInfoModalContent({ title, body });
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#f8fafc",
      fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
      fontSize: `${14 * fontScale}px`,
      overflowX: "hidden"
    }}>
      
      {/* 1. TOP BAR */}
      <div style={{ background: "#0c3b6b", color: "#ffffff", padding: "6px clamp(12px, 3vw, 40px)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", fontWeight: 700 }}>
          <span>🇮🇳</span>
          <span>{t.govIndia}</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <span>Screen Reader</span>
          <span>|</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <span onClick={() => setFontScale(0.9)} style={{ cursor: "pointer", padding: "1px 6px", background: "rgba(255,255,255,0.2)", borderRadius: 2 }}>A-</span>
            <span onClick={() => setFontScale(1)} style={{ cursor: "pointer", padding: "1px 6px", background: "rgba(255,255,255,0.2)", borderRadius: 2 }}>A</span>
            <span onClick={() => setFontScale(1.15)} style={{ cursor: "pointer", padding: "1px 6px", background: "rgba(255,255,255,0.2)", borderRadius: 2 }}>A+</span>
          </div>
          <span>|</span>
          <div style={{ display: "flex", gap: "6px" }}>
            <span onClick={() => setLang("en")} style={{ cursor: "pointer", fontWeight: lang === "en" ? 800 : 400, textDecoration: lang === "en" ? "underline" : "none" }}>English</span>
            <span>|</span>
            <span onClick={() => setLang("hi")} style={{ cursor: "pointer", fontWeight: lang === "hi" ? 800 : 400, textDecoration: lang === "hi" ? "underline" : "none" }}>हिन्दी</span>
            <span>|</span>
            <span onClick={() => setLang("te")} style={{ cursor: "pointer", fontWeight: lang === "te" ? 800 : 400, textDecoration: lang === "te" ? "underline" : "none" }}>తెలుగు</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN MINISTRY BRAND HEADER */}
      <div style={{ background: "#ffffff", padding: "12px clamp(12px, 3vw, 40px)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "260px" }}>
          <div style={{ fontSize: "clamp(28px, 3vw, 38px)", lineHeight: 1 }}>⚖️</div>
          <div>
            <h1 style={{ fontSize: "clamp(13px, 1.1vw, 16px)", fontWeight: 800, color: "#0f172a", margin: 0 }}>{t.ministryHindi}</h1>
            <p style={{ fontSize: "clamp(11px, 0.9vw, 13px)", fontWeight: 600, color: "#334155", margin: "2px 0 0 0" }}>{t.ministryEng}</p>
            <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700 }}>{t.division}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ textAlign: "right", borderRight: "2px solid #e2e8f0", paddingRight: "20px" }}>
            <div style={{ fontSize: "clamp(11px, 0.9vw, 13px)", fontWeight: 800, color: "#0c3b6b" }}>{t.sloganTop}</div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{t.sloganSub}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>Viksit</span>
              <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>Bharat</span>
              <span style={{ display: "block", fontSize: "10.5px", fontWeight: 800, color: "#ea580c" }}>@2047</span>
            </div>
            <span style={{ fontSize: "28px" }}>🇮🇳</span>
          </div>
        </div>
      </div>

      {/* 3. CAPSULE NAVBAR WITH WORKING DROPDOWNS & COMPACT HORIZONTAL LOGIN POPUP (LEFT SIDE) */}
      <div 
        style={{ padding: "10px clamp(12px, 3vw, 40px) 4px clamp(12px, 3vw, 40px)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 100 }}
        onMouseLeave={() => { setIsLoginHovered(false); setActiveMenu(null); }}
      >
        <nav style={{
          background: "#ffffff",
          width: "100%",
          borderRadius: "32px",
          padding: "0 clamp(16px, 2vw, 32px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
          minHeight: "48px",
          position: "relative"
        }}>
          <ul style={{ display: "flex", listStyle: "none", gap: "clamp(14px, 2vw, 28px)", margin: 0, padding: 0, fontSize: "clamp(12px, 0.9vw, 13.5px)", fontWeight: 600, color: "#1e293b", alignItems: "center", height: "48px" }}>
            
            {/* Home */}
            <li 
              onClick={() => { setActiveMenu(null); setIsLoginHovered(false); }}
              style={{ cursor: "pointer", color: "#ea580c", borderBottom: "2.5px solid #ea580c", height: "100%", display: "flex", alignItems: "center" }}
            >
              {t.navHome}
            </li>

            {/* About Dropdown */}
            <li 
              style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
              onMouseEnter={() => { setActiveMenu("about"); setIsLoginHovered(false); }}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <span style={{ 
                cursor: "pointer", 
                color: activeMenu === "about" ? "#0c3b6b" : "#1e293b", 
                fontWeight: activeMenu === "about" ? 800 : 600,
                padding: "10px 0"
              }}>
                {t.navAbout} ▾
              </span>

              {activeMenu === "about" && (
                <div 
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    paddingTop: "6px",
                    zIndex: 250
                  }}
                  onMouseEnter={() => setActiveMenu("about")}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "6px",
                    width: "230px",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
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
                          padding: "9px 12px",
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

            {/* Compliance Rules Dropdown */}
            <li 
              style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
              onMouseEnter={() => { setActiveMenu("rules"); setIsLoginHovered(false); }}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <span style={{ 
                cursor: "pointer", 
                color: activeMenu === "rules" ? "#0c3b6b" : "#1e293b", 
                fontWeight: activeMenu === "rules" ? 800 : 600,
                padding: "10px 0"
              }}>
                {t.navRules} ▾
              </span>

              {activeMenu === "rules" && (
                <div 
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    paddingTop: "6px",
                    zIndex: 250
                  }}
                  onMouseEnter={() => setActiveMenu("rules")}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "6px",
                    width: "260px",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}>
                    {t.ruleItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openInfoModal(item.label, item.desc)}
                        style={{
                          padding: "9px 12px",
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

            {/* Product Scanner Direct */}
            <li 
              onClick={() => openLoginModal("CHECKER")}
              onMouseEnter={() => { setActiveMenu(null); setIsLoginHovered(false); }}
              style={{ cursor: "pointer" }}
            >
              {t.navScanner}
            </li>

            {/* Reports & Analytics Dropdown */}
            <li 
              style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
              onMouseEnter={() => { setActiveMenu("reports"); setIsLoginHovered(false); }}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <span style={{ 
                cursor: "pointer", 
                color: activeMenu === "reports" ? "#0c3b6b" : "#1e293b", 
                fontWeight: activeMenu === "reports" ? 800 : 600,
                padding: "10px 0"
              }}>
                {t.navReports} ▾
              </span>

              {activeMenu === "reports" && (
                <div 
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    paddingTop: "6px",
                    zIndex: 250
                  }}
                  onMouseEnter={() => setActiveMenu("reports")}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "6px",
                    width: "240px",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}>
                    {t.reportItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openInfoModal(item.label, item.desc)}
                        style={{
                          padding: "9px 12px",
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

            {/* Helpdesk */}
            <li 
              onClick={() => openInfoModal(t.navHelpdesk, "National Legal Metrology Toll-Free Helpline: 1800-11-4000 (Mon-Sat, 9:00 AM - 5:30 PM).")}
              onMouseEnter={() => { setActiveMenu(null); setIsLoginHovered(false); }}
              style={{ cursor: "pointer" }}
            >
              {t.navHelpdesk}
            </li>
          </ul>

          {/* LOGIN CONTAINER (BUTTON + HORIZONTAL POPUP TO ITS LEFT) */}
          <div 
            style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
            onMouseEnter={() => { setIsLoginHovered(true); setActiveMenu(null); }}
            onMouseLeave={() => setIsLoginHovered(false)}
          >
            {/* Horizontal Popup Attached Directly to Left of Login Button */}
            {isLoginHovered && (
              <div 
                style={{
                  position: "absolute",
                  right: "100%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  paddingRight: "10px",
                  zIndex: 350
                }}
                onMouseEnter={() => setIsLoginHovered(true)}
                onMouseLeave={() => setIsLoginHovered(false)}
              >
                <div style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  padding: "4px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                  border: "1px solid #cbd5e1",
                  whiteSpace: "nowrap"
                }}>
                  {t.roles.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => openLoginModal(r.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "14px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: r.accent,
                        background: r.bg,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(0.94)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                    >
                      <span>{r.icon}</span>
                      <span>{r.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Login Trigger Button */}
            <div 
              onClick={() => openLoginModal("ADMIN")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "13.5px",
                color: "#0f172a",
                borderLeft: "1px solid #cbd5e1",
                paddingLeft: "18px"
              }}
            >
              <span>👤</span>
              <span>{t.loginBtn} ▾</span>
            </div>
          </div>
        </nav>
      </div>

      {/* 4. HERO SECTION */}
      <div style={{
        flex: 1,
        padding: "clamp(20px, 3vh, 36px) clamp(12px, 3vw, 40px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "clamp(24px, 4vw, 50px)",
        flexWrap: "wrap"
      }}>
        
        {/* Left Column */}
        <div style={{ flex: "1 1 420px", minWidth: "280px" }}>
          <span style={{ display: "inline-block", background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: 800, padding: "4px 14px", borderRadius: "14px", letterSpacing: "0.5px", marginBottom: "14px" }}>
            {t.heroTag}
          </span>
          <h1 style={{ fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, color: "#0b2545", lineHeight: 1.15, margin: "0 0 14px 0" }}>
            {t.heroTitle1} <br />
            <span style={{ color: "#d9531e" }}>{t.heroTitle2}</span>
          </h1>
          <p style={{ fontSize: "clamp(13px, 1vw, 15px)", color: "#475569", lineHeight: 1.6, margin: "0 0 22px 0", maxWidth: "600px" }}>
            {t.heroDesc}
          </p>

          <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "22px", flexWrap: "wrap" }}>
            <button 
              onClick={() => openLoginModal("CHECKER")}
              style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(12, 59, 107, 0.25)" }}
            >
              <span>📷</span> {t.scanBtn}
            </button>
            <button 
              onClick={() => alert("Legal Metrology (Packaged Commodities) Rules 2011 handbook.")}
              style={{ background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1", padding: "12px 22px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>📖</span> {t.rulesBtn}
            </button>
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            {t.badges.map((b, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#0c3b6b" }}>✔</span> {b}
                {i < t.badges.length - 1 && <span style={{ marginLeft: "10px", color: "#cbd5e1" }}>|</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Right Realistic Image-Based AI Scanner Frame */}
        <div style={{ flex: "1 1 500px", display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
            
            {/* Outer AI Target Reticle Box */}
            <div style={{
              position: "relative",
              padding: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              {/* Cyan Target Bracket Corners */}
              <div style={{ position: "absolute", top: 0, left: 0, width: 28, height: 28, borderTop: "4px solid #0284c7", borderLeft: "4px solid #0284c7", borderTopLeftRadius: "8px" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: 28, height: 28, borderTop: "4px solid #0284c7", borderRight: "4px solid #0284c7", borderTopRightRadius: "8px" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: 28, height: 28, borderBottom: "4px solid #0284c7", borderLeft: "4px solid #0284c7", borderBottomLeftRadius: "8px" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderBottom: "4px solid #0284c7", borderRight: "4px solid #0284c7", borderBottomRightRadius: "8px" }} />

              {/* Floating AI Scanning Status Badge */}
              <div style={{
                position: "absolute",
                left: "-35px",
                top: "38%",
                background: "#ffffff",
                padding: "8px 14px",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
                border: "1px solid #bae6fd",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                zIndex: 20
              }}>
                <div style={{ width: 28, height: 28, borderRadius: "8px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                  📡
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#0369a1" }}>AI Scanning...</div>
                  <div style={{ fontSize: "9.5px", color: "#64748b" }}>Reading label information</div>
                </div>
              </div>

              {/* Sana Chips Packet Image Container */}
              <div style={{
                width: "230px",
                height: "330px",
                borderRadius: "16px",
                background: "radial-gradient(circle, rgba(251, 207, 232, 0.25) 0%, rgba(255, 255, 255, 0) 70%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                <img 
                  src={chipsImg} 
                  alt="Sana Packaged Commodity" 
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 14px 22px rgba(0, 0, 0, 0.16))"
                  }}
                />
              </div>

            </div>

            {/* Checklist Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: "1 1 240px", maxWidth: "280px", minWidth: "220px" }}>
              <div style={{ background: "#ffffff", borderRadius: "14px", padding: "14px 16px", boxShadow: "0 6px 18px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px" }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>₹ MRP</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>₹ 65.00</span>
                  <span style={{ color: "#16a34a", fontWeight: 800 }}>✔</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px" }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>⚖️ Net Quantity</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>140 g</span>
                  <span style={{ color: "#16a34a", fontWeight: 800 }}>✔</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px" }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>🏭 Manufacturer</span>
                  <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "11px" }}>Sana Foods Ltd.</span>
                  <span style={{ color: "#16a34a", fontWeight: 800 }}>✔</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: "12.5px" }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>📅 Date of Mfg.</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>15 FEB 2026</span>
                  <span style={{ color: "#16a34a", fontWeight: 800 }}>✔</span>
                </div>
              </div>

              <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 900 }}>
                  ✔
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#166534" }}>{t.compliantTitle}</h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#15803d", lineHeight: 1.3 }}>{t.compliantSubtitle}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 5. PORTAL ROLE CARDS */}
      <div style={{ padding: "6px clamp(12px, 3vw, 40px) 14px clamp(12px, 3vw, 40px)" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "clamp(14px, 2vw, 24px)"
        }}>
          {t.roles.map((r) => (
            <div 
              key={r.id}
              style={{ background: "#ffffff", borderRadius: "16px", padding: "clamp(18px, 2vw, 24px)", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: "12px", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "14px" }}>
                  {r.icon}
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                  {r.title}
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.5, margin: "0 0 18px 0" }}>
                  {r.desc}
                </p>
              </div>

              <button
                onClick={() => openLoginModal(r.id)}
                style={{ background: r.btnColor, color: "#ffffff", border: "none", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%", textAlign: "center" }}
              >
                {r.btn}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. NATIONAL METRICS RIBBON */}
      <div style={{ padding: "0 clamp(12px, 3vw, 40px) 20px clamp(12px, 3vw, 40px)" }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "16px clamp(16px, 2vw, 28px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "clamp(14px, 2vw, 24px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)"
        }}>
          {t.stats.map((s, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                {s.icon}
              </div>
              <div>
                <span style={{ display: "block", fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>{s.label}</span>
                <span style={{ display: "block", fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: "2px 0" }}>{s.val}</span>
                <span style={{ display: "block", fontSize: "10.5px", color: s.color, fontWeight: 700 }}>{s.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. INFORMATIONAL MODAL OVERLAY */}
      {infoModalContent && (
        <div 
          onClick={() => setInfoModalContent(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
            padding: "16px"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              maxWidth: "500px",
              width: "100%",
              borderRadius: "14px",
              padding: "24px 26px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}
          >
            <h3 style={{ margin: 0, color: "#0c3b6b", fontSize: "16px", fontWeight: 800, borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
              {infoModalContent.title}
            </h3>
            <p style={{ fontSize: "13.5px", color: "#334155", lineHeight: 1.6, margin: "18px 0 24px 0" }}>
              {infoModalContent.body}
            </p>
            <div style={{ textAlign: "right" }}>
              <button 
                onClick={() => setInfoModalContent(null)}
                style={{ background: "#0c3b6b", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MERGED OFFICIAL AUTHENTICATION MODAL OVERLAY */}
      {isLoginModalOpen && (
        <div 
          onClick={() => setIsLoginModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "16px"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "420px",
              borderRadius: "16px",
              borderTop: "5px solid #0b427b",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.22)",
              padding: "28px 26px",
              position: "relative"
            }}
          >
            <button
              onClick={() => setIsLoginModalOpen(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: 30,
                height: 30,
                cursor: "pointer",
                fontWeight: 800,
                color: "#64748b",
                fontSize: "14px"
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "30px", marginBottom: "4px" }}>🏛️</div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0b427b", margin: 0 }}>
                {t.roles.find((r) => r.id === selectedRole)?.title || "Official Portal"}
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
                {t.roles.find((r) => r.id === selectedRole)?.roleDesc || "Statutory Authentication Gateway"}
              </p>
            </div>

            <div style={{ display: "flex", gap: "6px", background: "#f1f5f9", padding: "4px", borderRadius: "10px", marginBottom: "18px" }}>
              {["ADMIN", "CHECKER", "SHOPKEEPER"].map((rKey) => (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => handleRoleTabChange(rKey)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    border: "none",
                    borderRadius: "7px",
                    fontSize: "11px",
                    fontWeight: selectedRole === rKey ? 800 : 600,
                    cursor: "pointer",
                    background: selectedRole === rKey ? "#0b427b" : "transparent",
                    color: selectedRole === rKey ? "#ffffff" : "#475569",
                    transition: "all 0.15s ease"
                  }}
                >
                  {rKey === "CHECKER" ? "INSPECTOR" : rKey}
                </button>
              ))}
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase" }}>
                  {t.modalIdLabel}
                </label>
                <input
                  type="text"
                  value={credentials.id}
                  onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase" }}>
                  {t.modalPinLabel}
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
                {t.modalSignIn} {selectedRole}
              </button>
            </form>

            <div style={{ marginTop: "14px", textAlign: "center", fontSize: "10.5px", color: "#9a3412", fontWeight: 600 }}>
              {t.warningNotice}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;