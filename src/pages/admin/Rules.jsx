import React from "react";

const Rules = () => {
  const pcrRules = [
    { code: "Rule 18", title: "M.R.P. Declaration", description: "Every package must bear the Maximum Retail Price (MRP) inclusive of all taxes in Indian currency." },
    { code: "Rule 19", title: "Declaration of Net Quantity", description: "Net quantity in terms of standard unit of weight, measure, or number must be declared on every package." },
    { code: "Rule 20", title: "Identity & Address of Manufacturer / Packer", description: "Name and complete address of the manufacturer or importer/packer must be clearly stated." },
    { code: "Rule 21", title: "Month and Year of Packing", description: "The month and year in which the commodity was manufactured, packed, or imported must be marked." },
    { code: "Rule 26", title: "Exemptions for Industrial Consumers", description: "Packages meant exclusively for industrial or institutional consumers are exempted from standard retail declarations." },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          📜 Legal Metrology (Packaged Commodities) Rules, 2011
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Statutory compliance guidelines, regulatory provisions, and mandatory declarations framework.
        </p>
      </div>

      {/* Rules List Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
        {pcrRules.map((rule, idx) => (
          <div key={idx} style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", borderTop: "4px solid #0284c7" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#0284c7", textTransform: "uppercase", marginBottom: "4px" }}>
              {rule.code}
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px 0" }}>
              {rule.title}
            </h3>
            <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: "1.5", margin: 0 }}>
              {rule.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Rules;