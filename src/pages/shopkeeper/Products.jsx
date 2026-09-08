import React from "react";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();

  // Mock registered inventory data
  const inventoryList = [
    { id: "PROD-101", name: "Sana Coconut Chips (140g)", category: "Packaged Foods", mrp: 120.00, netQty: "140g", batch: "SC-892", status: "Compliant" },
    { id: "PROD-102", name: "Organic Whole Wheat Flour", category: "Grocery & Staples", mrp: 340.00, netQty: "5 kg", batch: "WF-410", status: "Compliant" },
    { id: "PROD-103", name: "Pure Mustard Oil Bottle", category: "Beverages & Oils", mrp: 185.00, netQty: "1 Litre", batch: "MO-102", status: "Pending Review" },
    { id: "PROD-104", name: "Premium Darjeeling Tea", category: "Grocery & Staples", mrp: 250.00, netQty: "250g", batch: "DT-554", status: "Compliant" },
    { id: "PROD-105", name: "Herbal Aloe Vera Gel", category: "Cosmetics", mrp: 150.00, netQty: "200ml", batch: "AG-099", status: "Compliant" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
            📋 Registered Products Inventory
          </h1>
          <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
            Manage declared commodities, pricing tags, and Legal Metrology standards.
          </p>
        </div>

        <button
          onClick={() => navigate("/shopkeeper/add-product")}
          style={{ background: "#ffffff", color: "#0c3b6b", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          ➕ Register New Commodity →
        </button>
      </div>

      {/* Inventory Table Container */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Active Stock Declarations ({inventoryList.length} Items)
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            PCR Rules, 2011 Verified
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>Product ID & Name</th>
                <th style={{ padding: "14px 20px" }}>Category</th>
                <th style={{ padding: "14px 20px" }}>MRP (₹)</th>
                <th style={{ padding: "14px 20px" }}>Net Qty</th>
                <th style={{ padding: "14px 20px" }}>Batch #</th>
                <th style={{ padding: "14px 20px" }}>Compliance Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                    {item.name}
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>ID: {item.id}</div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{item.category}</td>
                  <td style={{ padding: "14px 20px", fontWeight: 800, color: "#0f172a" }}>₹ {item.mrp.toFixed(2)}</td>
                  <td style={{ padding: "14px 20px" }}>{item.netQty}</td>
                  <td style={{ padding: "14px 20px", fontFamily: "monospace", color: "#0284c7", fontWeight: 600 }}>{item.batch}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: item.status === "Compliant" ? "#f0fdf4" : "#fef3c7",
                      color: item.status === "Compliant" ? "#166534" : "#92400e"
                    }}>
                      {item.status === "Compliant" ? "✔ Compliant" : "⚠️ Pending Review"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button 
                      onClick={() => alert(`Viewing details for ${item.name}`)}
                      style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0c3b6b", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default Products;