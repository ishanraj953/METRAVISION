import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert, 
  FileText, 
  Building2, 
  Scale, 
  Camera, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  HelpCircle, 
  PhoneCall, 
  Lock,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Award,
  Search,
  Info,
  Layers,
  Cpu,
  Home as HomeIcon,
  Sparkles,
  Zap,
  Check,
  Download,
  Filter,
  IndianRupee,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { BUILTIN_RULES_24 } from "../data/statutoryRules";
import emblemImg from "../assets/india.png";
import chipsImg from "../assets/chips-pack.png.png";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "rules" | "about" | "platform"

  // Rules state for the dedicated rules tab
  const [rulesList, setRulesList] = useState(BUILTIN_RULES_24);
  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleCategory, setRuleCategory] = useState("all");
  const [ruleSeverity, setRuleSeverity] = useState("all");
  const [loadingRules, setLoadingRules] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoadingRules(true);
        const res = await API.get("/compliance/rules");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((r, idx) => ({
            rule_id: r.rule_id || r.rule_code || `LM-PC-${String(idx + 1).padStart(3, "0")}`,
            rule_reference: r.rule_reference || r.parameters?.rule_reference || "PCR 2011 Statutory",
            act_section: r.act_section || r.parameters?.act_section || "Section 36(1) Legal Metrology Act, 2009",
            field: r.field || r.field_name || "",
            category: Array.isArray(r.category) ? r.category : (typeof r.category === "string" ? r.category.split(",").map(c => c.trim()) : ["GENERAL"]),
            title: r.title || r.requirement?.split(".")[0] || r.rule_description?.split(".")[0] || "Statutory Packaging Rule",
            requirement: r.requirement || r.rule_description || "",
            character_height: r.character_height || r.parameters?.character_height || "Minimum 3.0mm standard threshold",
            penalty_range: r.penalty_range || r.parameters?.penalty_range || "Section 36(1): Compounding fine ₹25,000 to ₹1,00,000 (Jan Vishwas Act, 2023)",
            severity: r.severity || "HIGH",
            source: r.source || r.parameters?.source || "Legal Metrology (Packaged Commodities) Rules, 2011"
          }));
          setRulesList(mapped);
        }
      } catch (err) {
        // Fallback to built-in 24 statutory rules
      } finally {
        setLoadingRules(false);
      }
    };
    fetchRules();
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { title: "Statutory Field Inspection", desc: "Launch 8-stage automated label inspection, OCR perception, and compliance check.", path: "/enforcement/inspect", btnText: "Start Inspection →", color: "#0c3b6b", icon: Camera },
    { title: "Enforcement Cases & Notices", desc: "Track Show Cause Notices, hearings, and compounding penalties under Section 36(1).", path: "/enforcement/cases", btnText: "View Case Register →", color: "#991b1b", icon: FileText },
    { title: "Commercial Entities Directory", desc: "Search registered Manufacturers, Packers, Importers, and Retailers under Rule 27.", path: "/enforcement/responsible-parties", btnText: "Browse Directory →", color: "#166534", icon: Building2 },
    { title: "PCR 2011 & Legal Metrology Rules", desc: "Complete 24-rule statutory repository under Sections 18, 36, 48, and 49.", action: () => handleTabChange("rules"), btnText: "Explore 24 Rules Tab →", color: "#475569", icon: BookOpen },
  ];

  const statutoryPillars = [
    { rule: "Rule 6(1)(a)", title: "Name & Complete Address", desc: "Mandatory declaration of Manufacturer, Packer, or Importer with complete physical address & pin code on PDP." },
    { rule: "Rule 6(1)(b)", title: "Common / Generic Name", desc: "Generic or common name of the pre-packaged commodity clearly stated in conspicuous contrast font." },
    { rule: "Rule 6(1)(c)", title: "Net Quantity Statement", desc: "Standard metric SI units (g, kg, ml, l) strictly adhering to Schedule III without short delivery." },
    { rule: "Rule 6(1)(d)", title: "Month & Year of Manufacture", desc: "Clear manufacturing, pre-packing, or import date (MM/YYYY) for consumer shelf-life transparency." },
    { rule: "Rule 6(1)(e)", title: "Maximum Retail Price (MRP)", desc: "MRP inclusive of all taxes, clearly legible; strict prohibition of selling above MRP or dual MRP." },
    { rule: "Rule 6(1)(h)", title: "Consumer Care Details", desc: "Designated helpline phone, email, and address for prompt redressal of consumer grievances." },
    { rule: "Rule 6(1)(n)", title: "Country of Origin (COO)", desc: "Mandatory declaration for all imported commodities and e-commerce pre-checkout previews." },
    { rule: "Rule 9 & Sched IV", title: "Numeral Height Matrix", desc: "Strict font height scale: Area ≤50cm²: 1.0mm | 50-200cm²: 2.0mm | 200-1000cm²: 4.0mm | >1000cm²: 6.0mm." },
    { rule: "Rule 18(1) & (2)", title: "Anti-Profiteering & Dual MRP", desc: "Prohibition against charging above MRP, smudging, or declaring dual MRP for identical products." },
    { rule: "Rule 27", title: "Importer & Packer Registration", desc: "Mandatory registration with Director/Controller of Legal Metrology before commercial distribution." },
  ];

  const platformPillars = [
    {
      step: "01",
      title: "Optical Perception & Neural OCR",
      desc: "Live camera hardware scanner and multi-panel image ingestion with WinOCR and PaddleOCR neural engines for sub-second declaration extraction.",
      icon: Camera,
      tag: "PERCEPTION LAYER"
    },
    {
      step: "02",
      title: "24-Rule Statutory Evaluation",
      desc: "Dynamic matching against all 24 Legal Metrology Act & PCR 2011 provisions, including Schedule IV numeral height and mandatory PDP statements.",
      icon: Scale,
      tag: "COMPLIANCE ENGINE"
    },
    {
      step: "03",
      title: "Liability & Compounding Engine",
      desc: "Automatic determination of legal responsibility (Manufacturer vs Importer) with Jan Vishwas Act, 2023 civil compounding penalty calculations.",
      icon: ShieldAlert,
      tag: "RESPONSIBILITY ENGINE"
    },
    {
      step: "04",
      title: "Statutory Memos & Form VI Clearance",
      desc: "Automated generation of official Form VI Compliance Clearance Certificates (for 100% compliant goods) or statutory inspection memos with digital seals.",
      icon: Award,
      tag: "REPORTING & ACTIONS"
    }
  ];

  // Filtered rules for the dedicated tab
  const filteredRules = rulesList.filter((rule) => {
    const catMatch =
      ruleCategory === "all" ||
      (rule.category &&
        rule.category.some((c) => {
          if (ruleCategory === "mandatory") return ["GENERAL", "RETAIL"].includes(c);
          if (ruleCategory === "food") return ["FOOD", "EDIBLE_OIL", "AGRICULTURE"].includes(c);
          if (ruleCategory === "electronics") return c === "ELECTRONICS";
          if (ruleCategory === "imported") return c === "IMPORTED";
          if (ruleCategory === "ecom") return c === "E_COMMERCE";
          if (ruleCategory === "medical") return c === "MEDICAL_DEVICES";
          return true;
        }));

    const sevMatch = ruleSeverity === "all" || rule.severity === ruleSeverity;

    const q = ruleSearch.toLowerCase().trim();
    const searchMatch =
      !q ||
      rule.rule_id.toLowerCase().includes(q) ||
      rule.rule_reference.toLowerCase().includes(q) ||
      rule.act_section.toLowerCase().includes(q) ||
      rule.title.toLowerCase().includes(q) ||
      rule.field.toLowerCase().includes(q) ||
      rule.requirement.toLowerCase().includes(q) ||
      rule.penalty_range.toLowerCase().includes(q);

    return catMatch && sevMatch && searchMatch;
  });

  const getSeverityBadgeStyle = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return { background: "#fee2e2", color: "#991b1b", border: "1px solid #f87171" };
      case "HIGH":
        return { background: "#ffedd5", color: "#9a3412", border: "1px solid #fb923c" };
      case "MEDIUM":
        return { background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc" };
      default:
        return { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      {/* 1. Indian National Tricolor Ribbon */}
      <div className="india-tricolor-bar" />

      {/* 2. Top Accessibility & National Links Strip */}
      <div className="gov-accessibility-strip">
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <span>भारत सरकार | GOVERNMENT OF INDIA</span>
          <span style={{ color: "#94a3b8" }}>•</span>
          <span>National Legal Metrology Enforcement Portal</span>
          <span style={{ color: "#94a3b8" }}>•</span>
          <span>National Consumer Helpline: <strong>1915</strong></span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button 
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            style={{ background: "transparent", border: "1px solid #94a3b8", color: "#ffffff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: 700 }}
          >
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
          <span>|</span>
          <span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} IST</span>
        </div>
      </div>

      {/* 3. National Ministry & Directorate Header Banner */}
      <div className="gov-ministry-banner">
        <div className="gov-emblem-title-group">
          <img src={emblemImg} alt="State Emblem of India" className="gov-emblem-img" />
          <div>
            <div className="gov-titles-hindi">
              उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय
            </div>
            <div className="gov-titles-english">
              Ministry of Consumer Affairs, Food & Public Distribution • Legal Metrology Division
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0c3b6b", marginTop: "2px" }}>
              METRAVISION : National Packaged Commodity Compliance & Enforcement Platform
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user ? (
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/enforcement/dashboard")}
              className="btn-gov-primary"
              style={{ padding: "9px 18px", fontSize: "13px" }}
            >
              Enter Officer Command Center →
            </motion.button>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="btn-gov-primary"
              style={{ padding: "9px 18px", fontSize: "13px" }}
            >
              <Lock size={14} /> Official Sign In / Register
            </motion.button>
          )}
        </div>
      </div>

      {/* 4. CLEAN STATUTORY NAVBAR (Only Navigation Tabs: Overview, Rules, About, Platform) */}
      <motion.nav 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#0c3b6b",
          borderBottom: "3px solid #FF9933",
          boxShadow: "0 4px 12px rgba(12, 59, 107, 0.25)"
        }}
      >
        <div style={{ maxWidth: "1360px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          
          {/* Main Informational & Statutory Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            
            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTabChange("overview")}
              style={{
                background: activeTab === "overview" ? "rgba(255,255,255,0.18)" : "transparent",
                color: activeTab === "overview" ? "#93c5fd" : "#ffffff",
                border: "none",
                padding: "13px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                borderBottom: activeTab === "overview" ? "3px solid #38bdf8" : "3px solid transparent",
                transition: "all 0.15s ease"
              }}
            >
              <HomeIcon size={15} /> Overview
            </motion.button>

            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTabChange("rules")}
              style={{
                background: activeTab === "rules" ? "rgba(255,255,255,0.18)" : "transparent",
                color: activeTab === "rules" ? "#93c5fd" : "#ffffff",
                border: "none",
                padding: "13px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                borderBottom: activeTab === "rules" ? "3px solid #38bdf8" : "3px solid transparent",
                transition: "all 0.15s ease"
              }}
            >
              <BookOpen size={15} /> PCR 2011 Rules (24)
              <span style={{ 
                fontSize: "10.5px", 
                background: activeTab === "rules" ? "#38bdf8" : "#FF9933", 
                color: "#002147", 
                padding: "1px 6px", 
                borderRadius: "10px", 
                fontWeight: 800 
              }}>
                24 Rules
              </span>
            </motion.button>

            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTabChange("about")}
              style={{
                background: activeTab === "about" ? "rgba(255,255,255,0.18)" : "transparent",
                color: activeTab === "about" ? "#93c5fd" : "#ffffff",
                border: "none",
                padding: "13px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                borderBottom: activeTab === "about" ? "3px solid #38bdf8" : "3px solid transparent",
                transition: "all 0.15s ease"
              }}
            >
              <Info size={15} /> About METRAVISION
            </motion.button>

            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTabChange("platform")}
              style={{
                background: activeTab === "platform" ? "rgba(255,255,255,0.18)" : "transparent",
                color: activeTab === "platform" ? "#93c5fd" : "#ffffff",
                border: "none",
                padding: "13px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                borderBottom: activeTab === "platform" ? "3px solid #38bdf8" : "3px solid transparent",
                transition: "all 0.15s ease"
              }}
            >
              <Layers size={15} /> Platform Details & Architecture
            </motion.button>

          </div>

          {/* Right Status Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0" }}>
            <span style={{ 
              fontSize: "11px", 
              background: "rgba(255, 255, 255, 0.12)", 
              color: "#e2e8f0", 
              padding: "4px 10px", 
              borderRadius: "12px", 
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              border: "1px solid rgba(255,255,255,0.18)" 
            }}>
              <Scale size={12} color="#fdba74" />
              <span>DCA Gazette 2026 Compliant</span>
            </span>
          </div>

        </div>
      </motion.nav>

      {/* Main Content Body with Tab Switching */}
      <main style={{ flex: 1, padding: "24px 20px", maxWidth: "1360px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Secondary Visual Tab Controller */}
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          borderBottom: "2px solid #e2e8f0", 
          paddingBottom: "8px", 
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleTabChange("overview")}
              style={{
                background: activeTab === "overview" ? "#0c3b6b" : "#ffffff",
                color: activeTab === "overview" ? "#ffffff" : "#475569",
                border: activeTab === "overview" ? "1px solid #0c3b6b" : "1px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTab === "overview" ? "0 2px 6px rgba(12, 59, 107, 0.2)" : "none"
              }}
            >
              <HomeIcon size={14} /> Overview & Quick Launch
            </button>

            <button
              onClick={() => handleTabChange("rules")}
              style={{
                background: activeTab === "rules" ? "#0c3b6b" : "#ffffff",
                color: activeTab === "rules" ? "#ffffff" : "#475569",
                border: activeTab === "rules" ? "1px solid #0c3b6b" : "1px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTab === "rules" ? "0 2px 6px rgba(12, 59, 107, 0.2)" : "none"
              }}
            >
              <BookOpen size={14} /> PCR 2011 Rules Repository
              <span style={{ 
                fontSize: "10.5px", 
                background: activeTab === "rules" ? "#38bdf8" : "#e0f2fe", 
                color: activeTab === "rules" ? "#002147" : "#0369a1", 
                padding: "1px 6px", 
                borderRadius: "10px", 
                fontWeight: 800 
              }}>
                24 Rules
              </span>
            </button>

            <button
              onClick={() => handleTabChange("about")}
              style={{
                background: activeTab === "about" ? "#0c3b6b" : "#ffffff",
                color: activeTab === "about" ? "#ffffff" : "#475569",
                border: activeTab === "about" ? "1px solid #0c3b6b" : "1px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTab === "about" ? "0 2px 6px rgba(12, 59, 107, 0.2)" : "none"
              }}
            >
              <Info size={14} /> About METRAVISION
            </button>

            <button
              onClick={() => handleTabChange("platform")}
              style={{
                background: activeTab === "platform" ? "#0c3b6b" : "#ffffff",
                color: activeTab === "platform" ? "#ffffff" : "#475569",
                border: activeTab === "platform" ? "1px solid #0c3b6b" : "1px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTab === "platform" ? "0 2px 6px rgba(12, 59, 107, 0.2)" : "none"
              }}
            >
              <Layers size={14} /> Platform Architecture & Pipeline
            </button>
          </div>

          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            {activeTab === "rules" && `Displaying ${filteredRules.length} of ${rulesList.length} Statutory Rules`}
            {activeTab === "overview" && "Legal Metrology Act, 2009 & Jan Vishwas Act, 2023"}
            {activeTab === "about" && "Ministry of Consumer Affairs, Food & Public Distribution"}
            {activeTab === "platform" && "Neural Optical Perception & Compliance Engine"}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <motion.div
            key="tab-overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: "28px" }}
          >
            {/* Main Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ 
                background: "linear-gradient(135deg, #002147 0%, #0c3b6b 100%)", 
                color: "#ffffff", 
                borderRadius: "12px", 
                padding: "36px 30px", 
                boxShadow: "0 6px 18px rgba(0, 33, 71, 0.18)", 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
                gap: "28px", 
                alignItems: "center",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 153, 51, 0.22)", border: "1px solid #FF9933", color: "#fdba74", padding: "4px 12px", borderRadius: "4px", fontSize: "11.5px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>
                  <Scale size={14} /> Legal Metrology Act, 2009 & PCR 2011 Enforcement
                </div>
                <h1 style={{ fontSize: "28px", fontWeight: 900, lineHeight: 1.25, margin: "0 0 14px 0", letterSpacing: "-0.5px" }}>
                  National Packaged Commodity Compliance & Enforcement Platform
                </h1>
                <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 22px 0" }}>
                  The official <strong>METRAVISION</strong> platform empowers Legal Metrology Officers, Regulators, and Commercial Stakeholders with optical neural verification, automated statutory rule matching across all 24 mandates, and transparent civil compounding penalty assessment under the Jan Vishwas Act, 2023.
                </p>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <motion.button 
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/enforcement/inspect")}
                    style={{ background: "#FF9933", color: "#002147", border: "none", padding: "11px 22px", borderRadius: "6px", fontSize: "13.5px", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    <Camera size={16} /> Launch Statutory Inspection
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTabChange("rules")}
                    style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)", padding: "11px 20px", borderRadius: "6px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <BookOpen size={16} /> View All 24 Rules (Tab)
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/enforcement/cases")}
                    style={{ background: "transparent", color: "#e2e8f0", border: "1px solid #94a3b8", padding: "11px 18px", borderRadius: "6px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <FileText size={16} /> Case Register
                  </motion.button>
                </div>
              </div>

              {/* Demonstration Graphic */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                style={{ background: "rgba(255, 255, 255, 0.07)", border: "1px solid rgba(255, 255, 255, 0.16)", borderRadius: "10px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", backdropFilter: "blur(4px)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.12)", paddingBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#93c5fd", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={14} /> Statutory Verification Demonstration
                  </span>
                  <span style={{ fontSize: "11px", background: "#166534", color: "#ffffff", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>LIVE ENGINE</span>
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <img src={chipsImg} alt="Package Sample" style={{ width: "96px", height: "96px", objectFit: "contain", background: "#ffffff", borderRadius: "8px", padding: "4px", border: "1px solid rgba(255,255,255,0.2)" }} />
                  <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#e2e8f0" }}>
                    <div><strong>Commodity:</strong> Sana Roasted Coconut Chips (140g)</div>
                    <div><strong>MRP:</strong> ₹95.00 (Incl. of all taxes) <span style={{ color: "#86efac", fontWeight: 700 }}>[COMPLIANT]</span></div>
                    <div><strong>Net Quantity:</strong> 140 g (SI Metric) <span style={{ color: "#86efac", fontWeight: 700 }}>[COMPLIANT]</span></div>
                    <div><strong>Unit Sale Price:</strong> ₹0.68 / g <span style={{ color: "#86efac", fontWeight: 700 }}>[COMPLIANT]</span></div>
                  </div>
                </div>

                <div style={{ background: "rgba(22, 101, 52, 0.35)", border: "1px solid #16a34a", padding: "8px 12px", borderRadius: "6px", fontSize: "11.5px", color: "#86efac", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={15} /> All 8 mandatory declarations conform to Rule 6(1) & Schedule IV.
                </div>
              </motion.div>
            </motion.div>

            {/* Official Enforcement Modules & Field Command Tiles */}
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0c3b6b", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#0c3b6b" /> Official Enforcement Modules & Field Command
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {quickLinks.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0,0,0,0.06)" }}
                    className="gov-card" 
                    style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: `4px solid ${item.color}` }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "4px", background: `${item.color}15`, color: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <item.icon size={16} />
                        </div>
                        <h3 style={{ fontSize: "15px", fontWeight: 800, color: item.color, margin: 0 }}>
                          {item.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={item.action ? item.action : () => navigate(item.path)}
                      style={{
                        background: item.color,
                        color: "#ffffff",
                        border: "none",
                        padding: "9px 14px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        marginTop: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      {item.btnText}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Statutory Responsibility Framework */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "18px 20px", display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <ShieldAlert size={24} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#92400e", margin: "0 0 4px 0" }}>
                  Statutory Penalties & Compounding Provisions (Legal Metrology Act, 2009 & Jan Vishwas Act, 2023)
                </h4>
                <p style={{ fontSize: "12px", color: "#78350f", margin: 0, lineHeight: 1.55 }}>
                  • <strong>Section 36(1):</strong> Penalty up to ₹25,000 for 1st offence, ₹50,000 for 2nd offence, and up to ₹1,00,000 for subsequent offences for packaging non-conformities.<br />
                  • <strong>Section 36(2):</strong> Prohibition on selling pre-packaged goods at prices exceeding declared Maximum Retail Price (MRP).<br />
                  • <strong>Section 39 & Rule 27:</strong> Mandatory registration of all Manufacturers, Packers, and Importers with the Director/Controller of Legal Metrology.<br />
                  • <strong>Section 49:</strong> Offences by companies and nomination of directors responsible for compliance.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: PCR 2011 RULES REPOSITORY (SHOWING ALL 24 RULES) */}
        {activeTab === "rules" && (
          <motion.div
            key="tab-rules"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Rules Header Box */}
            <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "22px 24px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>
                    <Scale size={13} /> Official Statutory Repository • DCA Gazette 2026
                  </div>
                  <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", margin: "0 0 6px 0" }}>
                    Legal Metrology (Packaged Commodities) Rules, 2011 — Complete Statutory Provisions
                  </h2>
                  <p style={{ fontSize: "13px", color: "#475569", margin: 0, maxWidth: "1000px", lineHeight: 1.55 }}>
                    Comprehensive statutory register containing all <strong>24 codified provisions (LM-PC-001 to LM-PC-024)</strong> under Sections 18, 36(1), 36(2), 48, and 49 of The Legal Metrology Act, 2009. Includes Schedule IV numeral height scales, e-commerce pre-checkout disclosures, and decriminalized compounding penalties under the Jan Vishwas Act, 2023.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <a
                    href="https://consumeraffairs.gov.in/pages/legal-metrology-act"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#f1f5f9",
                      color: "#0c3b6b",
                      border: "1px solid #cbd5e1",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    DCA Official Portal <ExternalLink size={13} />
                  </a>

                  <button
                    onClick={() => navigate("/enforcement/inspect")}
                    className="btn-gov-primary"
                    style={{ padding: "8px 14px", fontSize: "12px" }}
                  >
                    <Camera size={13} /> Test Rules in Inspection
                  </button>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginTop: "18px", paddingTop: "18px", borderTop: "1px solid #f1f5f9" }}>
                
                {/* Search Bar */}
                <div style={{ position: "relative" }}>
                  <Search size={16} color="#64748b" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    value={ruleSearch}
                    onChange={(e) => setRuleSearch(e.target.value)}
                    placeholder="Search by Rule ID (e.g. LM-PC-001), Field (mrp, net_quantity), or keyword..."
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 36px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Severity Filter */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Filter size={15} color="#64748b" />
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", whiteSpace: "nowrap" }}>Severity:</span>
                  <select
                    value={ruleSeverity}
                    onChange={(e) => setRuleSeverity(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12.5px",
                      background: "#ffffff",
                      outline: "none"
                    }}
                  >
                    <option value="all">All Severities</option>
                    <option value="CRITICAL">CRITICAL (e.g. Anti-Profiteering, Dual MRP)</option>
                    <option value="HIGH">HIGH (MRP, Net Qty, COO, Manufacturer)</option>
                    <option value="MEDIUM">MEDIUM (Batch, Customer Care, QR Code)</option>
                  </select>
                </div>

              </div>

              {/* Category Pills */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "14px" }}>
                {[
                  { id: "all", label: `All Rules (${rulesList.length})` },
                  { id: "mandatory", label: "Mandatory PDP Declarations" },
                  { id: "food", label: "Food & Edible Oils" },
                  { id: "electronics", label: "Electronics & QR" },
                  { id: "imported", label: "Imported Commodities" },
                  { id: "ecom", label: "E-Commerce & Digital" },
                  { id: "medical", label: "Medical Devices" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRuleCategory(tab.id)}
                    style={{
                      background: ruleCategory === tab.id ? "#0c3b6b" : "#f1f5f9",
                      color: ruleCategory === tab.id ? "#ffffff" : "#475569",
                      border: ruleCategory === tab.id ? "1px solid #0c3b6b" : "1px solid #e2e8f0",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules List Indicator */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px", color: "#64748b" }}>
              <div>
                Showing <strong>{filteredRules.length}</strong> of {rulesList.length} Statutory Provisions
                {ruleCategory !== "all" && <span style={{ color: "#0284c7" }}> (Filtered by category)</span>}
                {ruleSeverity !== "all" && <span style={{ color: "#b45309" }}> (Filtered by {ruleSeverity} severity)</span>}
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" }}></span>
                <span>Active in Automated Verification Engine</span>
              </div>
            </div>

            {/* Rules Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
              {filteredRules.map((rule) => {
                const sevStyle = getSeverityBadgeStyle(rule.severity);
                return (
                  <motion.div
                    key={rule.rule_id}
                    whileHover={{ y: -3, boxShadow: "0 6px 16px rgba(0,0,0,0.06)" }}
                    style={{
                      background: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px",
                      position: "relative"
                    }}
                  >
                    <div>
                      {/* Card Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", fontWeight: 900, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px" }}>
                            {rule.rule_id}
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                            {rule.rule_reference}
                          </span>
                        </div>
                        <span style={{ fontSize: "10.5px", fontWeight: 800, padding: "2px 7px", borderRadius: "4px", ...sevStyle }}>
                          {rule.severity}
                        </span>
                      </div>

                      {/* Rule Title */}
                      <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", lineHeight: 1.35 }}>
                        {rule.title}
                      </h3>

                      {/* Regulated Field Pill */}
                      {rule.field && (
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#334155", padding: "2px 7px", borderRadius: "4px", fontFamily: "monospace", fontWeight: 600 }}>
                            Field: {rule.field}
                          </span>
                        </div>
                      )}

                      {/* Statutory Requirement */}
                      <p style={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.5, margin: "0 0 10px 0" }}>
                        {rule.requirement}
                      </p>

                      {/* Font / Numeral Height Specification */}
                      {rule.character_height && (
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "8px 10px", fontSize: "11.5px", color: "#475569", marginBottom: "8px" }}>
                          <strong style={{ color: "#0c3b6b" }}>Numeral / Font Standard:</strong> {rule.character_height}
                        </div>
                      )}

                      {/* Penalty Information */}
                      <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "6px", padding: "8px 10px", fontSize: "11.5px", color: "#92400e" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 800, marginBottom: "2px" }}>
                          <IndianRupee size={12} /> Compounding Penalty (Jan Vishwas Act, 2023):
                        </div>
                        <div>{rule.penalty_range}</div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "10px", marginTop: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                        {rule.act_section}
                      </span>
                      <button
                        onClick={() => navigate("/enforcement/inspect")}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#0284c7",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0
                        }}
                      >
                        Inspect Goods <ChevronRight size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredRules.length === 0 && (
              <div style={{ background: "#ffffff", borderRadius: "8px", border: "1px dashed #cbd5e1", padding: "40px 20px", textAlign: "center" }}>
                <AlertCircle size={36} color="#94a3b8" style={{ margin: "0 auto 10px auto" }} />
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#334155", margin: "0 0 6px 0" }}>
                  No statutory rules match the selected criteria
                </h4>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px 0" }}>
                  Try adjusting your search query or reset the category and severity filters.
                </p>
                <button
                  onClick={() => {
                    setRuleSearch("");
                    setRuleCategory("all");
                    setRuleSeverity("all");
                  }}
                  className="btn-gov-primary"
                  style={{ padding: "8px 16px", fontSize: "12.5px" }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: ABOUT METRAVISION */}
        {activeTab === "about" && (
          <motion.div
            key="tab-about"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "32px 30px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", background: "#e0f2fe", padding: "3px 8px", borderRadius: "4px" }}>
                  STATUTORY FOUNDATION • LEGAL METROLOGY ACT, 2009
                </span>
              </div>
              
              <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", margin: "0 0 12px 0" }}>
                About METRAVISION : National Legal Metrology Intelligence System
              </h2>

              <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.65, margin: "0 0 24px 0", maxWidth: "1100px" }}>
                Established in alignment with the statutory directives of the <strong>Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution</strong> (<a href="https://consumeraffairs.gov.in/pages/legal-metrology-act" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", fontWeight: 700 }}>consumeraffairs.gov.in</a>), METRAVISION digitizes and automates the enforcement of <strong>The Legal Metrology Act, 2009 (Act No. 1 of 2010)</strong> and the <strong>Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)</strong> across India.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                
                <motion.div 
                  whileHover={{ y: -3 }}
                  style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                    <ShieldCheck size={22} />
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0c3b6b", margin: "0 0 8px 0" }}>
                    Consumer Protection & Price Transparency
                  </h3>
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, margin: 0 }}>
                    Guarantees transparent Maximum Retail Price (MRP) declarations, prevents deceptive pack sizing, eliminates dual MRP practices, and enforces clear Unit Sale Price (USP) per gram or millilitre across retail and e-commerce.
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3 }}
                  style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#ecfdf5", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                    <Camera size={22} />
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#166534", margin: "0 0 8px 0" }}>
                    Optical AI & Real-Time Label Perception
                  </h3>
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, margin: 0 }}>
                    Processes live device camera feeds and packaging photos through multi-pass neural OCR, extracting mandatory declarations, dates, numerals, and manufacturer credentials in sub-second inference.
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3 }}
                  style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                    <Scale size={22} />
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#b45309", margin: "0 0 8px 0" }}>
                    Compounding & Liability Allocation
                  </h3>
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, margin: 0 }}>
                    Implements decriminalized compounding penalty schedules under the Jan Vishwas Act, 2023, accurately assigning accountability between Manufacturers, Packers, Importers, and E-Commerce Platforms.
                  </p>
                </motion.div>

              </div>

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Legal Metrology Act, 2009 (Act No. 1 of 2010) • Section 18, 36, 48, 49
                </span>
                <button
                  onClick={() => handleTabChange("rules")}
                  className="btn-gov-primary"
                  style={{ padding: "8px 16px", fontSize: "12.5px" }}
                >
                  Explore PCR 2011 Rules Repository →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PLATFORM DETAILS & ARCHITECTURE */}
        {activeTab === "platform" && (
          <motion.div
            key="tab-platform"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "32px 30px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", background: "#e0f2fe", padding: "3px 8px", borderRadius: "4px", display: "inline-block", marginBottom: "6px" }}>
                    ARCHITECTURE & REGULATORY SPECIFICATIONS
                  </div>
                  <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", margin: 0 }}>
                    Platform Details & 4-Stage Enforcement Pipeline
                  </h2>
                </div>
                
                <span style={{ fontSize: "11px", fontWeight: 800, background: "#ecfdf5", color: "#047857", padding: "4px 10px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
                  NIC Gov Gateway Active • TLS 1.3
                </span>
              </div>

              <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: 1.6, margin: "0 0 24px 0" }}>
                METRAVISION integrates neural optical perception, automated statutory validation rules, dynamic entity liability allocation, and formal administrative memo generation into a seamless legal metrology workflow.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
                {platformPillars.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -4 }}
                    style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", position: "relative" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: 900, color: "#0c3b6b", background: "#e0f2fe", padding: "2px 8px", borderRadius: "4px" }}>
                        {item.step}
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                        {item.tag}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
                      {item.title}
                    </h4>

                    <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.55, margin: 0 }}>
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#64748b" }}>
                <div>
                  <strong>Security & Governance:</strong> 256-bit Encrypted Evidence Vault • Form VI Statutory Clearance Seals
                </div>
                <div>
                  <strong>Authority:</strong> Ministry of Consumer Affairs, Food & Public Distribution, New Delhi
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Official Government Footer */}
      <footer style={{ background: "#002147", color: "#cbd5e1", padding: "28px 20px 18px 20px", borderTop: "3px solid #FF9933", fontSize: "12px" }}>
        <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "13.5px" }}>Legal Metrology Division</div>
            <div style={{ color: "#94a3b8", marginTop: "4px" }}>Ministry of Consumer Affairs, Food & Public Distribution</div>
            <div style={{ color: "#94a3b8" }}>Government of India • Krishi Bhawan, New Delhi - 110001</div>
            <div style={{ color: "#38bdf8", marginTop: "6px", fontSize: "11.5px" }}>
              National Consumer Helpline: 1915 • DCA Legal Metrology Portal
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#ffffff", fontWeight: 700, marginBottom: "6px" }}>Enforcement Modules</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Link to="/enforcement/dashboard" style={{ color: "#cbd5e1", textDecoration: "none" }}>Enforcement Dashboard</Link>
                <Link to="/enforcement/inspect" style={{ color: "#cbd5e1", textDecoration: "none" }}>Field Inspection</Link>
                <Link to="/enforcement/cases" style={{ color: "#cbd5e1", textDecoration: "none" }}>Case Register</Link>
                <Link to="/enforcement/responsible-parties" style={{ color: "#cbd5e1", textDecoration: "none" }}>Commercial Entities</Link>
              </div>
            </div>

            <div>
              <div style={{ color: "#ffffff", fontWeight: 700, marginBottom: "6px" }}>Statutory Knowledge</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <button 
                  onClick={() => handleTabChange("rules")} 
                  style={{ background: "none", border: "none", padding: 0, color: "#cbd5e1", textAlign: "left", cursor: "pointer", fontSize: "12px" }}
                >
                  PCR 2011 Rules (24) Tab
                </button>
                <a href="https://consumeraffairs.gov.in/pages/legal-metrology-act" target="_blank" rel="noopener noreferrer" style={{ color: "#cbd5e1", textDecoration: "none" }}>DCA Acts & Gazettes ↗</a>
                <Link to="/login" style={{ color: "#cbd5e1", textDecoration: "none" }}>Official Portal Login</Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1360px", margin: "20px auto 0 auto", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center", fontSize: "11px", color: "#64748b" }}>
          Designed & Maintained for Legal Metrology Enforcement • Hosted on Secure Government Infrastructure | National Informatics Centre (NIC)
        </div>
      </footer>
    </div>
  );
};

export default Home;
