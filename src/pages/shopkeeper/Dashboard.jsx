import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useInspection } from "../../context/InspectionContext";

const ShopkeeperDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { complaints } = useInspection();

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Injected Hover & Glow Effects */}
      <style>{`
        .shopkeeper-btn {
          transition: all 0.2s ease-in-out;
        }
        .shopkeeper-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          background: #f8fafc !important;
          color: #0c3b6b !important;
        }
        .action-card {
          transition: all 0.2s ease-in-out;
        }
        .action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border-color: #38bdf8 !important;
        }
      `}</style>

      {/* Official Business Clearance Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "16px", padding: "24px 32px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(12, 59, 107, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
            RETAIL COMPLIANCE & PACKAGED COMMODITIES DESK
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "8px 0 4px 0" }}>
            Welcome, {user?.name || "Gupta Kirana & Daily Needs"}
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>
            Maintain mandatory declarations under Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <button
          onClick={() => navigate("/shopkeeper/dashboard")}
          className="shopkeeper-btn"
          style={{ background: "#ffffff", color: "#0c3b6b", border: "none", padding: "12px 22px", borderRadius: "10px", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          ➕ Register New Commodity →
        </button>
      </div>

      {/* Compliance Overview Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginBottom: "24px" }}>
        
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #16a34a", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Overall Compliance Score</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#16a34a", margin: "6px 0 2px 0" }}>92.4%</div>
          <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>PCR 2011 Standards Met</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #0284c7", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Registered Products</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: "6px 0 2px 0" }}>38 Items</div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 600 }}>Active in retail inventory</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #d97706", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Pending Audits</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#d97706", margin: "6px 0 2px 0" }}>2 Items</div>
          <div style={{ fontSize: "11px", color: "#b45309", fontWeight: 600 }}>Scheduled for verification</div>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #dc2626", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Active Violations / Notices</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#dc2626", margin: "6px 0 2px 0" }}>0</div>
          <div style={{ fontSize: "11px", color: "#b91c1c", fontWeight: 600 }}>No compounding fines pending</div>
        </div>

      </div>

      {/* Main Content Sections: Quick Actions & Recent Inventory Audit */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Quick Portal Shortcuts */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
            Retailer Management Operations
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            <div className="action-card" style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0c3b6b" }}>📦 My Registered Products Inventory</div>
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>View declared net weight, MRP, and packer details</div>
              </div>
              <span style={{ fontWeight: 800, color: "#0c3b6b" }}>→</span>
            </div>

            <div className="action-card" style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0c3b6b" }}>🔍 Self-Scan Package Compliance Checker</div>
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>Test product labels against PCR 2011 before inspection</div>
              </div>
              <span style={{ fontWeight: 800, color: "#0c3b6b" }}>→</span>
            </div>

            <div className="action-card" style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0c3b6b" }}>📜 Compliance & Compounding History</div>
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>Review past inspection reports and fine settlements</div>
              </div>
              <span style={{ fontWeight: 800, color: "#0c3b6b" }}>→</span>
            </div>

          </div>
        </div>

        {/* Recent Inventory Status */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
            Recent Inventory Declarations
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            
            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>Sana Coconut Chips (140g)</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>MRP: ₹ 120.00 • Batch #SC-892</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", background: "#f0fdf4", color: "#166534" }}>
                ✔ Compliant
              </span>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>Organic Whole Wheat Flour (5kg)</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>MRP: ₹ 340.00 • Batch #WF-410</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", background: "#f0fdf4", color: "#166534" }}>
                ✔ Compliant
              </span>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>Pure Mustard Oil (1L Bottle)</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>MRP: ₹ 185.00 • Batch #MO-102</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", background: "#fef3c7", color: "#92400e" }}>
                ⚠️ Pending Review
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default ShopkeeperDashboard;