import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInspection } from "../../context/InspectionContext";
import { useAuth } from "../../context/AuthContext";

const SLOTS = [
  { id: "front", label: "Front Panel", desc: "Brand Logo & Front Art" },
  { id: "back", label: "Back Panel", desc: "Ingredients & Importer Details" },
  { id: "side1", label: "Side Panel 1", desc: "Classic Branding View" },
  { id: "side2", label: "Side Panel 2", desc: "MRP, Net Wt, Customer Care & Date" },
];

const ScanProduct = () => {
  const navigate = useNavigate();
  const { addComplaint } = useInspection();
  const { user } = useAuth();

  const [photos, setPhotos] = useState({ front: null, back: null, side1: null, side2: null });
  const [activeSlot, setActiveSlot] = useState("front");
  const [slotTexts, setSlotTexts] = useState({ front: "", back: "", side1: "", side2: "" });

  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("Ready");
  const [scanResult, setScanResult] = useState(null);
  const [submittedId, setSubmittedId] = useState(null);

  const [shopDetails, setShopDetails] = useState({
    shopName: "Sharma Supermarket",
    location: "Main Market, Ring Road, Guntur, AP",
    batchNo: "NK11-2026"
  });

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  // Dynamic Legal Metrology PCR 2011 Rule Evaluator with Real Validation
  const evaluateLegalMetrologyRules = (combinedText) => {
    const clean = combinedText.replace(/[\r\n\t]+/g, " ").toLowerCase();
    
    // Check for blur or empty input
    if (!clean || clean.length < 5) {
      return {
        isEmpty: true,
        productName: "Unrecognized / Empty Scan",
        declarations: [],
        violations: ["Image unreadable or empty scan area."],
        recommendedPenalty: 1000,
        isCompliant: false,
        status: "Needs Review"
      };
    }

    let violations = [];
    let declarations = [];

    // 1. MRP Check
    const hasMrp = clean.includes("mrp") || clean.includes("₹") || clean.includes("rs");
    declarations.push({
      field: "MRP Declaration",
      status: hasMrp ? "PASS" : "FAIL",
      value: hasMrp ? "Detected" : "Missing MRP",
      rule: "Rule 6(1)(e)"
    });
    if (!hasMrp) violations.push("Mandatory MRP declaration is missing.");

    // 2. Net Quantity Check
    const hasQty = clean.includes("g") || clean.includes("kg") || clean.includes("ml") || clean.includes("net qty") || clean.includes("net wt");
    declarations.push({
      field: "Net Quantity (Metric)",
      status: hasQty ? "PASS" : "FAIL",
      value: hasQty ? "Detected" : "Missing Quantity",
      rule: "Rule 6(1)(c)"
    });
    if (!hasQty) violations.push("Net Quantity declaration is missing.");

    // 3. Date of Mfg / Expiry Check
    const hasDate = clean.includes("mfd") || clean.includes("pkd") || clean.includes("batch") || clean.includes("packed");
    declarations.push({
      field: "Date of Mfg / Expiry",
      status: hasDate ? "PASS" : "FAIL",
      value: hasDate ? "Detected" : "Missing Date/Batch",
      rule: "Rule 6(1)(d)"
    });
    if (!hasDate) violations.push("Manufacturing/Packing date is missing.");

    // 4. Customer Care / Helpline Check
    const hasCustomerCare = clean.includes("care") || clean.includes("consumer") || clean.includes("@") || clean.includes("1800");
    declarations.push({
      field: "Customer Care Helpline",
      status: hasCustomerCare ? "PASS" : "FAIL",
      value: hasCustomerCare ? "Detected" : "Missing Contact Info",
      rule: "Rule 6(1)(h)"
    });
    if (!hasCustomerCare) violations.push("Consumer care details missing.");

    // 5. Manufacturer Details Check
    const hasManufacturer = clean.includes("mfg") || clean.includes("manufactured") || clean.includes("marketed") || clean.includes("lotte") || clean.includes("corp") || clean.includes("ltd");
    declarations.push({
      field: "Manufacturer Details",
      status: hasManufacturer ? "PASS" : "FAIL",
      value: hasManufacturer ? "Detected" : "Missing Manufacturer",
      rule: "Rule 6(1)(a)"
    });
    if (!hasManufacturer) violations.push("Manufacturer/Packer identity details missing.");

    const isCompliant = violations.length === 0;

    return {
      isEmpty: false,
      productName: clean.includes("lotte") ? "Lotte Coffy Bite Confectionery" : "Generic Scanned Commodity",
      declarations,
      violations,
      recommendedPenalty: isCompliant ? 0 : 5000,
      isCompliant,
      status: isCompliant ? "COMPLIANT" : "NON_COMPLIANT"
    };
  };

  // Quick Preset Simulator optimized for testing compliance or violations
  const handleQuickAiPreset = (forceValid = true) => {
    setOcrStatus(forceValid ? "Valid Profile Loaded" : "Violating Profile Loaded");
    const sampleText = forceValid 
      ? "MRP ₹ 5.00 Net Wt 21.6g Mfd 05/26 customercare@lotteindia.com Lotte India Chennai"
      : "Incomplete Label Info Without MRP or Quantity";
    
    setSlotTexts({
      front: forceValid ? "Lotte Coffy Bite Classic Confectionery" : "Unknown Candy Wrapper",
      back: forceValid ? "Ingredients Sugar Liquid Glucose Mkt by Lotte India Chennai" : "No Ingredients",
      side1: "Classic Branding Panel",
      side2: forceValid ? "MRP ₹ 5.00 Net Wt 21.6g Customer Care 18005999059 Mfd 05/26 NK11" : "Blank Side"
    });

    setPhotos({
      front: "https://images.unsplash.com/photo-1581798458920-3343ef44729f?w=300",
      back: "https://images.unsplash.com/photo-1581798458920-3343ef44729f?w=300",
      side1: "https://images.unsplash.com/photo-1581798458920-3343ef44729f?w=300",
      side2: "https://images.unsplash.com/photo-1581798458920-3343ef44729f?w=300"
    });

    setScanResult(evaluateLegalMetrologyRules(sampleText));
  };

  // Multi-pass OCR Parser for uploaded files
  const parseCanvasFrame = async (canvasElement, targetSlot, imageUrl) => {
    setOcrStatus(`Reading ${targetSlot.toUpperCase()}...`);
    try {
      if (!window.Tesseract) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const res = await window.Tesseract.recognize(canvasElement, "eng");
      const detectedText = res.data.text || "";

      const updatedSlotTexts = { ...slotTexts, [targetSlot]: detectedText.trim() };
      setSlotTexts(updatedSlotTexts);

      const updatedPhotos = { ...photos, [targetSlot]: imageUrl };
      setPhotos(updatedPhotos);

      const mergedText = Object.values(updatedSlotTexts).filter(Boolean).join(" ");
      setScanResult(evaluateLegalMetrologyRules(mergedText));
      setOcrStatus("Scan Complete");

      const slotKeys = SLOTS.map(s => s.id);
      const nextSlot = slotKeys.find(key => key !== targetSlot && !updatedPhotos[key]);
      if (nextSlot) setActiveSlot(nextSlot);
    } catch (err) {
      console.error("OCR error:", err);
      setScanResult(evaluateLegalMetrologyRules(""));
      setOcrStatus("OCR Parsing Failed");
    }
  };

  const startWebcam = async () => {
    stopWebcam();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setIsWebcamActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 150);
    } catch (err) {
      alert(`Camera Error: ${err.message}`);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsWebcamActive(false);
  };

  const captureSnapshotForSlot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    parseCanvasFrame(canvas, activeSlot, canvas.toDataURL("image/png"));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        parseCanvasFrame(canvas, activeSlot, url);
      };
    }
  };

  const removeSlotPhoto = (slotId, e) => {
    e.stopPropagation();
    const updatedPhotos = { ...photos, [slotId]: null };
    const updatedTexts = { ...slotTexts, [slotId]: "" };
    setPhotos(updatedPhotos);
    setSlotTexts(updatedTexts);
    setScanResult(evaluateLegalMetrologyRules(Object.values(updatedTexts).filter(Boolean).join(" ")));
  };

  const handleDispatchComplaint = () => {
    const compId = "CMP-LM-" + Math.floor(100000 + Math.random() * 900000);
    const payload = {
      id: compId,
      timestamp: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      inspectorName: user?.name || "Inspector CHK-109",
      shopName: shopDetails.shopName,
      location: shopDetails.location,
      productName: scanResult?.productName || "Scanned Commodity",
      batchNo: shopDetails.batchNo,
      image: photos.front || photos.back || "https://images.unsplash.com/photo-1581798458920-3343ef44729f?w=300",
      multiPhotos: photos,
      status: scanResult?.isCompliant ? "VERIFIED_COMPLIANT" : "NON_COMPLIANT_VIOLATION",
      violations: scanResult?.violations || [],
      penaltyAmount: scanResult?.recommendedPenalty || 0,
      notes: scanResult?.isCompliant ? "Passed Legal Metrology Rules 2011." : "Violations found in mandatory declarations."
    };

    addComplaint(payload);
    setSubmittedId(compId);
  };

  const capturedCount = Object.values(photos).filter(Boolean).length;

  return (
    <div style={{ padding: "20px clamp(12px, 3vw, 30px)", maxWidth: "1350px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
            Multi-Angle Commodity Compliance Scanner
          </h1>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
            Upload package photos or use AI presets for dynamic PCR 2011 validation. Status: {ocrStatus}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleQuickAiPreset(true)}
            style={{ background: "#16a34a", color: "#fff", border: "none", padding: "7px 12px", borderRadius: "8px", fontWeight: 800, fontSize: "11.5px", cursor: "pointer" }}
          >
            ⚡ Test Valid Product
          </button>
          <button
            onClick={() => handleQuickAiPreset(false)}
            style={{ background: "#dc2626", color: "#fff", border: "none", padding: "7px 12px", borderRadius: "8px", fontWeight: 800, fontSize: "11.5px", cursor: "pointer" }}
          >
            ⚠️ Test Violation Product
          </button>
          <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "14px", fontWeight: 700 }}>
            Captured: {capturedCount} / 4
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px" }}>
        
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
            {SLOTS.map((s) => {
              const isSelected = activeSlot === s.id;
              const hasPhoto = Boolean(photos[s.id]);

              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSlot(s.id)}
                  style={{
                    border: isSelected ? "2px solid #0c3b6b" : "1px solid #cbd5e1",
                    background: isSelected ? "#eff6ff" : (hasPhoto ? "#f8fafc" : "#ffffff"),
                    borderRadius: "10px",
                    padding: "8px 6px",
                    cursor: "pointer",
                    textAlign: "center",
                    position: "relative"
                  }}
                >
                  <div style={{ fontSize: "11.5px", fontWeight: 800, color: isSelected ? "#0c3b6b" : "#334155" }}>{s.label}</div>
                  <div style={{ fontSize: "9.5px", color: "#64748b", margin: "2px 0 6px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.desc}</div>

                  <div style={{ height: "60px", borderRadius: "6px", background: "#e2e8f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {hasPhoto ? (
                      <img src={photos[s.id]} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "18px", opacity: 0.5 }}>📷</span>
                    )}
                  </div>

                  {hasPhoto && (
                    <button
                      onClick={(e) => removeSlotPhoto(s.id, e)}
                      style={{ position: "absolute", top: 4, right: 4, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: "10px", cursor: "pointer", fontWeight: 900 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0c3b6b" }}>
              Targeting: {SLOTS.find(s => s.id === activeSlot)?.label}
            </span>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => fileInputRef.current.click()}
                style={{ background: "#0c3b6b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
              >
                📁 Upload Photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />

              {!isWebcamActive ? (
                <button
                  onClick={startWebcam}
                  style={{ background: "#0284c7", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                >
                  📷 Camera
                </button>
              ) : (
                <button
                  onClick={captureSnapshotForSlot}
                  style={{ background: "#16a34a", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 800, cursor: "pointer" }}
                >
                  📸 Capture
                </button>
              )}
            </div>
          </div>

          <div style={{ height: "260px", background: "#0f172a", borderRadius: "12px", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isWebcamActive ? (
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : photos[activeSlot] ? (
              <img src={photos[activeSlot]} alt="Active" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <div style={{ color: "#94a3b8", fontSize: "12px", textAlign: "center", padding: "0 20px" }}>
                Click <strong>"Test Valid Product"</strong> or <strong>"Test Violation Product"</strong> above to simulate audit results.
              </div>
            )}
          </div>

          <div style={{ marginTop: "14px" }}>
            <h4 style={{ fontSize: "11.5px", color: "#475569", margin: "0 0 6px 0", textTransform: "uppercase" }}>Retailer Details</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <input type="text" value={shopDetails.shopName} onChange={(e) => setShopDetails({ ...shopDetails, shopName: e.target.value })} placeholder="Store Name" style={{ padding: "7px 10px", fontSize: "12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
              <input type="text" value={shopDetails.batchNo} onChange={(e) => setShopDetails({ ...shopDetails, batchNo: e.target.value })} placeholder="Batch / Lot #" style={{ padding: "7px 10px", fontSize: "12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px 0", color: "#0f172a" }}>
            2. Dynamic Multi-Panel Compliance Result
          </h3>

          {!scanResult ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
              Select a test preset or upload photos to evaluate rule compliance.
            </div>
          ) : (
            <div>
              <div style={{
                background: scanResult.isCompliant ? "#f0fdf4" : "#fef2f2",
                border: `1.5px solid ${scanResult.isCompliant ? "#86efac" : "#fca5a5"}`,
                padding: "10px 14px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px"
              }}>
                <span style={{ fontWeight: 800, fontSize: "12px", color: scanResult.isCompliant ? "#166534" : "#991b1b" }}>
                  {scanResult.isCompliant ? "✔ COMPLIANT COMMODITY (PCR 2011)" : "❌ NON-COMPLIANT VIOLATION DETECTED"}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 800, color: scanResult.isCompliant ? "#16a34a" : "#dc2626" }}>
                  Fine: ₹ {scanResult.recommendedPenalty}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                {scanResult.declarations.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>{d.field}</div>
                      <div style={{ fontSize: "10.5px", color: d.status === "PASS" ? "#047857" : "#b91c1c", fontWeight: 600 }}>{d.value} ({d.rule})</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "11px", color: d.status === "PASS" ? "#16a34a" : "#dc2626" }}>
                      {d.status === "PASS" ? "✔ PASS" : "✖ FAIL"}
                    </span>
                  </div>
                ))}
              </div>

              {!scanResult.isCompliant && scanResult.violations.length > 0 && (
                <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "10px", borderRadius: "8px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#9f1239", marginBottom: "4px" }}>Detected Violations:</div>
                  <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "#881337" }}>
                    {scanResult.violations.map((v, index) => (
                      <li key={index}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!submittedId ? (
                <button
                  onClick={handleDispatchComplaint}
                  style={{ width: "100%", padding: "11px", background: scanResult.isCompliant ? "#0c3b6b" : "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "12.5px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                >
                  {scanResult.isCompliant ? "🚀 Submit Compliant Dossier to Admin" : "🚨 Dispatch Violation Notice & Fine"}
                </button>
              ) : (
                <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#065f46" }}>✔ Case {submittedId} Transmitted Successfully!</div>
                  <button onClick={() => navigate("/admin/violations")} style={{ marginTop: "6px", background: "#059669", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}>
                    View in Admin Console →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ScanProduct;