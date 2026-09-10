import React, { useState, useEffect } from "react";
import { 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  FileText, 
  Filter, 
  Sparkles, 
  Layers, 
  Building2, 
  IndianRupee,
  RefreshCw,
  BookOpen
} from "lucide-react";
import API from "../../services/api";

import { BUILTIN_RULES_24 } from "../../data/statutoryRules";


const Rules = () => {
  const [rulesList, setRulesList] = useState(BUILTIN_RULES_24);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        const res = await API.get("/compliance/rules");
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Normalize API response to unified shape
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
        console.warn("Using built-in 24 statutory rules fallback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const CATEGORY_TABS = [
    { id: "all", label: `All Rules (${rulesList.length})` },
    { id: "general", label: "Mandatory Declarations" },
    { id: "food", label: "Food & Edible Oils" },
    { id: "electronics", label: "Electronics & IT" },
    { id: "imported", label: "Imported Goods" },
    { id: "ecom", label: "E-Commerce & Digital" },
    { id: "units", label: "Weights & SI Units" }
  ];

  const filteredRules = rulesList.filter((r) => {
    const categories = r.category.map(c => String(c).toUpperCase());
    
    let matchesCat = true;
    if (selectedCategory === "general") {
      matchesCat = categories.includes("GENERAL");
    } else if (selectedCategory === "food") {
      matchesCat = categories.some(c => c.includes("FOOD") || c.includes("EDIBLE"));
    } else if (selectedCategory === "electronics") {
      matchesCat = categories.some(c => c.includes("ELEC"));
    } else if (selectedCategory === "imported") {
      matchesCat = categories.some(c => c.includes("IMPORT"));
    } else if (selectedCategory === "ecom") {
      matchesCat = categories.some(c => c.includes("E_COMMERCE") || c.includes("ECOM"));
    } else if (selectedCategory === "units") {
      matchesCat = r.field === "net_quantity" || r.field === "unit_sale_price" || r.field === "numeral_height" || r.field === "standard_pack_size";
    }

    const matchesSeverity = selectedSeverity === "all" || r.severity.toUpperCase() === selectedSeverity.toUpperCase();

    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      r.rule_id.toLowerCase().includes(searchLower) ||
      r.rule_reference.toLowerCase().includes(searchLower) ||
      r.title.toLowerCase().includes(searchLower) ||
      r.requirement.toLowerCase().includes(searchLower) ||
      r.act_section.toLowerCase().includes(searchLower) ||
      r.field.toLowerCase().includes(searchLower) ||
      r.penalty_range.toLowerCase().includes(searchLower);

    return matchesCat && matchesSeverity && matchesSearch;
  });

  const getSeverityStyle = (severity) => {
    const s = String(severity).toUpperCase();
    if (s === "CRITICAL") {
      return { bg: "#fef2f2", color: "#991b1b", border: "#fca5a5" };
    }
    if (s === "MEDIUM") {
      return { bg: "#f0fdf4", color: "#166534", border: "#86efac" };
    }
    return { bg: "#fefce8", color: "#854d0e", border: "#fde047" };
  };

  return (
    <div style={{ padding: "28px 36px", fontFamily: "Segoe UI, -apple-system, sans-serif", maxWidth: "1500px", margin: "0 auto" }}>
      
      {/* Top Header Banner */}
      <div style={{ 
        background: "linear-gradient(135deg, #0c3b6b 0%, #0369a1 100%)", 
        borderRadius: "14px", 
        padding: "26px 32px", 
        color: "#ffffff", 
        marginBottom: "22px", 
        boxShadow: "0 6px 20px rgba(12, 59, 107, 0.25)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", right: "-30px", top: "-30px", opacity: 0.08, pointerEvents: "none" }}>
          <Scale size={240} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", background: "rgba(255,255,255,0.18)", padding: "3px 8px", borderRadius: "4px", color: "#93c5fd" }}>
                DEPARTMENT OF CONSUMER AFFAIRS • CENTRAL REPOSITORY (PILLAR 3)
              </span>
              <span style={{ fontSize: "10.5px", fontWeight: 800, background: "#16a34a", color: "#ffffff", padding: "3px 8px", borderRadius: "4px" }}>
                JAN VISHWAS ACT, 2023 COMPLIANT
              </span>
            </div>

            <h1 style={{ fontSize: "26px", fontWeight: 900, margin: "6px 0 6px 0", letterSpacing: "-0.5px" }}>
              Legal Metrology (Packaged Commodities) Rules, 2011
            </h1>

            <p style={{ fontSize: "13px", opacity: 0.94, margin: 0, maxWidth: "900px", lineHeight: "1.5" }}>
              Official statutory compliance rulebook, category applicability matrix, mandatory declaration specifications, numeral height standards, and decriminalized compounding civil penalty slabs.
            </p>
          </div>

          <a 
            href="https://consumeraffairs.gov.in/pages/legal-metrology-act" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              color: "#0c3b6b",
              fontWeight: 800,
              fontSize: "12px",
              padding: "10px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              flexShrink: 0
            }}
          >
            Official DCA Legal Metrology Portal <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Statutory Metrics Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "22px" }}>
        
        <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Statutory Rules</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b" }}>24 Provisions</div>
            <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>100% PCR 2011 Gazette Coverage</div>
          </div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#ecfdf5", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Mandatory PDP Declarations</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#166534" }}>8 Core Fields</div>
            <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>Rule 6(1)(a) to 6(1)(n)</div>
          </div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Scale size={22} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Primary Act Sections</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#b45309" }}>Sec 18, 36(1), 36(2)</div>
            <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>r/w Sections 48, 49, 52</div>
          </div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Compounding Penalty Max</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#b91c1c" }}>₹1,00,000</div>
            <div style={{ fontSize: "11px", color: "#b91c1c", fontWeight: 600 }}>Jan Vishwas Act, 2023 Slabs</div>
          </div>
        </div>

      </div>

      {/* Filters and Search Bar */}
      <div style={{ 
        background: "#ffffff", 
        borderRadius: "12px", 
        border: "1px solid #e2e8f0", 
        padding: "16px 20px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        flexWrap: "wrap", 
        gap: "14px", 
        marginBottom: "22px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)" 
      }}>
        
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? "#0c3b6b" : "#f1f5f9",
                color: selectedCategory === cat.id ? "#ffffff" : "#475569",
                border: "1px solid",
                borderColor: selectedCategory === cat.id ? "#0c3b6b" : "#cbd5e1",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Severity Filter */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "12px",
              fontWeight: 600,
              background: "#ffffff",
              color: "#334155",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
          </select>

          <div style={{ position: "relative", minWidth: "280px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search by Rule, Section, Keyword, or Field..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "9px 14px 9px 34px", 
                borderRadius: "6px", 
                border: "1px solid #cbd5e1", 
                fontSize: "12.5px", 
                outline: "none", 
                background: "#f8fafc" 
              }}
            />
          </div>

        </div>

      </div>

      {/* Results Header Counter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
        <div>
          Showing <span style={{ fontWeight: 800, color: "#0c3b6b" }}>{filteredRules.length}</span> of {rulesList.length} Statutory Legal Metrology Provisions
        </div>
        {(searchTerm || selectedCategory !== "all" || selectedSeverity !== "all") && (
          <button
            onClick={() => { setSelectedCategory("all"); setSelectedSeverity("all"); setSearchTerm(""); }}
            style={{ background: "none", border: "none", color: "#0284c7", fontWeight: 700, cursor: "pointer", fontSize: "12px" }}
          >
            Clear Active Filters ✕
          </button>
        )}
      </div>

      {/* Rulebook Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "18px" }}>
        {filteredRules.map((item, idx) => {
          const sevStyle = getSeverityStyle(item.severity);
          return (
            <div 
              key={idx} 
              style={{ 
                background: "#ffffff", 
                borderRadius: "12px", 
                border: "1px solid #e2e8f0", 
                padding: "20px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between",
                transition: "transform 0.15s ease, box-shadow 0.15s ease"
              }}
            >
              <div>
                
                {/* Rule Header Badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 900, color: "#0c3b6b", background: "#e0f2fe", padding: "3px 8px", borderRadius: "4px", border: "1px solid #bae6fd" }}>
                      {item.rule_id}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#0369a1", background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px" }}>
                      {item.rule_reference.split("read with")[0].trim()}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: sevStyle.color, background: sevStyle.bg, border: `1px solid ${sevStyle.border}`, padding: "2px 7px", borderRadius: "4px" }}>
                      {item.severity}
                    </span>
                  </div>

                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    PCR 2011 STATUTORY
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                  {item.title}
                </h3>

                {/* Regulated Field & Act Section Pill */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px", fontSize: "11px" }}>
                  <span style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
                    Field: <strong style={{ color: "#0c3b6b" }}>{item.field}</strong>
                  </span>
                  <span style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
                    Act Section: <strong style={{ color: "#0369a1" }}>{item.act_section}</strong>
                  </span>
                </div>

                {/* Requirement Text */}
                <p style={{ fontSize: "12.5px", color: "#334155", lineHeight: "1.55", margin: "0 0 14px 0" }}>
                  {item.requirement}
                </p>
              </div>

              {/* Specifications & Statutory Penalties */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                
                <div style={{ fontSize: "11.5px", color: "#0369a1", marginBottom: "6px", lineHeight: "1.4" }}>
                  <strong>Font & Numerals Specification:</strong> {item.character_height}
                </div>

                <div style={{ 
                  background: "#fff1f2", 
                  border: "1px solid #fecdd3", 
                  borderRadius: "6px", 
                  padding: "8px 10px", 
                  fontSize: "11.5px", 
                  color: "#9f1239",
                  lineHeight: "1.4"
                }}>
                  <strong style={{ color: "#881337" }}>Statutory Penalty (Jan Vishwas Act, 2023):</strong> {item.penalty_range}
                </div>

                <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "8px", fontStyle: "italic" }}>
                  Source: {item.source}
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Rules;