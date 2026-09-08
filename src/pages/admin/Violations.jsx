import React, { useState } from "react";
import { useInspection } from "../../context/InspectionContext";

const Violations = () => {
  const { complaints, updateComplaintStatus } = useInspection();
  const [selectedCase, setSelectedCase] = useState(null);

  const handleAction = (id, status) => {
    updateComplaintStatus(id, status);
    setSelectedCase(null);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
            Central Enforcement & Violation Review Console
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            Review field inspection reports, inspect photo evidence, and approve statutory legal notices.
          </p>
        </div>
        <div style={{ background: "#e0f2fe", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, color: "#0369a1" }}>
          Active Inflow: {complaints.length} Cases
        </div>
      </div>

      {/* Complaints Table */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase" }}>
            <tr>
              <th style={{ padding: "12px 16px" }}>Case ID & Time</th>
              <th style={{ padding: "12px 16px" }}>Inspector</th>
              <th style={{ padding: "12px 16px" }}>Store & Location</th>
              <th style={{ padding: "12px 16px" }}>Commodity</th>
              <th style={{ padding: "12px 16px" }}>Fine (INR)</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontWeight: 800, color: "#0c3b6b" }}>{c.id}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{c.timestamp}</div>
                </td>
                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#334155" }}>{c.inspectorName}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{c.shopName}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{c.location}</div>
                </td>
                <td style={{ padding: "14px 16px", fontWeight: 600 }}>{c.productName}</td>
                <td style={{ padding: "14px 16px", fontWeight: 800, color: "#dc2626" }}>₹ {c.penaltyAmount.toLocaleString()}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "12px",
                    background: c.status === "PENDING_REVIEW" ? "#fef3c7" : c.status === "NOTICE_ISSUED" ? "#dbeafe" : "#f0fdf4",
                    color: c.status === "PENDING_REVIEW" ? "#92400e" : c.status === "NOTICE_ISSUED" ? "#1e40af" : "#166534"
                  }}>
                    {c.status.replace("_", " ")}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <button
                    onClick={() => setSelectedCase(c)}
                    style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Inspect Dossier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin Inspection & Action Modal */}
      {selectedCase && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "850px", maxHeight: "90vh", overflowY: "auto", padding: "26px", position: "relative" }}>
            
            <button
              onClick={() => setSelectedCase(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "#f1f5f9", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontWeight: 800 }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0c3b6b", margin: "0 0 16px 0" }}>
              Case File Review: {selectedCase.id}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "20px", marginBottom: "20px" }}>
              {/* Photo Evidence */}
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "8px" }}>CAPTURED FIELD PHOTO</div>
                {selectedCase.image ? (
                  <img src={selectedCase.image} alt="Field Evidence" style={{ maxWidth: "100%", maxHeight: "240px", objectFit: "contain", borderRadius: "6px" }} />
                ) : (
                  <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>
                    No Photo Attached
                  </div>
                )}
              </div>

              {/* Seizure Dossier Details */}
              <div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px", fontSize: "12.5px" }}>
                  <div><strong>Retailer:</strong> {selectedCase.shopName}</div>
                  <div><strong>Location:</strong> {selectedCase.location}</div>
                  <div><strong>Inspector:</strong> {selectedCase.inspectorName}</div>
                  <div><strong>Batch Ref:</strong> {selectedCase.batchNo}</div>
                </div>

                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#991b1b", marginBottom: "6px" }}>Identified Violations:</div>
                {selectedCase.violations.map((v, i) => (
                  <div key={i} style={{ background: "#fff1f2", borderLeft: "3px solid #e11d48", padding: "6px 10px", borderRadius: "4px", marginBottom: "6px", fontSize: "12px" }}>
                    <strong>{v.rule}:</strong> {v.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Statutory Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <button
                onClick={() => handleAction(selectedCase.id, "DISMISSED")}
                style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
              >
                Dismiss / No Action
              </button>

              <button
                onClick={() => handleAction(selectedCase.id, "CHALLAN_APPROVED")}
                style={{ background: "#ea580c", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
              >
                Levy Fine (₹ {selectedCase.penaltyAmount.toLocaleString()})
              </button>

              <button
                onClick={() => handleAction(selectedCase.id, "NOTICE_ISSUED")}
                style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
              >
                Dispatch Statutory Legal Notice
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Violations;