import React, { useState, useEffect, useRef } from "react";
import productService from "../../services/products";
import scanService from "../../services/scans";
import API, { API_BASE_URL } from "../../services/api";
import LiveCameraModal from "../../components/common/LiveCameraModal.jsx";
import { downloadPDFWithAuth } from "../../services/reports";

const PRESETS = [
  { name: "package1.jpg", label: "Packaged Snack (Sample 1)" },
  { name: "package2.jpg", label: "Imported Commodity (Sample 2)" },
  { name: "image.jpg", label: "FMCG Container (Sample 3)" },
];

const MANDATORY_PANELS = [
  { key: "pdp", label: "Panel 1: Front (PDP)", expected: "Brand & Net Qty" },
  { key: "back", label: "Panel 2: Back Panel", expected: "Ingredients & Care" },
  { key: "mrp", label: "Panel 3: Pricing/MRP", expected: "MRP, MFD & Batch" },
  { key: "mfr", label: "Panel 4: Manufacturer", expected: "MFR Name & Origin" }
];

const ShopkeeperScan = () => {
  const handleDownloadPDFMemo = () => {
    if (!scanResult) return;
    if (scanResult.pdf_url) {
      downloadPDFWithAuth(scanResult.pdf_url, `Statutory_Memo_Scan_${scanResult.numeric_scan_id || 'Latest'}.pdf`);
    } else if (scanResult.numeric_scan_id) {
      downloadPDFWithAuth(`/reports/scan/${scanResult.numeric_scan_id}/download`, `Statutory_Memo_Scan_${scanResult.numeric_scan_id}.pdf`);
    } else if (selectedProductId) {
      downloadPDFWithAuth(`/reports/product/${selectedProductId}/download`, `Statutory_Memo_Product_${selectedProductId}.pdf`);
    } else {
      downloadPDFWithAuth(`/reports/1/download`, `Statutory_Inspection_Memo.pdf`);
    }
  };

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  
  // Multi-photo packaging panels state
  const [photos, setPhotos] = useState([
    { key: "pdp", label: "Panel 1: Front (PDP)", expected: "Brand & Net Qty", file: null, previewUrl: null },
    { key: "back", label: "Panel 2: Back Panel", expected: "Ingredients & Care", file: null, previewUrl: null },
    { key: "mrp", label: "Panel 3: Pricing/MRP", expected: "MRP, MFD & Batch", file: null, previewUrl: null },
    { key: "mfr", label: "Panel 4: Manufacturer", expected: "MFR Name & Origin", file: null, previewUrl: null }
  ]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  const batchFileInputRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
      if (data && data.length > 0) {
        setSelectedProductId(data[0].id.toString());
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const handleSelectPreset = async (presetName) => {
    try {
      setActivePreset(presetName);
      const imgRes = await API.get(`/scans/presets/${presetName}`, { responseType: "blob" });
      const file = new File([imgRes.data], presetName, { type: imgRes.data.type || "image/jpeg" });
      const previewUrl = URL.createObjectURL(file);
      
      setPhotos(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], file, previewUrl };
        return updated;
      });
      setScanResult(null);
      setErrorMsg(null);
    } catch (e) {
      console.error("Failed to load preset:", e);
    }
  };

  const handleLoadOfficial4FacetSample = async () => {
    setIsScanning(true);
    setErrorMsg(null);
    try {
      const res = await scanService.load4FacetPresetFiles();
      const loaded = photos.map((p, i) => ({
        ...p,
        file: res.facets[i]?.file || null,
        previewUrl: res.facets[i]?.previewUrl || null
      }));
      setPhotos(loaded);
      setActivePreset("official_4facet");
      setScanResult(null);
    } catch (err) {
      console.error("Failed to load sample:", err);
      setErrorMsg("Failed to load official 4-panel sample.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSinglePhotoSelect = (index, file) => {
    if (!file) return;
    setPhotos(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file,
        previewUrl: URL.createObjectURL(file)
      };
      return updated;
    });
    setActivePreset(null);
    setScanResult(null);
    setErrorMsg(null);
  };

  const handleBatchFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPhotos(prev => {
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
    setActivePreset(null);
    setScanResult(null);
    setErrorMsg(null);
  };

  const handleCameraCapture = (capturedFile) => {
    handleSinglePhotoSelect(activeCameraIndex, capturedFile);
  };

  const handleCameraCaptureMultiple = (capturedFiles) => {
    if (!capturedFiles || capturedFiles.length === 0) return;
    setPhotos(prev => {
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
    setActivePreset(null);
    setScanResult(null);
    setErrorMsg(null);
  };

  const handleClearPhoto = (index) => {
    setPhotos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file: null, previewUrl: null };
      return updated;
    });
    setScanResult(null);
  };

  const uploadedCount = photos.filter(p => p.file).length;

  const handleRunVerification = async () => {
    if (!selectedProductId) {
      setErrorMsg("Please select a registered commodity.");
      return;
    }
    const validPhotos = photos.filter(p => p.file);
    if (validPhotos.length === 0) {
      setErrorMsg("Please upload at least 1 packaging photograph (recommended: all 4 panels).");
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    try {
      let res;
      if (validPhotos.length >= 2) {
        // Multi-facet execution
        const selProd = products.find(p => p.id.toString() === selectedProductId);
        const prodName = selProd?.name || "Pre-Retail Commodity";
        const cat = selProd?.category || "packaged_food";
        const files = validPhotos.map(p => p.file);
        const labels = validPhotos.map(p => p.label);
        res = await scanService.scanMultiFacetImages(files, labels, prodName, cat);
      } else {
        // Single photo execution
        res = await scanService.scanProductImage(selectedProductId, validPhotos[0].file);
      }
      setScanResult(res);
    } catch (err) {
      console.error("Scan verification failed:", err);
      setErrorMsg(err.response?.data?.detail || "Scan failed to process.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#93c5fd" }}>
          SELF-COMPLIANCE VERIFICATION HUB • CHECK → CORRECT → RECHECK
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "6px 0 4px 0" }}>
          Pre-Retail Packaging Compliance Scanner
        </h1>
        <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
          Verify multiple packaging panels against Legal Metrology (PCR 2011) mandatory declarations before shelf stocking.
        </p>
      </div>

      <LiveCameraModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onCaptureMultiple={handleCameraCaptureMultiple}
        targetLabel={photos[activeCameraIndex]?.label || "Packaging Panel"}
      />

      {errorMsg && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
          {errorMsg}
        </div>
      )}

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
        
        {/* Upload & Product Selection */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#0c3b6b", textTransform: "uppercase", margin: 0 }}>
              1. Select Product & Packaging Panels
            </h2>
            <span style={{ fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px", background: uploadedCount >= 4 ? "#dcfce7" : "#fef3c7", color: uploadedCount >= 4 ? "#166534" : "#92400e" }}>
              {uploadedCount} / 4 Panels Ready
            </span>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
              Target Registered Commodity:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", fontSize: "12.5px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc" }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} - {p.name} ({p.category?.toUpperCase() || 'GENERAL'})
                </option>
              ))}
            </select>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
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
              style={{ padding: "10px", background: "#0c3b6b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <span>Batch Upload Multiple Photos</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const nextEmpty = photos.findIndex(p => !p.file);
                setActiveCameraIndex(nextEmpty !== -1 ? nextEmpty : 0);
                setCameraModalOpen(true);
              }}
              style={{ padding: "10px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "8px", fontSize: "11.5px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)" }}
            >
              Live Camera Scanner
            </button>
          </div>

          {/* 4-Panel Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            {photos.map((p, idx) => {
              const hasFile = !!p.file;
              return (
                <div
                  key={p.key || idx}
                  style={{
                    border: hasFile ? "1.5px solid #059669" : "1.5px dashed #cbd5e1",
                    borderRadius: "8px",
                    padding: "8px",
                    background: hasFile ? "#f0fdf4" : "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ marginBottom: "6px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#0c3b6b" }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: "9.5px", color: "#64748b" }}>
                      {p.expected}
                    </div>
                  </div>

                  {hasFile ? (
                    <div>
                      <div style={{ height: "70px", background: "#0f172a", borderRadius: "4px", overflow: "hidden", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={p.previewUrl} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <label style={{ flex: 1, textAlign: "center", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0c3b6b", padding: "3px", borderRadius: "4px", fontSize: "9.5px", fontWeight: 700, cursor: "pointer" }}>
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleSinglePhotoSelect(idx, e.target.files[0])}
                            style={{ display: "none" }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleClearPhoto(idx)}
                          style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "3px 6px", borderRadius: "4px", fontSize: "9.5px", fontWeight: 700, cursor: "pointer" }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ padding: "8px 4px", border: "1px dashed #94a3b8", borderRadius: "4px", background: "#ffffff", textAlign: "center", cursor: "pointer" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#0c3b6b", display: "block" }}>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleSinglePhotoSelect(idx, e.target.files[0])}
                          style={{ display: "none" }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCameraIndex(idx);
                          setCameraModalOpen(true);
                        }}
                        style={{ padding: "4px", background: "#0284c7", color: "#ffffff", border: "none", borderRadius: "4px", fontSize: "9.5px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Camera
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
              Or Load Verified Packaging Sample:
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleLoadOfficial4FacetSample}
                style={{
                  background: activePreset === "official_4facet" ? "#0c3b6b" : "#e0f2fe",
                  color: activePreset === "official_4facet" ? "#fff" : "#0369a1",
                  border: "1px solid #bae6fd",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Official 4-Panel Set (Namkeen PCR 2011 Verified)
              </button>
              {PRESETS.map((pr) => (
                <button
                  key={pr.name}
                  type="button"
                  onClick={() => handleSelectPreset(pr.name)}
                  style={{
                    background: activePreset === pr.name ? "#0c3b6b" : "#f1f5f9",
                    color: activePreset === pr.name ? "#fff" : "#0c3b6b",
                    border: "1px solid #cbd5e1",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunVerification}
            disabled={isScanning || uploadedCount === 0}
            style={{ width: "100%", padding: "12px", background: isScanning || uploadedCount === 0 ? "#94a3b8" : "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: isScanning || uploadedCount === 0 ? "not-allowed" : "pointer" }}
          >
            {isScanning ? "Running AI Optical Declaration Verification..." : `Verify Compliance (${uploadedCount} Panel${uploadedCount === 1 ? '' : 's'})`}
          </button>
        </div>

        {/* Scan & Verification Results */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: "0 0 14px 0", textTransform: "uppercase" }}>
            2. Compliance Status & Recommended Corrections
          </h2>

          {!scanResult ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
              Upload package panel photographs on the left to verify declarations and recommended corrections.
            </div>
          ) : (
            <div>
              <div style={{
                background: scanResult.status === "COMPLIANT" ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${scanResult.status === "COMPLIANT" ? "#86efac" : "#fca5a5"}`,
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontWeight: 800, fontSize: "13px", color: scanResult.status === "COMPLIANT" ? "#166534" : "#991b1b" }}>
                  {scanResult.status === "COMPLIANT" ? "COMPLIANT COMMODITY" : "NON-COMPLIANCE DETECTED"}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>
                  Risk Score: {scanResult.risk?.score?.toFixed(0) || 0} / 100
                </span>
              </div>

              {/* Statutory PDF Memo 1-Click Download Button */}
              <div style={{ marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={handleDownloadPDFMemo}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "#0c3b6b",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 3px 10px rgba(12, 59, 107, 0.25)"
                  }}
                >
                  <span>Download Official Statutory Inspection Memo (PDF)</span>
                </button>
              </div>

              {/* Declarations Checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {Object.entries(scanResult.declarations || {}).map(([key, item], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>{key.replace(/_/g, " ").toUpperCase()}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{item?.value || item || "Not Detected"}</div>
                    </div>
                    <span style={{ fontSize: "10.5px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: (item?.is_present ?? (item ? true : false)) ? "#dcfce7" : "#fee2e2", color: (item?.is_present ?? (item ? true : false)) ? "#166534" : "#991b1b" }}>
                      {(item?.is_present ?? (item ? true : false)) ? "DETECTED" : "MISSING"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recommended Corrections */}
              {scanResult.violations && scanResult.violations.length > 0 && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                    Action Required Before Retailing:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11.5px", color: "#78350f" }}>
                    {scanResult.violations.map((v, idx) => (
                      <li key={idx} style={{ marginBottom: "4px" }}>
                        Ensure <strong>{v.field?.toUpperCase()}</strong> is clearly printed on the principal display panel adhering to PCR 2011 minimum font requirements.
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ShopkeeperScan;
