import React, { useState, useEffect } from "react";
import violationService from "../../services/violations";
import productService from "../../services/products";

const ShopkeeperViolation = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allViols, myProds] = await Promise.all([
        violationService.getAllViolations().catch(() => []),
        productService.getProducts().catch(() => [])
      ]);
      const myProductIds = new Set((myProds || []).map(p => p.id));
      const relevant = (allViols || []).filter(v => myProductIds.has(v.product_id));
      setViolations(relevant);
    } catch (err) {
      console.error("Error loading shopkeeper violations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0c3b6b", marginBottom: "6px" }}>
        PCR Violations & Regulatory Notices
      </h1>
      <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "20px" }}>
        Review regulatory notices, label discrepancies, and penalty instructions issued under Legal Metrology Rules.
      </p>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading compliance status...</div>
      ) : violations.length === 0 ? (
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>Notice Status: All Clear</div>
            <span style={{ background: "#f0fdf4", color: "#166534", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "11px", border: "1px solid #86efac" }}>
              No Active Violations
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#334155", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            Your inventory meets standard Packaged Commodities Rules (PCR 2011) compliance guidelines. No active penalty notices found against your retail location.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {violations.map((v) => (
            <div key={v.id} style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #fecaca", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991b1b" }}>
                  Violation #{v.violation_code || v.id} • SKU Reference #{v.product_id}
                </div>
                <span style={{ background: "#fef2f2", color: "#991b1b", padding: "4px 10px", borderRadius: "6px", fontWeight: 800, fontSize: "11px", border: "1px solid #fca5a5" }}>
                  {v.severity} • {v.status}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
                <strong>Field:</strong> {v.field?.toUpperCase()} • <strong>Observed Value:</strong> {v.observed_value || 'Missing/Non-compliant'}
              </div>
              <div style={{ fontSize: "11.5px", color: "#7f1d1d", background: "#fef2f2", padding: "8px 12px", borderRadius: "6px", border: "1px solid #fee2e2" }}>
                <strong>Statutory Citation:</strong> {v.rule_citation || "Rule 6(1), Legal Metrology (Packaged Commodities) Rules, 2011"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopkeeperViolation;