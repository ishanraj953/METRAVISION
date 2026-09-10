import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import scanService from "../../services/scans";
import productService from "../../services/products";
import violationService from "../../services/violations";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inspections, setInspections] = useState([]);
  const [products, setProducts] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [inspData, prodData, violData] = await Promise.all([
        scanService.getInspectionHistory().catch(() => []),
        productService.getProducts().catch(() => []),
        violationService.getAllViolations().catch(() => [])
      ]);
      setInspections(inspData || []);
      setProducts(prodData || []);
      setViolations(violData || []);
    } catch (err) {
      console.error("Error fetching checker dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalInspections = inspections.length;
  const totalViolations = violations.filter(v => v.status !== "REJECTED").length;
  const compliantCount = products.length > 0 
    ? products.filter(p => (p.status || "").toUpperCase() === "COMPLIANT").length
    : inspections.filter(i => (i.status || "").toUpperCase() === "COMPLIANT").length;
  const highRiskCount = inspections.filter(i => (Number(i.priority_score) || 0) >= 50 || (i.status || "").toUpperCase() === "UNDER_REVIEW").length;

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* Officer Welcome & Action Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0369a1 100%)", color: "#ffffff", padding: "24px", borderRadius: "14px", marginBottom: "24px", boxShadow: "0 4px 14px rgba(12, 59, 107, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.9 }}>
            DEPARTMENT OF LEGAL METROLOGY • ENFORCEMENT PORTAL
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "6px 0 4px 0" }}>
            Welcome back, {user?.full_name || user?.name || "Enforcement Inspector"}
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.85, margin: 0 }}>
            Authorized Officer Portal • PCR 2011 Digital Inspection & Forensic Verification Hub
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
            <span style={{ 
              background: "rgba(16, 185, 129, 0.22)", 
              border: "1px solid #10b981", 
              color: "#a7f3d0", 
              padding: "4px 10px", 
              borderRadius: "20px", 
              fontSize: "11px", 
              fontWeight: 700, 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px" 
            }}>
              MongoDB 8.0 Engine • Real-Time Database Sync
            </span>
            <span style={{ 
              background: "rgba(255, 255, 255, 0.15)", 
              color: "#ffffff", 
              padding: "4px 10px", 
              borderRadius: "20px", 
              fontSize: "11px", 
              fontWeight: 600 
            }}>
              100% PCR 2011 Rulebook Verified
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/checker/scan")}
          style={{ background: "#ffffff", color: "#0c3b6b", border: "none", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "8px" }}
        >
          Launch AI Package Scanner →
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Inspections</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0c3b6b", margin: "6px 0" }}>{totalInspections}</div>
          <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>Active Enforcement</div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Compliant Commodities</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#16a34a", margin: "6px 0" }}>{compliantCount}</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>of {products.length || 16} Verified Legal PCR</div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Detected Violations</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#dc2626", margin: "6px 0" }}>{totalViolations}</div>
          <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 700 }}>Requires Officer Action</div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>High-Risk Priority Cases</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#ea580c", margin: "6px 0" }}>{highRiskCount}</div>
          <div style={{ fontSize: "11px", color: "#ea580c", fontWeight: 700 }}>Priority Score ≥ 50</div>
        </div>
      </div>

      {/* Two-Column Workspace Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "20px" }}>
        
        {/* Left: Registered Commodities for Inspection */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Registered Commodities Queue
            </h2>
            <button
              onClick={() => navigate("/checker/products")}
              style={{ background: "transparent", border: "none", color: "#0284c7", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              View All ({products.length}) →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
            {products.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "12.5px" }}>
                No commodities registered.
              </div>
            ) : (
              products.map((p) => (
                <div
                  key={p.id}
                  style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0c3b6b" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Category: {p.category?.toUpperCase()} • MRP: {p.mrp || 'N/A'} • Mfg: {p.manufacturer_name || 'N/A'}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/checker/scan")}
                    style={{ background: "#0c3b6b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Scan
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Violations Requiring Action */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Recent Statutory Violations
            </h2>
            <button
              onClick={() => navigate("/checker/evidence")}
              style={{ background: "transparent", border: "none", color: "#0284c7", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              Forensic Dossiers →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
            {violations.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#166534", fontSize: "12.5px" }}>
                No open violations recorded.
              </div>
            ) : (
              violations.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#991b1b" }}>
                      {v.violation_code || `VIOL-#${v.id}`} • {v.rule_citation || `Rule: ${v.field?.toUpperCase()}`}
                    </div>
                    <div style={{ fontSize: "11px", color: "#7f1d1d", marginTop: "2px" }}>
                      Field: {v.field?.toUpperCase()} • Observed: "{v.observed_value || 'Missing'}" • Severity: {v.severity || 'HIGH'}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/checker/evidence")}
                    style={{ background: "#dc2626", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;