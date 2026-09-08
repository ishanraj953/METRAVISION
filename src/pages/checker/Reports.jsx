import React, { useState } from "react";
import { useInspection } from "../../context/InspectionContext";
import { useAuth } from "../../context/AuthContext";
import emblemImage from "../../assets/india.png"; // <-- Yahan image import ki gayi hai

const Reports = () => {
  const { complaints } = useInspection();
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);

  // Print Function using Imported Asset
  const handlePrintMemo = () => {
    if (!selectedReport) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    printWindow.document.write(`
      <html>
        <head>
          <title>Seizure Memo - ${selectedReport.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; color: #000; background: #fff; }
            .memo-container { border: 2.5px solid #0c3b6b; padding: 28px; border-radius: 6px; max-width: 720px; margin: 0 auto; position: relative; }
            .emblem-badge { text-align: center; margin-bottom: 6px; }
            .emblem-img { width: 50px; height: auto; display: block; margin: 0 auto; }
            .satyamev { font-size: 10px; font-weight: bold; letter-spacing: 1.5px; color: #0c3b6b; margin-top: 3px; font-family: sans-serif; text-transform: uppercase; }
            .header { text-align: center; border-bottom: 2px solid #0c3b6b; padding-bottom: 12px; margin-bottom: 16px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12.5px; margin-bottom: 14px; }
            .box { background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12.5px; margin-bottom: 14px; }
            .violations { font-size: 12.5px; margin-bottom: 16px; }
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
              <div style="font-weight: 900; font-size: 15px; color: #0c3b6b; letter-spacing: 0.5px;">GOVERNMENT OF INDIA</div>
              <div style="font-weight: 800; font-size: 12.5px; color: #1e293b; margin-top: 2px;">MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</div>
              <div style="font-weight: 700; font-size: 11.5px; color: #475569; margin-top: 2px;">LEGAL METROLOGY ENFORCEMENT WING</div>
              <div style="font-size: 10.5px; color: #64748b; margin-top: 4px;">OFFICIAL INSPECTION & SEIZURE MEMO (PCR RULES, 2011)</div>
            </div>

            <div class="grid">
              <div><strong>Memo ID:</strong> ${selectedReport.id}</div>
              <div><strong>Timestamp:</strong> ${selectedReport.date}</div>
              <div><strong>Assigned Inspector:</strong> ${selectedReport.inspector}</div>
              <div><strong>Enforcement Status:</strong> ${selectedReport.status}</div>
            </div>

            <div class="box">
              <div><strong>Retail Establishment:</strong> ${selectedReport.shopName}</div>
              <div><strong>Jurisdiction Location:</strong> ${selectedReport.location}</div>
              <div><strong>Commodity Audited:</strong> ${selectedReport.commodity}</div>
            </div>

            <div class="violations">
              <strong style="color: #991b1b;">CONTRAVENTIONS / VIOLATIONS RECORDED:</strong>
              <ul style="margin: 6px 0 0 20px; padding: 0;">
                ${selectedReport.violations.map(v => `<li style="margin-bottom: 4px;">${v}</li>`).join("")}
              </ul>
            </div>

            <div class="fine-box">
              <span>PROPOSED COMPOUNDING PENALTY FINE:</span>
              <span>${selectedReport.fine}</span>
            </div>

            <div class="signatures">
              <div>
                <div>_____________________________</div>
                <div style="font-weight: bold; margin-top: 4px;">Authorized Inspector Signature</div>
                <div style="font-size: 10px; color: #64748b;">Legal Metrology Wing</div>
              </div>
              <div style="text-align: right;">
                <div>_____________________________</div>
                <div style="font-weight: bold; margin-top: 4px;">Store Manager / Owner Seal</div>
                <div style="font-size: 10px; color: #64748b;">Establishment Acknowledgment</div>
              </div>
            </div>

          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
            Official Inspection & Seizure Reports Hub
          </h1>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
            Generate, view, and print court-admissible Legal Metrology PCR 2011 compliance memos.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "6px 14px", borderRadius: "14px", fontWeight: 700 }}>
            Total Generated Memos: {Math.max(12, complaints.length + 5)}
          </span>
        </div>
      </div>

      {/* Reports Grid & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        
        {/* Left: List of Filed Seizure Cases */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
            📋 Select Case Dossier for Official Memo
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "450px", overflowY: "auto" }}>
            
            {/* Default Mock Report 1 */}
            <div 
              onClick={() => setSelectedReport({
                id: "MEMO-LM-884102",
                date: "08 Sep 2026, 14:30 IST",
                shopName: "Sharma Supermarket",
                location: "Main Market, Ring Road, Guntur, AP",
                inspector: user?.name || "CHECKER Officer (CHK-109)",
                commodity: "Vicks VapoRub Topical Jar (25ml)",
                violations: ["Rule 6(1)(c) - Net Quantity Metric Font Height Defect", "Rule 6(1)(d) - Expiry Date Partial Blur"],
                fine: "₹ 25,000",
                status: "Seized & Forwarded"
              })}
              style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1", cursor: "pointer", transition: "all 0.15s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0c3b6b" }}>MEMO-LM-884102</span>
                <span style={{ fontSize: "10.5px", background: "#fef2f2", color: "#991b1b", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>₹ 25,000 Fine</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", margin: "4px 0" }}>Sharma Supermarket, Guntur</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Product: Vicks VapoRub • 08 Sep 2026</div>
            </div>

            {/* Dynamic Complaints from Context */}
            {complaints.map((c, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedReport({
                  id: c.id,
                  date: c.timestamp,
                  shopName: c.shopName,
                  location: c.location || "Guntur Central Zone, AP",
                  inspector: c.inspectorName,
                  commodity: c.productName,
                  violations: c.violations?.length > 0 ? c.violations.map(v => v.title) : ["No Violations - Fully Compliant"],
                  fine: `₹ ${c.penaltyAmount?.toLocaleString() || 0}`,
                  status: c.status
                })}
                style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1", cursor: "pointer", transition: "all 0.15s" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#0c3b6b" }}>{c.id}</span>
                  <span style={{ fontSize: "10.5px", background: c.penaltyAmount > 0 ? "#fef2f2" : "#f0fdf4", color: c.penaltyAmount > 0 ? "#991b1b" : "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                    ₹ {c.penaltyAmount?.toLocaleString() || 0}
                  </span>
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", margin: "4px 0" }}>{c.shopName}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Product: {c.productName} • {c.timestamp}</div>
              </div>
            ))}

          </div>
        </div>

        {/* Right: Printable Official Seizure Memo Preview */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              📄 Official Government Seizure Memo Preview
            </h3>
            {selectedReport && (
              <button
                onClick={handlePrintMemo}
                style={{ background: "#0c3b6b", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
              >
                🖨️ Print / Save PDF
              </button>
            )}
          </div>

          {!selectedReport ? (
            <div style={{ padding: "80px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
              👈 Select a case dossier from the left list to preview the official Legal Metrology Seizure Memo.
            </div>
          ) : (
            <div style={{ background: "#fdfdfd", padding: "20px", borderRadius: "10px", border: "2px solid #0c3b6b", fontFamily: "Courier New, monospace" }}>
              
              {/* Emblem Image on Preview Screen */}
              <div style={{ textAlign: "center", marginBottom: "6px" }}>
                <img src={emblemImage} alt="National Emblem" style={{ width: "48px", height: "auto", display: "block", margin: "0 auto" }} />
                <div style={{ fontSize: "9.5px", fontWeight: "bold", letterSpacing: "1.5px", color: "#1e293b", marginTop: "3px", fontFamily: "sans-serif" }}>सत्यमेव जयते</div>
              </div>

              {/* Memo Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #0c3b6b", paddingBottom: "10px", marginBottom: "14px" }}>
                <div style={{ fontWeight: 900, fontSize: "13px", color: "#0c3b6b" }}>GOVERNMENT OF INDIA</div>
                <div style={{ fontWeight: 800, fontSize: "11px", color: "#1e293b" }}>MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</div>
                <div style={{ fontWeight: 700, fontSize: "10.5px", color: "#475569" }}>LEGAL METROLOGY ENFORCEMENT WING</div>
              </div>

              {/* Memo Metadata */}
              <div style={{ fontSize: "11.5px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                <div><strong>Memo ID:</strong> {selectedReport.id}</div>
                <div><strong>Timestamp:</strong> {selectedReport.date}</div>
                <div><strong>Inspector:</strong> {selectedReport.inspector}</div>
                <div><strong>Status:</strong> {selectedReport.status}</div>
              </div>

              {/* Establishment Details */}
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", fontSize: "11.5px", marginBottom: "14px", border: "1px solid #e2e8f0" }}>
                <div><strong>Retail Establishment:</strong> {selectedReport.shopName}</div>
                <div><strong>Location:</strong> {selectedReport.location}</div>
                <div><strong>Commodity Audited:</strong> {selectedReport.commodity}</div>
              </div>

              {/* Violations & Penalties */}
              <div style={{ fontSize: "11.5px", marginBottom: "16px" }}>
                <div style={{ fontWeight: 800, marginBottom: "4px", color: "#991b1b" }}>CONTRAVENTIONS / VIOLATIONS RECORDED:</div>
                <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "#1e293b" }}>
                  {selectedReport.violations.map((v, i) => (
                    <li key={i} style={{ marginBottom: "3px" }}>{v}</li>
                  ))}
                </ul>
              </div>

              {/* Fine Summary */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fef2f2", border: "1px solid #fca5a5", padding: "10px 14px", borderRadius: "6px", marginBottom: "20px" }}>
                <span style={{ fontWeight: 800, fontSize: "12px", color: "#991b1b" }}>PROPOSED COMPOUNDING FINE:</span>
                <span style={{ fontWeight: 800, fontSize: "14px", color: "#dc2626" }}>{selectedReport.fine}</span>
              </div>

              {/* Footer Signatures */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", marginTop: "30px", borderTop: "1px dashed #cbd5e1", paddingTop: "12px" }}>
                <div>
                  <div>_________________________</div>
                  <div style={{ fontWeight: 700, marginTop: "2px" }}>Inspector Signature & Seal</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>_________________________</div>
                  <div style={{ fontWeight: 700, marginTop: "2px" }}>Store Manager Acknowledgment</div>
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