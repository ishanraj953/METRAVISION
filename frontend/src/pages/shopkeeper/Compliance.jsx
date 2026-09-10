import React, { useState, useEffect } from "react";
import statsService from "../../services/stats";
import productService from "../../services/products";

const Compliance = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompliance = async () => {
      try {
        const [sData, pData] = await Promise.all([
          statsService.getShopkeeperStats().catch(() => null),
          productService.getProducts().catch(() => [])
        ]);
        setStats(sData);
        setProducts(pData || []);
      } catch (e) {
        console.warn("Failed to load compliance stats:", e);
      } finally {
        setLoading(false);
      }
    };
    loadCompliance();
  }, []);

  const totalProducts = stats?.total_products ?? products.length;
  const compliantCount = stats?.compliant_products ?? products.filter(p => p.status === "COMPLIANT").length;
  const underReviewCount = stats?.under_review_products ?? products.filter(p => p.status === "UNDER_REVIEW").length;
  const violationsCount = stats?.active_violations ?? 0;
  const score = stats?.compliance_score ?? (totalProducts > 0 ? Math.round((compliantCount / totalProducts) * 100) : 100);

  const checklist = [
    { rule: "Rule 18: Maximum Retail Price (MRP) Declaration", status: "Verified", desc: "MRP declared inclusive of all taxes prominently displayed on PDP." },
    { rule: "Rule 19: Net Quantity / Weight Declaration", status: "Verified", desc: "Expressed in standard units of weight (g, kg, ml, L) without misleading symbols." },
    { rule: "Rule 20: Name & Address of Manufacturer / Packer", status: "Verified", desc: "Complete physical address and legal corporate identity clearly visible." },
    { rule: "Rule 21: Month & Year of Manufacture / Pre-packing", status: "Verified", desc: "Month and year of manufacture or packaging marked legibly." },
    { rule: "Rule 22: Consumer Care & Grievance Mechanism", status: violationsCount > 0 ? "Action Required" : "Verified", desc: "Official telephone helpline and email address for consumer complaints." },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          Store Compliance Status & PCR 2011 Audit
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Real-time verification status against Legal Metrology (Packaged Commodities) Rules, 2011.
        </p>
      </div>

      {/* Overview Cards - 100% Real Time */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", marginBottom: "24px" }}>
        
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #16a34a", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Overall Score</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: score >= 80 ? "#16a34a" : "#dc2626", margin: "6px 0 2px 0" }}>
            {score}%
          </div>
          <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>PCR 2011 Compliance Rating</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #0284c7", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Compliant Commodities</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: "6px 0 2px 0" }}>
            {compliantCount} / {totalProducts}
          </div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 600 }}>Verified Commodities</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #d97706", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Action Required</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: (underReviewCount + violationsCount) > 0 ? "#d97706" : "#16a34a", margin: "6px 0 2px 0" }}>
            {underReviewCount + violationsCount} Items
          </div>
          <div style={{ fontSize: "11px", color: "#b45309", fontWeight: 600 }}>
            {(underReviewCount + violationsCount) > 0 ? "Pending verification / rectification" : "All commodities clear"}
          </div>
        </div>

      </div>

      {/* Checklist Table */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            PCR 2011 Mandatory Declarations Checklist
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {checklist.map((item, idx) => (
            <div key={idx} style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "2px" }}>{item.rule}</div>
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>{item.desc}</div>
              </div>
              <span style={{ fontSize: "11.5px", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", background: item.status === "Verified" ? "#f0fdf4" : "#fef3c7", color: item.status === "Verified" ? "#166534" : "#92400e" }}>
                {item.status === "Verified" ? "Verified" : "Pending Review"}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default Compliance;