import React, { useState, useEffect } from "react";
import { productService } from "../../services/products";

const CheckerProducts = () => {
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
      console.error("Failed to load products:", err);
      // Fallback mock data if backend is offline
      setProducts([
        { id: 1, name: "Lotte Coffy Bite", category: "Confectionery", mrp: "₹5.00", status: "Compliant" },
        { id: 2, name: "Generic Energy Drink", category: "Beverages", mrp: "₹120.00", status: "Under Review" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0c3b6b", marginBottom: "6px" }}>
        Registered Commodities Directory
      </h1>
      <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "20px" }}>
        Audit and review registered packaged commodities for Legal Metrology compliance.
      </p>

      {loading ? (
        <div style={{ color: "#64748b", fontSize: "13px" }}>Loading inventory data...</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "12px 16px" }}>Product Name</th>
                <th style={{ padding: "12px 16px" }}>Category</th>
                <th style={{ padding: "12px 16px" }}>MRP</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1e293b" }}>{p.name || p.productName}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{p.category || "Packaged Food"}</td>
                  <td style={{ padding: "12px 16px", color: "#047857", fontWeight: 600 }}>{p.mrp || "₹5.00"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: "#f0fdf4",
                      color: "#166534",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      fontSize: "11px"
                    }}>
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

export default CheckerProducts;