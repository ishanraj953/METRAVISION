import React, { useState } from "react";
import { useInspection } from "../../context/InspectionContext";

const Evidence = () => {
  const { complaints } = useInspection();
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [activeImageModal, setActiveImageModal] = useState(null); // <-- State for Image Popup Modal

  const evidenceList = [
    {
      id: "EVD-884102",
      caseId: "MEMO-LM-884102",
      shopName: "Sharma Supermarket",
      location: "Main Market, Ring Road, Guntur, AP",
      timestamp: "08 Sep 2026, 14:28 IST",
      inspector: "CHECKER Officer (CHK-109)",
      product: "Vicks VapoRub Topical Jar (25ml)",
      ocrStatus: "Failed (Font Height < 2mm)",
      gpsCoordinates: "16.3067° N, 80.4365° E",
      images: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80"
      ],
      violationsDetected: ["Rule 6(1)(c) - Net Quantity Metric Font Height Defect", "Rule 6(1)(d) - Expiry Date Partial Blur"]
    },
    {
      id: "EVD-992140",
      caseId: "MEMO-LM-992140",
      shopName: "Sai Electronics & General",
      location: "Station Road, Guntur, AP",
      timestamp: "07 Sep 2026, 11:15 IST",
      inspector: "CHECKER Officer (CHK-109)",
      product: "Ariel Matic Detergent Powder (1kg)",
      ocrStatus: "Passed",
      gpsCoordinates: "16.3120° N, 80.4400° E",
      images: [
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80"
      ],
      violationsDetected: ["Fully Compliant - PCR 2011 Verified"]
    }
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif", position: "relative" }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
            Digital Evidence Review & Forensic Dossiers
          </h1>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
            Inspect geo-tagged photographic evidence, OCR scan logs, and violation proofs captured during field checks.
          </p>
        </div>

        <div>
          <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "6px 14px", borderRadius: "14px", fontWeight: 700 }}>
            Total Evidence Logs: {evidenceList.length + complaints.length}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "24px" }}>
        
        {/* Left: Evidence Dossier Cards */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
            📁 Captured Evidence Dossiers
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "500px", overflowY: "auto" }}>
            {evidenceList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedEvidence(item)}
                style={{
                  padding: "14px",
                  background: selectedEvidence?.id === item.id ? "#f0fdf4" : "#f8fafc",
                  borderRadius: "10px",
                  border: selectedEvidence?.id === item.id ? "1px solid #22c55e" : "1px solid #cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#0c3b6b" }}>{item.id}</span>
                  <span style={{ fontSize: "10.5px", background: item.ocrStatus.includes("Failed") ? "#fef2f2" : "#f0fdf4", color: item.ocrStatus.includes("Failed") ? "#991b1b" : "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                    {item.ocrStatus}
                  </span>
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b", margin: "4px 0" }}>{item.shopName}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Product: {item.product}</div>
                <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "4px" }}>📍 {item.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Forensic Inspector Vault */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>
            🔍 Forensic Media & Telemetry Vault
          </h3>

          {!selectedEvidence ? (
            <div style={{ padding: "100px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
              👈 Select an evidence dossier from the left to inspect geo-tagged photos and OCR analysis logs.
            </div>
          ) : (
            <div>
              {/* Meta Info */}
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div><strong>Case ID:</strong> {selectedEvidence.caseId}</div>
                <div><strong>Inspector:</strong> {selectedEvidence.inspector}</div>
                <div><strong>GPS Tag:</strong> {selectedEvidence.gpsCoordinates}</div>
                <div><strong>OCR Verdict:</strong> {selectedEvidence.ocrStatus}</div>
              </div>

              {/* Photo Gallery with Click-to-Zoom */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Captured Package Photos (Click to Zoom):</div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {selectedEvidence.images.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Evidence Zoomable"
                      onClick={() => setActiveImageModal(imgUrl)}
                      title="Click to enlarge photo"
                      style={{ width: "140px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "2px solid #cbd5e1", cursor: "pointer", transition: "transform 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    />
                  ))}
                </div>
              </div>

              {/* Violations Tag List */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", marginBottom: "6px" }}>Recorded Violations Breakdown:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedEvidence.violationsDetected.map((v, idx) => (
                    <div key={idx} style={{ fontSize: "11.5px", background: "#fef2f2", color: "#991b1b", padding: "6px 10px", borderRadius: "6px", border: "1.5px solid #fca5a5", fontWeight: 600 }}>
                      ⚠️ {v}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Image Lightbox Modal Popup */}
      {activeImageModal && (
        <div 
          onClick={() => setActiveImageModal(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "zoom-out"
          }}
        >
          <div style={{ position: "relative", background: "#fff", padding: "12px", borderRadius: "10px", maxWidth: "90vw", maxHeight: "90vh", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveImageModal(null)}
              style={{ position: "absolute", top: "-14px", right: "-14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "50%", width: "32px", height: "32px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
            >
              ✕
            </button>
            <img 
              src={activeImageModal} 
              alt="Enlarged Forensic Proof" 
              style={{ maxWidth: "80vw", maxHeight: "75vh", objectFit: "contain", borderRadius: "6px", display: "block" }} 
            />
            <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", fontWeight: 700, color: "#1e293b", fontFamily: "Segoe UI, sans-serif" }}>
              🔬 Legal Metrology Forensic Evidence Zoom View • PCR 2011 Compliance Check
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Evidence;