import React, { useState } from "react";

const ScanProduct = () => {
  const [barcode, setBarcode] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    // Mock verification logic based on barcode input
    setScanResult({
      name: "Organic Whole Wheat Flour (5kg)",
      mrp: "₹ 340.00 (Inclusive of all taxes)",
      netQty: "5 kg",
      packer: "Patanjali Foods Ltd, Haridwar, Uttarakhand",
      batch: barcode,
      status: "COMPLIANT",
      message: "All mandatory declarations under PCR 2011 verified successfully."
    });
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
          🔍 Self-Scan Package Compliance Checker
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Simulate barcode scanning to verify retail inventory against Legal Metrology Rules, 2011.
        </p>
      </div>

      {/* Search Input Box */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", marginBottom: "24px" }}>
        <form onSubmit={handleScan} style={{ display: "flex", gap: "12px" }}>
          <input 
            type="text" 
            placeholder="Enter Barcode / Batch Number (e.g., WF-410 or SC-892)..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#f8fafc" }}
          />
          <button 
            type="submit"
            style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "0 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(12,59,107,0.2)" }}
          >
            Scan & Verify →
          </button>
        </form>
      </div>

      {/* Scan Results Card */}
      {scanResult && (
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", padding: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>
                {scanResult.name}
              </h3>
              <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>Batch: {scanResult.batch}</span>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 800, padding: "6px 14px", borderRadius: "8px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
              ✔ {scanResult.status}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", fontSize: "13px" }}>
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>MAXIMUM RETAIL PRICE</div>
              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "15px" }}>{scanResult.mrp}</div>
            </div>
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>NET QUANTITY DECLARATION</div>
              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "15px" }}>{scanResult.netQty}</div>
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px", fontSize: "12.5px" }}>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, marginBottom: "2px" }}>PACKER / MANUFACTURER DETAILS</div>
            <div style={{ color: "#1e293b", fontWeight: 600 }}>{scanResult.packer}</div>
          </div>

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "8px", color: "#166534", fontSize: "12.5px", fontWeight: 600 }}>
            💡 {scanResult.message}
          </div>

        </div>
      )}

    </div>
  );
};

export default ScanProduct;