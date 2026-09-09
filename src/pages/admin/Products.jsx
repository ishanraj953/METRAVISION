import React, { useState, useEffect } from "react";
import { productService } from "../../services/products";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      // Fallback mock data if backend offline
      setProducts([
        { id: 1, name: "Sana Coconut Chips (140g)", category: "Confectionery", mrp: "₹ 50.00", status: "Compliant" },
        { id: "M-2", name: "Lotte Choco Pie Box", category: "Packaged Sweets", mrp: "₹ 150.00", status: "Under Review" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "28px 36px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", marginBottom: "6px" }}>
        Registered Packaged Commodities Directory
      </h1>
      <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "24px" }}>
        Central registry of commercial products verified under Legal Metrology Packaged Commodities Rules 2011.
      </p>

      {loading ? (
        <div style={{ fontSize: "13px", color: "#64748b" }}>Loading product registry...</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "12px 18px" }}>Product Name</th>
                <th style={{ padding: "12px 18px" }}>Category</th>
                <th style={{ padding: "12px 18px" }}>MRP Declared</th>
                <th style={{ padding: "12px 18px" }}>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 18px", fontWeight: 700, color: "#1e293b" }}>{p.name || p.productName}</td>
                  <td style={{ padding: "12px 18px", color: "#64748b" }}>{p.category || "Packaged Food"}</td>
                  <td style={{ padding: "12px 18px", color: "#047857", fontWeight: 700 }}>{p.mrp || "₹ 50.00"}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <span style={{ background: "#f0fdf4", color: "#166534", padding: "3px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "11px", border: "1px solid #86efac" }}>
                      {p.status || "Compliant"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;