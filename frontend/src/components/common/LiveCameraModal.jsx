import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Camera, 
  RefreshCw, 
  FlipHorizontal, 
  Zap, 
  ZapOff, 
  Check, 
  X, 
  Upload, 
  AlertCircle, 
  Layers, 
  Trash2
} from "lucide-react";

const LiveCameraModal = ({
  isOpen = true,
  onClose,
  onCapture,
  onCaptureMultiple,
  targetLabel = "Packaging Panel",
  allowMultiple = true
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [sessionPhotos, setSessionPhotos] = useState([]);
  const [flashActive, setFlashActive] = useState(false);
  const [videoResolution, setVideoResolution] = useState(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Error stopping track:", e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  // Initialize and start media stream
  const startCamera = useCallback(async (deviceIdOverride = null, facingModeOverride = null) => {
    stopCamera();
    setCameraError(null);
    setCameraLoading(true);

    // Guard against non-secure context or unsupported browser
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Camera API is unavailable. Web browsers require a secure origin (HTTPS or http://localhost) to access device cameras. If you are accessing via a local network IP, please use localhost:5173 or use the 'Upload File' option."
      );
      setCameraLoading(false);
      setCameraActive(false);
      return;
    }

    const useDeviceId = deviceIdOverride !== null ? deviceIdOverride : selectedDeviceId;
    const useFacingMode = facingModeOverride !== null ? facingModeOverride : facingMode;

    let stream = null;

    // Strategy 1: Attempt exact device or requested facing mode at high resolution (1080p)
    try {
      const constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      if (useDeviceId) {
        constraints.video.deviceId = { exact: useDeviceId };
      } else if (useFacingMode) {
        constraints.video.facingMode = useFacingMode;
      }

      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (primaryErr) {
      console.warn("Primary camera constraints failed, attempting fallback:", primaryErr);

      // Strategy 2: Fallback to generic video without strict constraints (solves desktop webcam OverconstrainedError)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (fallbackErr) {
        console.error("Camera fallback also failed:", fallbackErr);
        let errorMsg = "Unable to access camera hardware. Please check your browser permissions.";
        if (fallbackErr.name === "NotAllowedError" || fallbackErr.name === "PermissionDeniedError") {
          errorMsg = "Camera access was denied. Please allow camera permissions in your browser's address bar.";
        } else if (fallbackErr.name === "NotFoundError" || fallbackErr.name === "DevicesNotFoundError") {
          errorMsg = "No camera hardware detected on this device. You can upload a photograph directly using the button below.";
        } else if (fallbackErr.name === "NotReadableError" || fallbackErr.name === "TrackStartError") {
          errorMsg = "Camera is currently locked or in use by another application (e.g. Teams, Zoom, or another browser window).";
        }
        setCameraError(errorMsg);
        setCameraLoading(false);
        setCameraActive(false);
        return;
      }
    }

    if (!stream) {
      setCameraLoading(false);
      return;
    }

    streamRef.current = stream;

    // Inspect active video track for capabilities
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      if (typeof videoTrack.getCapabilities === "function") {
        const capabilities = videoTrack.getCapabilities();
        setTorchSupported(Boolean(capabilities.torch));
      }
      if (typeof videoTrack.getSettings === "function") {
        const settings = videoTrack.getSettings();
        if (settings.width && settings.height) {
          setVideoResolution(`${settings.width}x${settings.height}`);
        }
        if (settings.deviceId && !selectedDeviceId) {
          setSelectedDeviceId(settings.deviceId);
        }
      }
    }

    // Enumerate connected cameras for device selection
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === "videoinput");
      setVideoDevices(videoInputs);
    } catch (enumErr) {
      console.warn("Device enumeration failed:", enumErr);
    }

    // Attach stream to video element
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          setVideoResolution(`${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          videoRef.current.play().catch(playErr => {
            console.warn("Video play prevented:", playErr);
          });
        }
      };
    }

    setCameraActive(true);
    setCameraLoading(false);
  }, [selectedDeviceId, facingMode, stopCamera]);

  // Handle modal mount/unmount and opening
  useEffect(() => {
    if (isOpen) {
      startCamera();
      setSessionPhotos([]);
      setCapturedBlob(null);
      setCapturedPreview(null);
    } else {
      stopCamera();
      setCapturedBlob(null);
      setCapturedPreview(null);
      setCameraError(null);
      setSessionPhotos([]);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Keep video element attached to stream when switching between preview and live feed
  useEffect(() => {
    if (isOpen && !capturedPreview && cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn("Video replay error:", e));
      }
    }
  }, [isOpen, capturedPreview, cameraActive]);

  // Toggle Torch/Flashlight if supported
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && torchSupported) {
      try {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn("Failed to toggle torch:", err);
      }
    }
  };

  // Flip Camera (Rear vs Front)
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    setSelectedDeviceId("");
    startCamera("", nextMode);
  };

  // Select Specific Video Device
  const handleSelectDevice = (deviceId) => {
    setSelectedDeviceId(deviceId);
    startCamera(deviceId, null);
  };

  // Capture current video frame
  const handleCaptureFrame = (autoSaveToSession = false) => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual shutter flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const photoNum = sessionPhotos.length + 1;
        const filename = `live_panel_${photoNum}_${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: "image/jpeg" });
        const preview = URL.createObjectURL(blob);

        if (autoSaveToSession) {
          setSessionPhotos(prev => [...prev, { file, preview, name: filename }]);
          setCapturedBlob(null);
          setCapturedPreview(null);
        } else {
          setCapturedBlob(file);
          setCapturedPreview(preview);
        }
      }
    }, "image/jpeg", 0.95);
  };

  // Retake current captured photo
  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
  };

  // Add captured photo to session queue and continue snapping next panel
  const handleAddCurrentToSessionAndContinue = () => {
    if (capturedBlob) {
      setSessionPhotos(prev => [...prev, { 
        file: capturedBlob, 
        preview: capturedPreview,
        name: capturedBlob.name || `live_panel_${sessionPhotos.length + 1}.jpg`
      }]);
      setCapturedBlob(null);
      setCapturedPreview(null);
    } else {
      handleCaptureFrame(true);
    }
  };

  // Confirm single photo capture
  const handleConfirmSingle = () => {
    if (capturedBlob && onCapture) {
      onCapture(capturedBlob);
      onClose();
    }
  };

  // Confirm all queued photos in session
  const handleConfirmAllSessionPhotos = () => {
    const all = [...sessionPhotos];
    if (capturedBlob) {
      all.push({ 
        file: capturedBlob, 
        preview: capturedPreview,
        name: capturedBlob.name || `live_panel_${all.length + 1}.jpg`
      });
    }
    if (all.length > 0) {
      if (onCaptureMultiple) {
        onCaptureMultiple(all.map(p => p.file));
      } else if (onCapture) {
        onCapture(all[0].file);
      }
      onClose();
    }
  };

  // Remove photo from queue
  const handleRemoveSessionPhoto = (idx) => {
    setSessionPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // Fallback direct file input handler
  const handleFallbackFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (allowMultiple && files.length > 1) {
      if (onCaptureMultiple) {
        onCaptureMultiple(files);
      } else if (onCapture) {
        onCapture(files[0]);
      }
      onClose();
    } else {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      setCapturedBlob(file);
      setCapturedPreview(preview);
      setCameraError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(10, 25, 47, 0.88)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "14px",
        width: "100%",
        maxWidth: "840px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
        display: "flex",
        flexDirection: "column",
        border: "2px solid #0c3b6b"
      }}>

        {/* Top Government Title Header */}
        <div style={{
          background: "#0c3b6b",
          color: "#ffffff",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", color: "#93c5fd" }}>
              LEGAL METROLOGY OPTICAL PERCEPTION CAMERA
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "2px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Camera size={18} color="#38bdf8" /> Live Camera Scanner • {targetLabel}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {videoResolution && cameraActive && !capturedPreview && (
              <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: "6px", color: "#e0f2fe" }}>
                {videoResolution}
              </span>
            )}
            {sessionPhotos.length > 0 && (
              <span style={{ fontSize: "11px", fontWeight: 800, background: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: "12px" }}>
                {sessionPhotos.length} Photo{sessionPhotos.length > 1 ? "s" : ""} Queued
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <X size={14} /> Close
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div style={{
          position: "relative",
          width: "100%",
          height: "440px",
          background: "#071728",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}>

          {/* Visual Shutter Flash Effect */}
          {flashActive && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "#ffffff",
              zIndex: 30,
              pointerEvents: "none",
              opacity: 0.85,
              transition: "opacity 0.2s ease-out"
            }} />
          )}

          {cameraLoading ? (
            <div style={{ textAlign: "center", color: "#38bdf8", padding: "30px" }}>
              <RefreshCw size={36} className="animate-spin" style={{ margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Initializing Optical Camera Stream...</div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "4px" }}>Requesting hardware sensor clearance</div>
            </div>
          ) : cameraError ? (
            <div style={{ textAlign: "center", color: "#f87171", padding: "26px", maxWidth: "520px" }}>
              <AlertCircle size={42} color="#ef4444" style={{ margin: "0 auto 10px" }} />
              <div style={{ fontWeight: 800, fontSize: "15px", marginBottom: "8px", color: "#fecaca" }}>
                Camera Hardware Access Alert
              </div>
              <p style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#cbd5e1", marginBottom: "16px" }}>
                {cameraError}
              </p>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  style={{
                    background: "#0284c7",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <RefreshCw size={14} /> Retry Hardware Connection
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "#166534",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Upload size={14} /> Upload Image File Instead
                </button>
              </div>
            </div>
          ) : capturedPreview ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <img
                src={capturedPreview}
                alt="Captured Packaging Panel"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              <div style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                background: "rgba(22, 101, 52, 0.92)",
                color: "#ffffff",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
              }}>
                <Check size={14} /> SNAPSHOT CAPTURED • READY FOR STATUTORY OCR
              </div>
            </div>
          ) : (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />

              {/* Target Viewfinder Bounding Box */}
              <div style={{
                position: "absolute",
                top: "10%",
                left: "12%",
                width: "76%",
                height: "80%",
                border: "2px dashed #38bdf8",
                borderRadius: "10px",
                pointerEvents: "none",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.36)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: "12px"
              }}>
                <span style={{
                  background: "rgba(12, 59, 107, 0.88)",
                  color: "#ffffff",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  letterSpacing: "0.6px",
                  border: "1px solid rgba(56, 189, 248, 0.4)"
                }}>
                  ALIGN PACKAGING PANEL / MRP CRIMP / BARCODE WITHIN BOX
                </span>
              </div>

              {/* Top Controls Overlay: Switch Camera & Torch */}
              <div style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                display: "flex",
                gap: "8px",
                zIndex: 20
              }}>
                {torchSupported && (
                  <button
                    type="button"
                    onClick={handleToggleTorch}
                    title="Toggle Flashlight"
                    style={{
                      background: torchOn ? "#eab308" : "rgba(15, 23, 42, 0.82)",
                      color: torchOn ? "#0f172a" : "#ffffff",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    {torchOn ? <Zap size={14} /> : <ZapOff size={14} />} {torchOn ? "Torch On" : "Torch Off"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  title="Switch Front/Rear Camera"
                  style={{
                    background: "rgba(15, 23, 42, 0.82)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <FlipHorizontal size={14} /> {facingMode === "environment" ? "Rear View" : "Front View"}
                </button>
              </div>

              {/* Multi-Device Selector Dropdown (if multiple cameras detected) */}
              {videoDevices.length > 1 && (
                <div style={{
                  position: "absolute",
                  bottom: "14px",
                  left: "14px",
                  zIndex: 20
                }}>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleSelectDevice(e.target.value)}
                    style={{
                      background: "rgba(15, 23, 42, 0.85)",
                      color: "#ffffff",
                      border: "1px solid rgba(255, 255, 255, 0.35)",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer",
                      maxWidth: "240px"
                    }}
                  >
                    {videoDevices.map((dev, idx) => (
                      <option key={dev.deviceId || idx} value={dev.deviceId} style={{ background: "#0f172a", color: "#ffffff" }}>
                        {dev.label || `Camera Device ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Local File Input Fallback */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple={allowMultiple}
          style={{ display: "none" }}
          onChange={handleFallbackFileSelect}
        />

        {/* Multi-Photo Session Tray */}
        {sessionPhotos.length > 0 && (
          <div style={{
            background: "#f1f5f9",
            padding: "10px 18px",
            borderTop: "1px solid #cbd5e1",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            overflowX: "auto"
          }}>
            <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0c3b6b", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "5px" }}>
              <Layers size={14} /> Captured Panels ({sessionPhotos.length}):
            </span>
            {sessionPhotos.map((item, idx) => (
              <div key={idx} style={{
                position: "relative",
                width: "52px",
                height: "52px",
                borderRadius: "6px",
                overflow: "hidden",
                border: "2px solid #059669",
                flexShrink: 0
              }}>
                <img src={item.preview} alt={`Panel ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => handleRemoveSessionPhoto(idx)}
                  title="Remove this panel"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "rgba(185, 28, 28, 0.95)",
                    color: "#fff",
                    border: "none",
                    width: "18px",
                    height: "18px",
                    fontSize: "11px",
                    lineHeight: "18px",
                    textAlign: "center",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal Controls Footer */}
        <div style={{
          padding: "14px 20px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ fontSize: "11.5px", color: "#64748b" }}>
            {sessionPhotos.length > 0
              ? `${sessionPhotos.length} panel${sessionPhotos.length > 1 ? "s" : ""} queued. Click 'Done' to load into statutory scan.`
              : "Capture all statutory packaging panels (PDP, Back, MRP/USP Crimp, Manufacturer)."}
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Fallback File Select Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Upload size={14} /> Upload File
            </button>

            {capturedPreview ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Retake
                </button>
                {allowMultiple && (
                  <button
                    type="button"
                    onClick={handleAddCurrentToSessionAndContinue}
                    style={{
                      background: "#0284c7",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    + Add & Snap Next Panel
                  </button>
                )}
                <button
                  type="button"
                  onClick={sessionPhotos.length > 0 ? handleConfirmAllSessionPhotos : handleConfirmSingle}
                  style={{
                    background: "#166534",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(22, 101, 52, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Check size={15} /> Use This Photo
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                {allowMultiple && sessionPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={handleConfirmAllSessionPhotos}
                    style={{
                      background: "#166534",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 8px rgba(22, 101, 52, 0.3)"
                    }}
                  >
                    <Check size={15} /> Done (Use {sessionPhotos.length} Photos)
                  </button>
                )}

                {allowMultiple && (
                  <button
                    type="button"
                    onClick={() => handleCaptureFrame(true)}
                    disabled={!cameraActive}
                    style={{
                      background: "#0284c7",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: cameraActive ? "pointer" : "not-allowed",
                      opacity: cameraActive ? 1 : 0.6
                    }}
                  >
                    Capture & Next Side
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCaptureFrame(false)}
                  disabled={!cameraActive}
                  style={{
                    background: cameraActive ? "#0c3b6b" : "#94a3b8",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 22px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: cameraActive ? "pointer" : "not-allowed",
                    boxShadow: cameraActive ? "0 2px 10px rgba(12, 59, 107, 0.35)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Camera size={15} /> Capture Frame
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveCameraModal;
