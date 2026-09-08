import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInspection } from "../../context/InspectionContext";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { complaints } = useInspection();
  const { user } = useAuth();

  // All India Zones & Target Shops Database
  const allIndiaZonesData = {
    "Maharashtra - Mumbai (Andheri West Circle)": [
      { id: "SHOP-501", shopName: "Reliance Smart Bazaar", area: "Andheri West, Mumbai", category: "Supermarket", status: "Pending Audit", risk: "HIGH" },
      { id: "SHOP-502", shopName: "Shree Ganesh Kirana & General", area: "Andheri West, Mumbai", category: "Retail Store", status: "Scheduled", risk: "MEDIUM" },
      { id: "SHOP-503", shopName: "Apex Medical & Cosmetics", area: "Juhu Scheme, Mumbai", category: "Pharmacy", status: "Completed", risk: "LOW" },
    ],
    "Andhra Pradesh - Guntur (Central Market Circle)": [
      { id: "SHOP-601", shopName: "Sharma Supermarket", area: "Main Market, Ring Road, Guntur", category: "Hypermarket", status: "Pending Audit", risk: "HIGH" },
      { id: "SHOP-602", shopName: "Andhra Daily Needs & Provisions", area: "Brodipet, Guntur", category: "Grocery", status: "Scheduled", risk: "MEDIUM" },
    ],
    "Delhi NCR - New Delhi (Connaught Place Circle)": [
      { id: "SHOP-701", shopName: "Modern Bazaar & Foods", area: "Connaught Place, New Delhi", category: "Supermarket", status: "Pending Audit", risk: "CRITICAL" },
      { id: "SHOP-702", shopName: "CP General Store", area: "Janpath, New Delhi", category: "Retail Store", status: "Completed", risk: "LOW" },
    ],
    "Karnataka - Bengaluru (Koramangala Circle)": [
      { id: "SHOP-801", shopName: "Natures Basket Organic", area: "Koramangala 4th Block, Bengaluru", category: "Gourmet Retail", status: "Pending Audit", risk: "HIGH" },
      { id: "SHOP-802", shopName: "Silicon City Provision Store", area: "BTM Layout, Bengaluru", category: "Grocery", status: "Scheduled", risk: "MEDIUM" },
    ],
    "Tamil Nadu - Chennai (T. Nagar Circle)": [
      { id: "SHOP-901", shopName: "Saravana Super Stores Hub", area: "T. Nagar, Chennai", category: "Department Store", status: "Pending Audit", risk: "CRITICAL" },
      { id: "SHOP-902", shopName: "Marina Daily Fresh", area: "Mylapore, Chennai", category: "Retail Store", status: "Scheduled", risk: "MEDIUM" },
    ],
    "Telangana - Hyderabad (Banjara Hills Circle)": [
      { id: "SHOP-101", shopName: "Ratnadeep Supermarket", area: "Road No. 12, Banjara Hills, Hyderabad", category: "Supermarket", status: "Pending Audit", risk: "HIGH" },
      { id: "SHOP-102", shopName: "Hyderabad General Provisions", area: "Jubilee Hills, Hyderabad", category: "Grocery", status: "Completed", risk: "LOW" },
    ]
  };

  const zoneKeys = Object.keys(allIndiaZonesData);
  const [selectedZone, setSelectedZone] = useState(zoneKeys[0]);

  const assignedTargets = allIndiaZonesData[selectedZone] || [];

  // Calculate live stats
  const totalInspections = 48 + complaints.length;
  const violationsFound = 12 + complaints.filter(c => c.violations?.length > 0).length;
  const compliantCount = totalInspections - violationsFound;
  const totalFinesImposed = 115000 + complaints.reduce((acc, curr) => acc + (curr.penaltyAmount || 0), 0);

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Unique Hover & Interactive CSS Stylesheet Injection */}
      <style>{`
        .scanner-btn-glow {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .scanner-btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.4) !important;
          background: #f8fafc !important;
          color: #0284c7 !important;
        }
        .shop-row-card {
          transition: all 0.2s ease-in-out;
        }
        .shop-row-card:hover {
          transform: translateX(4px);
          background: #eff6ff !important;
          border-color: #93c5fd !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
        }
        .shortcut-card {
          transition: all 0.2s ease-in-out;
        }
        .shortcut-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }
      `}</style>

      {/* Live GPS & Jurisdictional Clearance Strip */}
      <div style={{
        background: "#0f172a",
        color: "#38bdf8",
        padding: "8px 18px",
        borderRadius: "8px",
        fontSize: "11.5px",
        fontWeight: 700,
        marginBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
          <span>ALL-INDIA JURISDICTION HUB: <strong>{selectedZone}</strong></span>
        </div>
        <div style={{ color: "#94a3b8" }}>
          Terminal ID: <span style={{ color: "#f8fafc" }}>SECURE-CHK-109</span> | Authorization: <span style={{ color: "#22c55e" }}>Active</span>
        </div>
      </div>

      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)",
        borderRadius: "16px",
        padding: "24px 32px",
        color: "#ffffff",
        marginBottom: "24px",
        boxShadow: "0 10px 25px -5px rgba(12, 59, 107, 0.3)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
            CENTRAL ENFORCEMENT COMMAND • PAN-INDIA
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "8px 0 4px 0" }}>
            Welcome back, {user?.name || "Inspector CHK-109"}
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>
            Executing All-India targeted inspections under Legal Metrology Rules, 2011.
          </p>
        </div>

        <button
          onClick={() => navigate("/checker/scan")}
          className="scanner-btn-glow"
          style={{
            background: "#ffffff",
            color: "#0c3b6b",
            border: "none",
            padding: "12px 22px",
            borderRadius: "10px",
            fontWeight: 800,
            fontSize: "13.5px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          📷 Launch Field Scanner →
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "24px" }}>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #0284c7" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Assigned Targets</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: "6px 0 2px 0" }}>{assignedTargets.length} Shops</div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 600 }}>Active Circle Queue</div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #dc2626" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Violations Found</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#dc2626", margin: "6px 0 2px 0" }}>{violationsFound}</div>
          <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600 }}>PCR 2011 Contraventions</div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid #16a34a" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Compliant Packets</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#16a34a", margin: "6px 0 2px 0" }}>{compliantCount}</div>
          <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>Standard Match</div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #7c2d12 0%, #b91c1c 100%)", padding: "18px", borderRadius: "14px", color: "#ffffff" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#fca5a5", textTransform: "uppercase" }}>Total Fines Imposed</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", margin: "6px 0 2px 0" }}>₹ {totalFinesImposed.toLocaleString("en-IN")}</div>
          <div style={{ fontSize: "11px", color: "#fdba74", fontWeight: 600 }}>⚡ Revenue Generated</div>
        </div>
      </div>

      {/* All-India Jurisdictional Target Queue with Custom Hover Scroll */}
      <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              🛡️ All-India Jurisdictional Target Queue (Select Circle)
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
              Choose any state or major metropolitan circle across India to load authorized target shops.
            </p>
          </div>

          {/* Styled Select Box */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "12.5px",
              fontWeight: 700,
              background: "#f8fafc",
              color: "#0c3b6b",
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 2px 5px rgba(0,0,0,0.04)"
            }}
          >
            {zoneKeys.map((zoneName) => (
              <option key={zoneName} value={zoneName} style={{ padding: "10px", background: "#ffffff", color: "#0f172a" }}>
                {zoneName}
              </option>
            ))}
          </select>
        </div>

        {/* Scrollable Shop List Container with Smooth Hover Effects */}
        <div style={{
          maxHeight: "260px",
          overflowY: "auto",
          paddingRight: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          {assignedTargets.map((shop, idx) => (
            <div 
              key={idx} 
              className="shop-row-card"
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "14px 18px", 
                background: "#f8fafc", 
                borderRadius: "10px", 
                border: "1px solid #e2e8f0", 
                flexWrap: "wrap", 
                gap: "10px",
                cursor: "pointer"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>{shop.shopName}</span>
                  <span style={{ fontSize: "10.5px", background: "#e2e8f0", color: "#334155", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>{shop.category}</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0 0" }}>📍 {shop.area} • ID: {shop.id}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: shop.status === "Completed" ? "#f0fdf4" : "#fef3c7",
                  color: shop.status === "Completed" ? "#166534" : "#92400e"
                }}>
                  {shop.status}
                </span>

                <button
                  onClick={() => navigate("/checker/scan")}
                  style={{
                    background: "#0c3b6b",
                    color: "#fff",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(12,59,107,0.2)"
                  }}
                >
                  Start Inspection →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Recent Activity & Shortcuts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
        
        {/* Recent Activity */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Recent Field Inspection Dossiers
            </h3>
            <button 
              onClick={() => navigate("/checker/inspections")}
              style={{ background: "none", border: "none", color: "#0284c7", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              View All →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {complaints.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                No active field cases recorded in this session. Select a target above and launch scanner.
              </div>
            ) : (
              complaints.slice(0, 4).map((c, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{c.shopName}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{c.productName} • {c.timestamp}</div>
                  </div>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: c.violations?.length > 0 ? "#fef2f2" : "#f0fdf4",
                    color: c.violations?.length > 0 ? "#991b1b" : "#166534"
                  }}>
                    {c.violations?.length > 0 ? `⚠️ ${c.violations.length} Violation(s)` : "✔ Compliant"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shortcuts */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>
            Field Operations Shortcuts
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div 
              onClick={() => navigate("/checker/scan")}
              className="shortcut-card"
              style={{ padding: "12px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e3a8a" }}>📷 Scan Commodity Package</div>
                <div style={{ fontSize: "11px", color: "#3b82f6" }}>Multi-angle evidence capture & OCR</div>
              </div>
              <span style={{ fontWeight: 800, color: "#2563eb" }}>→</span>
            </div>

            <div 
              onClick={() => navigate("/checker/riskintelligence")}
              className="shortcut-card"
              style={{ padding: "12px 14px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>⚡ Risk Intelligence Matrix</div>
                <div style={{ fontSize: "11px", color: "#d97706" }}>High-risk retail zones & hotspots</div>
              </div>
              <span style={{ fontWeight: 800, color: "#d97706" }}>→</span>
            </div>

            <div 
              onClick={() => navigate("/checker/repeatoffenders")}
              className="shortcut-card"
              style={{ padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#991b1b" }}>🚨 Repeat Offenders Database</div>
                <div style={{ fontSize: "11px", color: "#dc2626" }}>Escalated penalty records</div>
              </div>
              <span style={{ fontWeight: 800, color: "#dc2626" }}>→</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;