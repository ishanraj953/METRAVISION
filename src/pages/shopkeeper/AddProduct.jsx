import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: "",
    category: "Grocery & Staples",
    mrp: "",
    netQuantity: "",
    packerName: "",
    packerAddress: "",
    monthYearPacking: "",
    consumerCareEmail: "",
    consumerCarePhone: "",
    batchNumber: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate("/shopkeeper/dashboard");
    }, 1500);
  };

  return (
    <div style={{ padding: "28px", maxWidth: "900px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          📦 Register New Packaged Commodity
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Ensure all mandatory declarations comply with Legal Metrology (Packaged Commodities) Rules, 2011.
        </p>
      </div>

      {submitted ? (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "30px", borderRadius: "12px", textAlign: "center", color: "#166534" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>✔ Commodity Registered Successfully!</h2>
          <p style={{ fontSize: "13px", margin: 0 }}>Redirecting to Retailer Command Dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: "#ffffff", padding: "28px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Commodity Name & Description *
              </label>
              <input 
                type="text" 
                name="productName" 
                required
                placeholder="e.g., Organic Basmati Rice (5kg)"
                value={formData.productName}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#f8fafc" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Retail Category *
              </label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#f8fafc", cursor: "pointer" }}
              >
                <option value="Grocery & Staples">Grocery & Staples</option>
                <option value="Packaged Foods">Packaged Foods & Snacks</option>
                <option value="Beverages & Oils">Beverages & Edible Oils</option>
                <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
                <option value="Household Cleaners">Household Cleaners</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Maximum Retail Price (MRP ₹) *
              </label>
              <input 
                type="number" 
                name="mrp" 
                required
                placeholder="e.g., 450"
                value={formData.mrp}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#f8fafc" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Net Quantity / Weight *
              </label>
              <input 
                type="text" 
                name="netQuantity" 
                required
                placeholder="e.g., 5 kg / 1 Litre"
                value={formData.netQuantity}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#f8fafc" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Month / Year of Packing *
              </label>
              <input 
                type="text" 
                name="monthYearPacking" 
                required
                placeholder="e.g., 08/2026"
                value={formData.monthYearPacking}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#f8fafc" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Name & Address of Manufacturer / Packer *
              </label>
              <textarea 
                name="packerAddress" 
                required
                rows="3"
                placeholder="Enter complete corporate entity name and manufacturing unit address..."
                value={formData.packerAddress}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#f8fafc", resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Consumer Care Contact / Email *
                </label>
                <input 
                  type="text" 
                  name="consumerCareEmail" 
                  required
                  placeholder="support@manufacturer.com"
                  value={formData.consumerCareEmail}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#f8fafc" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Batch / Lot Number *
                </label>
                <input 
                  type="text" 
                  name="batchNumber" 
                  required
                  placeholder="e.g., LOT-2026-XYZ"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#f8fafc" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "18px" }}>
            <button
              type="button"
              onClick={() => navigate("/shopkeeper/dashboard")}
              style={{ background: "#e2e8f0", color: "#334155", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(12,59,107,0.2)" }}
            >
              Save & Verify Compliance →
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default AddProduct;