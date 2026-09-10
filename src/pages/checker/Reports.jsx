import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API, { API_BASE_URL } from "../../services/api";
import emblemImage from "../../assets/india.png";

const Reports = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inspRes, repRes] = await Promise.all([
        API.get("/inspections").catch(() => ({ data: [] })),
        API.get("/reports").catch(() => ({ data: [] }))
      ]);
      const insps = inspRes.data || [];
      setInspections(insps);
      setReports(repRes.data || []);
      if (insps.length > 0) {
        setSelectedInspection(insps[0]);
      }
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (inspectionId) => {
    if (!inspectionId) return;
    setDownloadingId(inspectionId);
    try {
      window.open(`${API_BASE_URL}/reports/inspection/${inspectionId}/download`, "_blank");
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const handlePrintLocalMemo = () => {
    if (!selectedInspection) return;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Legal Metrology Inspection Memo - ${selectedInspection.inspection_code || selectedInspection.id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #0f172a; background: #fff; }
            .memo-container { border: 2.5px solid #0c3b6b; padding: 28px; border-radius: 6px; max-width: 720px; margin: 0 auto; position: relative; }
            .emblem-badge { text-align: center; margin-bottom: 6px; }
            .emblem-img { width: 50px; height: auto; display: block; margin: 0 auto; }
            .satyamev { font-size: 10px; font-weight: bold; letter-spacing: 1.5px; color: #0c3b6b; margin-top: 3px; font-family: sans-serif; text-transform: uppercase; }
            .header { text-align: center; border-bottom: 2px solid #0c3b6b; padding-bottom: 12px; margin-bottom: 16px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12.5px; margin-bottom: 14px; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #cbd5e1; }
            .box { background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12.5px; margin-bottom: 14px; }
            .fine-box { display: flex; justify-content: space-between; background: #fef2f2; border: 1px solid #fca5a5; padding: 10px 14px; border-radius: 4px; font-weight: bold; margin-bottom: 24px; color: #991b1b; font-size: 13px; }
            .signatures { display: flex; justify-content: space-between; font-size: 11.5px; margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="memo-container">
            <div class="emblem-badge">
              <img src="${emblemImage}" class="emblem-img" alt="National Emblem" />
              <div class="satyamev">सत्यमेव जयते</div>
            </div>
            <div class="header">
              <div style="font-weight: 900; font-size: 15px; color: #0c3b6b;">GOVERNMENT OF INDIA</div>
              <div style="font-weight: 800; font-size: 12.5px; color: #1e293b; margin-top: 2px;">MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</div>
              <div style="font-weight: 700; font-size: 11.5px; color: #475569; margin-top: 2px;">LEGAL METROLOGY ENFORCEMENT & SURVEILLANCE CELL</div>
              <div style="font-size: 10.5px; color: #64748b; margin-top: 4px;">STATUTORY AUDIT & SEIZURE MEMORANDUM (PCR RULES, 2011)</div>
            </div>
            <div class="grid">
              <div><strong>Docket Code:</strong> ${selectedInspection.inspection_code || 'INSP-2026'}</div>
              <div><strong>Audit Timestamp:</strong> ${selectedInspection.inspected_at ? new Date(selectedInspection.inspected_at).toLocaleString('en-IN') : 'Official Audit'}</div>
              <div><strong>Enforcement Officer:</strong> ${user?.full_name || 'Legal Metrology Inspector'}</div>
              <div><strong>Inspection Status:</strong> <span style="color: ${selectedInspection.status === 'COMPLIANT' ? '#166534' : '#b91c1c'}; font-weight: bold;">${selectedInspection.status}</span></div>
            </div>
            <div class="box">
              <div><strong>Target Product ID:</strong> #${selectedInspection.product_id || 'N/A'}</div>
              <div><strong>Priority / Risk Score:</strong> ${selectedInspection.priority_score || 0} / 100</div>
              <div><strong>Officer Observations:</strong> ${selectedInspection.remarks || 'Mandatory optical declarations audited.'}</div>
            </div>
            <div class="fine-box">
              <span>STATUTORY COMPOUNDING PENALTY (SECTION 36(1)):</span>
              <span>₹ ${((selectedInspection.status !== 'COMPLIANT' ? 25000 : 0)).toLocaleString()}</span>
            </div>
            <div class="signatures">
              <div>
                <div>_____________________________</div>
                <div style="font-weight: bold; margin-top: 4px;">Authorized Legal Metrology Inspector</div>
                <div style="font-size: 10px; color: #64748b;">Central Enforcement Division</div>
              </div>
              <div style="text-align: right;">
                <div>_____________________________</div>
                <div style="font-weight: bold; margin-top: 4px;">Establishment Seal & Receipt</div>
                <div style="font-size: 10px; color: #64748b;">Statutory Acknowledgment</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1500px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
            Official Statutory Inspection Reports Hub
          </h1>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
            Generate, preview, and download court-admissible Legal Metrology PCR 2011 compliance reports synced with MongoDB 8.0 & SQLite.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "6px 14px", borderRadius: "14px", fontWeight: 700 }}>
            Total Inspections Dossiers: {inspections.length}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        
        {/* Left: Inspection Dossiers List */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 14px 0" }}>
            Select Inspection Dossier
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading inspection records...</div>
            ) : inspections.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                No inspection dossiers recorded yet. Run a multi-panel scan to generate an inspection record.
              </div>
            ) : (
              inspections.map((c) => {
                const isSelected = selectedInspection?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedInspection(c)}
                    style={{
                      padding: "14px",
                      background: isSelected ? "#f0f9ff" : "#f8fafc",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #0284c7" : "1px solid #cbd5e1",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "#0c3b6b" }}>
                        {c.inspection_code || `INSP-#${c.id}`}
                      </span>
                      <span style={{
                        fontSize: "10.5px",
                        background: c.status === "COMPLIANT" ? "#dcfce7" : "#fee2e2",
                        color: c.status === "COMPLIANT" ? "#166534" : "#991b1b",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: 700
                      }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", margin: "4px 0" }}>
                      Target Product Ref: #{c.product_id}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Priority Score: {c.priority_score || 0}/100 • {c.inspected_at ? new Date(c.inspected_at).toLocaleString("en-IN") : "Recent"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Dossier Preview & PDF Download */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Official Inspection Dossier & Report Generator
            </h3>
            {selectedInspection && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleDownloadPDF(selectedInspection.id)}
                  disabled={downloadingId === selectedInspection.id}
                  style={{
                    background: "#0c3b6b",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: downloadingId === selectedInspection.id ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(12,59,107,0.2)"
                  }}
                >
                  {downloadingId === selectedInspection.id ? "Generating PDF..." : "Download Official PDF Report"}
                </button>
                <button
                  onClick={handlePrintLocalMemo}
                  style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                >
                  Print View
                </button>
              </div>
            )}
          </div>

          {!selectedInspection ? (
            <div style={{ padding: "80px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
              Select an inspection record from the left list to generate or download the statutory PDF report.
            </div>
          ) : (
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "10px", border: "2px solid #0c3b6b" }}>
              
              <div style={{ textAlign: "center", marginBottom: "6px" }}>
                <img src={emblemImage} alt="National Emblem" style={{ width: "48px", height: "auto", display: "block", margin: "0 auto" }} />
                <div style={{ fontSize: "9.5px", fontWeight: "bold", letterSpacing: "1.5px", color: "#1e293b", marginTop: "3px" }}>सत्यमेव जयते</div>
              </div>

              <div style={{ textAlign: "center", borderBottom: "2px solid #0c3b6b", paddingBottom: "10px", marginBottom: "14px" }}>
                <div style={{ fontWeight: 900, fontSize: "13.5px", color: "#0c3b6b" }}>GOVERNMENT OF INDIA</div>
                <div style={{ fontWeight: 800, fontSize: "11.5px", color: "#1e293b" }}>MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</div>
                <div style={{ fontWeight: 700, fontSize: "10.5px", color: "#475569" }}>CENTRAL LEGAL METROLOGY ENFORCEMENT DIVISION</div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>STATUTORY AUDIT & COMPLIANCE INSPECTION RECORD (PCR 2011)</div>
              </div>

              <div style={{ fontSize: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px", background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div><strong>Docket Ref:</strong> {selectedInspection.inspection_code || `INSP-#${selectedInspection.id}`}</div>
                <div><strong>Timestamp:</strong> {selectedInspection.inspected_at ? new Date(selectedInspection.inspected_at).toLocaleString("en-IN") : "Recent"}</div>
                <div><strong>Assigned Officer:</strong> {user?.full_name || "Authorized Inspector"}</div>
                <div><strong>Enforcement Finding:</strong> <span style={{ fontWeight: 800, color: selectedInspection.status === "COMPLIANT" ? "#166534" : "#991b1b" }}>{selectedInspection.status}</span></div>
              </div>

              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", fontSize: "12px", marginBottom: "14px", border: "1px solid #e2e8f0" }}>
                <div><strong>Product ID:</strong> #{selectedInspection.product_id}</div>
                <div><strong>Calculated Risk Score:</strong> {selectedInspection.priority_score || 0} / 100</div>
                <div><strong>Remarks:</strong> {selectedInspection.remarks || "Mandatory optical declarations verified."}</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fef2f2", border: "1px solid #fca5a5", padding: "10px 14px", borderRadius: "6px", marginBottom: "20px" }}>
                <span style={{ fontWeight: 800, fontSize: "12px", color: "#991b1b" }}>ESTIMATED SECTION 36(1) COMPOUNDING PENALTY:</span>
                <span style={{ fontWeight: 800, fontSize: "14px", color: "#dc2626" }}>
                  ₹ {selectedInspection.status !== "COMPLIANT" ? "25,000" : "0 (NIL)"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", marginTop: "24px", borderTop: "1px dashed #cbd5e1", paddingTop: "12px" }}>
                <div>
                  <div>_________________________</div>
                  <div style={{ fontWeight: 700, marginTop: "2px" }}>Inspector Signature & Seal</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>_________________________</div>
                  <div style={{ fontWeight: 700, marginTop: "2px" }}>Establishment Acknowledgment</div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Reports;
