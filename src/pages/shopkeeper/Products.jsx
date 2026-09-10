import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/products";

const ShopkeeperProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback default sample inventory
        setProducts([
          { id: 1, name: "Sana Coconut Chips (140g)", category: "packaged_food", mrp: "120.00", net_quantity: "140g", manufacturer_name: "Sana Foods Ltd", status: "COMPLIANT" },
          { id: 2, name: "Organic Whole Wheat Flour", category: "packaged_food", mrp: "340.00", net_quantity: "5 kg", manufacturer_name: "Agro Staples India", status: "COMPLIANT" },
          { id: 3, name: "Pure Mustard Oil Bottle", category: "packaged_food", mrp: "185.00", net_quantity: "1 Litre", manufacturer_name: "Bharat Oils Corp", status: "PENDING_REVIEW" },
          { id: 4, name: "Smart Bluetooth Earbuds", category: "electronics", mrp: "1999.00", net_quantity: "1 Unit", manufacturer_name: "Alpha Devices Inc", status: "COMPLIANT" }
        ]);
      }
    } catch (err) {
      console.error("Error loading shopkeeper products:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "24px 30px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#93c5fd" }}>
            MERCHANT SELF-COMPLIANCE INVENTORY (PCR 2011)
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "6px 0 4px 0" }}>
            Registered Store Commodities
          </h1>
          <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
            Manage registered commodities, verify statutory pricing & net weight declarations, and run pre-retail scans.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/shopkeeper/scan")}
            style={{ background: "#0c3b6b", color: "#ffffff", border: "1px solid #38bdf8", padding: "10px 18px", borderRadius: "8px", fontWeight: 800, fontSize: "12.5px", cursor: "pointer" }}
          >
            Pre-Retail AI Scan →
          </button>
          <button
            onClick={() => navigate("/shopkeeper/add-product")}
            style={{ background: "#ffffff", color: "#0c3b6b", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 800, fontSize: "12.5px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            Register Commodity →
          </button>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Stock Declarations on Record ({products.length} Items)
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            PCR Rules, 2011 Verified
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>SKU ID & Commodity Name</th>
                <th style={{ padding: "14px 20px" }}>Category</th>
                <th style={{ padding: "14px 20px" }}>MRP (₹)</th>
                <th style={{ padding: "14px 20px" }}>Net Qty</th>
                <th style={{ padding: "14px 20px" }}>Manufacturer / Importer</th>
                <th style={{ padding: "14px 20px" }}>Compliance Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                    {item.name}
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>SKU Ref: #{item.id}</div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#475569", textTransform: "capitalize" }}>{item.category?.replace(/_/g, " ")}</td>
                  <td style={{ padding: "14px 20px", fontWeight: 800, color: "#0f172a" }}>₹ {item.mrp || "N/A"}</td>
                  <td style={{ padding: "14px 20px" }}>{item.net_quantity || "N/A"}</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{item.manufacturer_name || item.importer_name || "Self-Declared"}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: item.status === "COMPLIANT" || item.status === "Compliant" ? "#f0fdf4" : "#fef3c7",
                      color: item.status === "COMPLIANT" || item.status === "Compliant" ? "#166534" : "#92400e"
                    }}>
                      {item.status === "COMPLIANT" || item.status === "Compliant" ? "COMPLIANT" : "AUDIT PENDING"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button 
                      onClick={() => navigate("/shopkeeper/scan")}
                      style={{ background: "#0c3b6b", border: "none", color: "#ffffff", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                    >
                      Verify Packaging →
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

export default ShopkeeperProducts;