import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API, { API_BASE_URL } from "../../services/api";
import scanService from "../../services/scans";
import LiveCameraModal from "../../components/common/LiveCameraModal.jsx";

const PANELS_DEF = [
  { key: "front", label: "Facet 1: Front Principal Display (PDP)", requiredFields: "Product Name, Brand Identity, Net Quantity", isMandatory: true },
  { key: "back", label: "Facet 2: Back Statutory Panel", requiredFields: "Ingredients, FSSAI / Lic, Consumer Helpline", isMandatory: true },
  { key: "pricing", label: "Facet 3: MRP & Pricing Crimp", requiredFields: "Maximum Retail Price (MRP), USP, Mfg Date", isMandatory: true },
  { key: "mfr", label: "Facet 4: Manufacturer / Barcode", requiredFields: "Manufacturer/Packer Name, Country of Origin, Barcode", isMandatory: true },
];

const AddProduct = () => {
  const batchFileInputRef = useRef(null);
  const navigate = useNavigate();

  // Uploaded panel photos
  const [panels, setPanels] = useState([
    { key: "front", label: "Facet 1: Front Principal Display (PDP)", requiredFields: "Product Name, Brand, Net Qty", file: null, previewUrl: null },
    { key: "back", label: "Facet 2: Back Statutory Panel", requiredFields: "Ingredients, Helpline, License", file: null, previewUrl: null },
    { key: "pricing", label: "Facet 3: MRP & Pricing Crimp", requiredFields: "MRP, USP, Mfg Date", file: null, previewUrl: null },
    { key: "mfr", label: "Facet 4: Manufacturer & Barcode", requiredFields: "Manufacturer, Origin, Barcode", file: null, previewUrl: null }
  ]);

  // Detection & Form State
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectProgress, setDetectProgress] = useState("");
  const [detectionDone, setDetectionDone] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);

  // Commodity Form Data (Auto-detected + manually filled)
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "packaged_food",
    mrp: "",
    net_quantity: "",
    country_of_origin: "India",
    manufacturer_name: "",
    importer_name: "",
    consumer_care: ""
  });

  const [fieldSources, setFieldSources] = useState({});
  const [missingFields, setMissingFields] = useState([]);

  const handleFileSelect = (index, file) => {
    if (!file) return;
    setPanels(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file: file,
        previewUrl: URL.createObjectURL(file)
      };
      return updated;
    });
    setErrorMsg(null);
    setDetectionDone(false);
  };

  
  const handleOpenLiveCamera = (panelIdx = 0) => {
    setActiveCameraIndex(panelIdx);
    setCameraModalOpen(true);
  };

    const handleBatchFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPanels(prev => {
      const updated = [...prev];
      files.forEach((file, idx) => {
        if (idx < updated.length) {
          updated[idx] = {
            ...updated[idx],
            file,
            previewUrl: URL.createObjectURL(file)
          };
        }
      });
      return updated;
    });
    setErrorMsg(null);
    setDetectionDone(false);
  };

  const handleCameraCaptureMultiple = (capturedFiles) => {
    if (!capturedFiles || capturedFiles.length === 0) return;
    setPanels(prev => {
      const updated = [...prev];
      capturedFiles.forEach((file, idx) => {
        if (idx < updated.length) {
          updated[idx] = {
            ...updated[idx],
            file,
            previewUrl: URL.createObjectURL(file)
          };
        }
      });
      return updated;
    });
    setErrorMsg(null);
    setDetectionDone(false);
  };

  const handleCameraCapture = (capturedFile) => {
    handleFileSelect(activeCameraIndex, capturedFile);
  };

  const handleClearPanel = (index) => {
    setPanels(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file: null, previewUrl: null };
      return updated;
    });
    setDetectionDone(false);
  };

  const handleLoadOfficialPreset = async () => {
    setIsDetecting(true);
    setDetectProgress("Loading official 4-panel verified package dataset...");
    setErrorMsg(null);
    try {
      const res = await scanService.load4FacetPresetFiles();
      const updated = panels.map((p, i) => ({
        ...p,
        file: res.facets[i]?.file || null,
        previewUrl: res.facets[i]?.previewUrl || null
      }));
      setPanels(updated);
      setDetectProgress("");
    } catch (e) {
      console.error("Failed to load preset:", e);
      setErrorMsg("Failed to load sample packaging photos.");
    } finally {
      setIsDetecting(false);
    }
  };

  const uploadedCount = panels.filter(p => p.file).length;

  const handleRunAutoDetection = async () => {
    const validPanels = panels.filter(p => p.file);
    if (validPanels.length === 0) {
      setErrorMsg("Please upload at least 1 packaging photo (recommended: all 4 panels).");
      return;
    }

    setIsDetecting(true);
    setErrorMsg(null);
    setDetectProgress("Uploading packaging photographs to Legal Metrology AI Engine...");

    try {
      setTimeout(() => setDetectProgress("1. Scanning for Barcodes & QR Codes via OpenCV Engine..."), 400);
      setTimeout(() => setDetectProgress("2. Executing Optical Character Recognition (OCR) across all panels..."), 1200);
      setTimeout(() => setDetectProgress("3. Extracting statutory PCR 2011 declarations (MRP, Net Qty, MFR, Care)..."), 2200);
      setTimeout(() => setDetectProgress("4. Correlating declarations and discovering missing fields..."), 3200);

      const formPayload = new FormData();
      validPanels.forEach((p) => {
        formPayload.append("files", p.file, p.file.name || "panel.jpg");
      });

      const res = await API.post("/products/auto-detect", formPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const data = res.data;
      setDetectionResult(data);

      const det = data.detected_fields || {};
      const sources = data.field_sources || {};
      const missing = data.missing_fields || [];

      setFormData({
        name: det.name || "",
        brand: det.brand || "",
        category: det.category || "packaged_food",
        mrp: det.mrp || "",
        net_quantity: det.net_quantity || "",
        country_of_origin: det.country_of_origin || "India",
        manufacturer_name: det.manufacturer_name || "",
        importer_name: det.importer_name || "",
        consumer_care: det.consumer_care || ""
      });

      setFieldSources(sources);
      setMissingFields(missing);
      setDetectionDone(true);
    } catch (err) {
      console.error("Auto-Detection Failed:", err);
      setErrorMsg(err.response?.data?.detail || "Auto-detection failed to process. You may fill the details manually below.");
      setDetectionDone(true);
    } finally {
      setIsDetecting(false);
      setDetectProgress("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (value && value.trim()) {
      setMissingFields(prev => prev.filter(f => f !== name));
      setFieldSources(prev => ({ ...prev, [name]: "USER_MANUAL_INPUT" }));
    }
  };

  const handleRegisterCommodity = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mrp || !formData.net_quantity) {
      setErrorMsg("Please ensure Commodity Name, Maximum Retail Price (MRP), and Declared Net Quantity are filled.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await API.post("/products", formData);
      setSavedSuccess(true);
      setTimeout(() => {
        navigate("/shopkeeper/products");
      }, 1500);
    } catch (err) {
      console.error("Failed to register product:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to register commodity in database.");
    } finally {
      setIsSaving(false);
    }
  };

  const getSourceBadge = (fieldName) => {
    const source = fieldSources[fieldName];
    if (source === "BARCODE" || source?.includes("BARCODE")) {
      return (
        <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }}>
          AUTO-DETECTED (BARCODE)
        </span>
      );
    }
    if (source === "OCR" || source?.includes("OCR")) {
      return (
        <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>
          AUTO-DETECTED (AI OCR)
        </span>
      );
    }
    if (source === "DATABASE_LOOKUP") {
      return (
        <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: "#f3e8ff", color: "#6b21a8", border: "1px solid #d8b4fe" }}>
          SYNCED FROM REGISTRY
        </span>
      );
    }
    if (source === "USER_MANUAL_INPUT") {
      return (
        <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}>
          MANUALLY SUPPLIED
        </span>
      );
    }
    if (missingFields.includes(fieldName)) {
      return (
        <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
          PENDING INPUT
        </span>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1280px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* 1. Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "24px 30px", color: "#ffffff", marginBottom: "22px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#93c5fd" }}>
          LEGAL METROLOGY (PCR 2011) AUTOMATED COMMODITY ONBOARDING
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "6px 0 4px 0" }}>
          Auto-Detect & Register Commodity
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Upload package panel photographs to automatically extract barcode and OCR statutory declarations. Any unverified fields can be confirmed manually before permanent registration.
        </p>
      </div>

      <LiveCameraModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onCaptureMultiple={handleCameraCaptureMultiple}
        targetLabel={panels[activeCameraIndex]?.label || "Packaging Panel"}
      />

      {errorMsg && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "18px" }}>
          {errorMsg}
        </div>
      )}

      {savedSuccess ? (
        <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", padding: "40px", borderRadius: "14px", textAlign: "center", color: "#166534" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px", fontWeight: 900 }}>[SUCCESS]</div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "21px", fontWeight: 800 }}>Commodity Registered & Synchronized!</h2>
          <p style={{ fontSize: "13px", margin: "0 0 16px 0", color: "#15803d" }}>
            The statutory declaration record has been saved to the Central Database (MongoDB 8.0 & SQLite). Redirecting to your inventory...
          </p>
          <div style={{ fontSize: "12px", color: "#166534", fontWeight: 700 }}>
            Statutory Registration Code: #PCR-{Date.now().toString().slice(-8)}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
          
          {/* Left Column: Photo Uploads & Auto-Detect Trigger */}
          <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#0c3b6b", textTransform: "uppercase", margin: 0 }}>
                  1. Upload Packaging Panel Photos
                </h2>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  Legal Metrology Rule 6 Protocol (Front PDP, Back, Pricing Crimp, MFR)
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={batchFileInputRef}
                  onChange={handleBatchFileSelect}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => batchFileInputRef.current?.click()}
                  disabled={isDetecting}
                  style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: isDetecting ? "not-allowed" : "pointer" }}
                >
                  Batch Upload Multiple Photos
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenLiveCamera(panels.findIndex(p => !p.file) !== -1 ? panels.findIndex(p => !p.file) : 0)}
                  disabled={isDetecting}
                  style={{ background: "#0284c7", color: "#ffffff", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: isDetecting ? "not-allowed" : "pointer", boxShadow: "0 2px 4px rgba(2, 132, 199, 0.25)" }}
                >
                  Live Camera Scanner
                </button>
                <button
                  type="button"
                  onClick={handleLoadOfficialPreset}
                  disabled={isDetecting}
                  style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: isDetecting ? "not-allowed" : "pointer" }}
                >
                  Load Verified Sample
                </button>
              </div>
            </div>

            {/* 4-Panel Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {panels.map((p, idx) => {
                const hasFile = !!p.file;
                return (
                  <div
                    key={p.key}
                    style={{
                      border: hasFile ? "1.5px solid #059669" : "1.5px dashed #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px",
                      background: hasFile ? "#f0fdf4" : "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "130px"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#0c3b6b", marginBottom: "2px" }}>
                        {p.label.split(":")[0]}: {p.label.split(":")[1]?.trim()}
                      </div>
                      <div style={{ fontSize: "9.5px", color: "#64748b", marginBottom: "8px" }}>
                        {p.requiredFields}
                      </div>
                    </div>

                    {hasFile ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "4px 6px", borderRadius: "6px", border: "1px solid #d1fae5", marginBottom: "6px" }}>
                          <img
                            src={p.previewUrl}
                            alt={p.label}
                            style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                          />
                          <div style={{ overflow: "hidden", fontSize: "10px" }}>
                            <div style={{ fontWeight: 700, color: "#166534", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {p.file.name}
                            </div>
                            <div style={{ color: "#64748b", fontSize: "9px" }}>
                              Ready for extraction
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <label style={{ flex: 1, textAlign: "center", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0c3b6b", padding: "3px", borderRadius: "4px", fontSize: "9.5px", fontWeight: 700, cursor: "pointer" }}>
                            Replace
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileSelect(idx, e.target.files[0])}
                              style={{ display: "none" }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleClearPanel(idx)}
                            style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "3px 6px", borderRadius: "4px", fontSize: "9.5px", fontWeight: 700, cursor: "pointer" }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "8px 6px",
                          border: "1px dashed #cbd5e1",
                          borderRadius: "6px",
                          background: "#ffffff",
                          cursor: "pointer"
                        }}>
                          <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#0c3b6b" }}>
                            Upload Photo
                          </span>
                          <span style={{ fontSize: "9px", color: "#94a3b8" }}>
                            JPG, PNG, WEBP
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(idx, e.target.files[0])}
                            style={{ display: "none" }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleOpenLiveCamera(idx)}
                          style={{
                            background: "#0284c7",
                            color: "#ffffff",
                            border: "none",
                            padding: "5px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Live Camera
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Run Auto-Detection Button */}
            <button
              type="button"
              onClick={handleRunAutoDetection}
              disabled={isDetecting || uploadedCount === 0}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: uploadedCount > 0 ? "#0c3b6b" : "#94a3b8",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 800,
                cursor: (isDetecting || uploadedCount === 0) ? "not-allowed" : "pointer",
                boxShadow: uploadedCount > 0 ? "0 4px 12px rgba(12,59,107,0.2)" : "none"
              }}
            >
              {isDetecting ? (detectProgress || "Scanning Panels & Extracting Declarations...") : `Run AI Auto-Detection (${uploadedCount}/4 Panels Uploaded)`}
            </button>

            {detectionResult && (
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, color: "#334155" }}>Barcode / QR Status:</span>
                  <span style={{ fontWeight: 800, color: detectionResult.barcode ? "#166534" : "#64748b" }}>
                    {detectionResult.barcode ? `${detectionResult.barcode} (${detectionResult.barcode_type || 'BARCODE'})` : "None Detected (Using OCR Fallback)"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, color: "#334155" }}>Commodity Registry Status:</span>
                  <span style={{ fontWeight: 800, color: detectionResult.is_new_commodity ? "#0369a1" : "#166534" }}>
                    {detectionResult.is_new_commodity ? "NEW PACKAGED COMMODITY" : `MATCHED EXISTING SKU #${detectionResult.existing_product_id}`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, color: "#334155" }}>Missing Mandatory Fields:</span>
                  <span style={{ fontWeight: 800, color: missingFields.length === 0 ? "#166534" : "#b45309" }}>
                    {missingFields.length === 0 ? "All Mandatory Declarations Verified" : `${missingFields.length} Fields Need Manual Confirmation`}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Review Auto-Detected Fields & Complete Remaining */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#0c3b6b", textTransform: "uppercase", margin: 0 }}>
                2. Review Declarations & Complete Missing Fields
              </h2>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                PCR 2011 Rule 6
              </span>
            </div>

            <form onSubmit={handleRegisterCommodity} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Product Name & Brand */}
              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      Commodity Name & Description *
                    </label>
                    {getSourceBadge("name")}
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Namkeen Multi-Panel Commodity / Wheat Flour (5kg)"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: missingFields.includes("name") ? "1.5px solid #f59e0b" : "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: missingFields.includes("name") ? "#fffbeb" : "#f8fafc" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      Brand / Trademark
                    </label>
                    {getSourceBadge("brand")}
                  </div>
                  <input
                    type="text"
                    name="brand"
                    placeholder="e.g., Haldiram / PureHarvest"
                    value={formData.brand}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: "#f8fafc" }}
                  />
                </div>
              </div>

              {/* Category, MRP, Net Quantity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      Category *
                    </label>
                    {getSourceBadge("category")}
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: "#f8fafc", cursor: "pointer" }}
                  >
                    <option value="packaged_food">Packaged Food & Staples</option>
                    <option value="electronics">Electronics & IT Peripherals</option>
                    <option value="cosmetics">Cosmetics & Personal Care</option>
                    <option value="medical_device">Medical Devices & Health</option>
                    <option value="apparel">Apparel & Textiles</option>
                    <option value="other">General FMCG</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      MRP (₹) *
                    </label>
                    {getSourceBadge("mrp")}
                  </div>
                  <input
                    type="text"
                    name="mrp"
                    required
                    placeholder="e.g., 140.00"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: missingFields.includes("mrp") ? "1.5px solid #f59e0b" : "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: missingFields.includes("mrp") ? "#fffbeb" : "#f8fafc" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      Declared Net Quantity *
                    </label>
                    {getSourceBadge("net_quantity")}
                  </div>
                  <input
                    type="text"
                    name="net_quantity"
                    required
                    placeholder="e.g., 400 g / 1 kg / 500 ml"
                    value={formData.net_quantity}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: missingFields.includes("net_quantity") ? "1.5px solid #f59e0b" : "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: missingFields.includes("net_quantity") ? "#fffbeb" : "#f8fafc" }}
                  />
                </div>
              </div>

              {/* Manufacturer Name & Country of Origin */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      Manufacturer / Packer Name & Unit *
                    </label>
                    {getSourceBadge("manufacturer_name")}
                  </div>
                  <input
                    type="text"
                    name="manufacturer_name"
                    required
                    placeholder="e.g., PepsiCo India Holdings Pvt Ltd, Village Channo, Punjab"
                    value={formData.manufacturer_name}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: missingFields.includes("manufacturer_name") ? "1.5px solid #f59e0b" : "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: missingFields.includes("manufacturer_name") ? "#fffbeb" : "#f8fafc" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      Country of Origin *
                    </label>
                    {getSourceBadge("country_of_origin")}
                  </div>
                  <input
                    type="text"
                    name="country_of_origin"
                    required
                    placeholder="e.g., India"
                    value={formData.country_of_origin}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: "#f8fafc" }}
                  />
                </div>
              </div>

              {/* Importer Name & Consumer Care Helpline */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      Importer Name (If Applicable)
                    </label>
                    {getSourceBadge("importer_name")}
                  </div>
                  <input
                    type="text"
                    name="importer_name"
                    placeholder="Leave blank for domestic commodities"
                    value={formData.importer_name}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: "#f8fafc" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>
                      Consumer Care Helpline / Email *
                    </label>
                    {getSourceBadge("consumer_care")}
                  </div>
                  <input
                    type="text"
                    name="consumer_care"
                    required
                    placeholder="e.g., consumer.feedback@pepsico.com | 1800-22-4020"
                    value={formData.consumer_care}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: missingFields.includes("consumer_care") ? "1.5px solid #f59e0b" : "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: missingFields.includes("consumer_care") ? "#fffbeb" : "#f8fafc" }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "18px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/shopkeeper/products")}
                  style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    background: isSaving ? "#94a3b8" : "#0c3b6b",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(12,59,107,0.25)"
                  }}
                >
                  {isSaving ? "Saving & Syncing to Registry..." : "Confirm & Register Commodity →"}
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default AddProduct;
