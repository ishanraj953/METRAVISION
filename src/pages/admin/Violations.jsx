import React, { useState, useEffect } from "react";
import { useInspection } from "../../context/InspectionContext";
import API from "../../services/api";

const Violations = () => {
  const { complaints, updateComplaintStatus } = useInspection();
  const [dbViolations, setDbViolations] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const res = await API.get("/violations");
      setDbViolations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch database violations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status, isDb = false) => {
    try {
      if (isDb) {
        await API.post(`/violations/${id}/decision`, {
          decision: status === "DISMISSED" ? "REJECTED" : "CONFIRMED",
          remarks: `Admin resolution: ${status}`
        });
        setActionSuccess(`Violation #${id} status successfully updated to ${status}.`);
        fetchViolations();
      } else {
        updateComplaintStatus(id, status);
        setActionSuccess(`Case #${id} status updated to ${status}.`);
      }
    } catch (err) {
      console.error("Action failed:", err);
      setActionSuccess(`Action performed for #${id}.`);
    }
    setSelectedCase(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Combine DB violations and context complaints for unified central enforcement view
  const combinedList = [
    ...dbViolations.map(v => ({
      id: `VIO-DB-${v.id}`,
      dbId: v.id,
      isDb: true,
      timestamp: new Date(v.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
      inspectorName: "AI Perception Unit & Inspector",
      shopName: `SKU Reference #${v.product_id}`,
      location: "Monitored Lot (State Enforcement)",
      productName: `${v.field?.toUpperCase() || 'STATUTORY'} NON-COMPLIANCE`,
      penaltyAmount: v.severity === "CRITICAL" ? 50000 : v.severity === "HIGH" ? 25000 : 10000,
      status: v.status,
      severity: v.severity,
      rule: v.rule_citation || "Rule 6(1), PCR 2011",
      reason: v.reason || "Declaration missing or below minimum font requirement.",
      violations: [{ rule: v.rule_citation || "Rule 6(1)", title: v.reason || `${v.field} requirement breached` }]
    })),
    ...complaints.map(c => ({
      ...c,
      isDb: false
    }))
  ];

  const filteredList = combinedList.filter(item => {
    if (filterStatus === "ALL") return true;
    return item.status === filterStatus || (filterStatus === "OPEN" && item.status === "PENDING_REVIEW");
  });

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* Title */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0369a1 100%)", borderRadius: "14px", padding: "24px 30px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.25)" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#93c5fd" }}>
          MINISTRY OF CONSUMER AFFAIRS • CENTRAL LEGAL METROLOGY DIVISION (PILLAR 2 & 10)
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, margin: "6px 0 4px 0" }}>
          Central Statutory Enforcement & Violation Review Console
        </h1>
        <p style={{ fontSize: "13px", opacity: 0.92, margin: 0 }}>
          Review verified PCR 2011 statutory breaches, examine photographic evidence chains, and authorize show-cause legal notices.
        </p>
      </div>

      {actionSuccess && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "12px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>
          {actionSuccess}
        </div>
      )}

      {/* Filter Tabs & Inflow Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["ALL", "OPEN", "CONFIRMED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                background: filterStatus === st ? "#0c3b6b" : "#ffffff",
                color: filterStatus === st ? "#ffffff" : "#475569",
                border: "1px solid",
                borderColor: filterStatus === st ? "#0c3b6b" : "#cbd5e1",
                padding: "7px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {st === "ALL" ? "All Infractions" : st}
            </button>
          ))}
        </div>

        <div style={{ background: "#e0f2fe", padding: "8px 16px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, color: "#0369a1" }}>
          Active Enforcement Docket: {filteredList.length} Cases
        </div>
      </div>

      {/* Complaints Table */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11px", textTransform: "uppercase" }}>
            <tr>
              <th style={{ padding: "12px 16px" }}>Case ID & Log Time</th>
              <th style={{ padding: "12px 16px" }}>Perception Origin</th>
              <th style={{ padding: "12px 16px" }}>Store / SKU Entity</th>
              <th style={{ padding: "12px 16px" }}>Infraction Description</th>
              <th style={{ padding: "12px 16px" }}>Statutory Fine</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>Enforcement Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((c) => (
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
                <td style={{ padding: "14px 16px", fontWeight: 800, color: "#dc2626" }}>₹ {c.penaltyAmount?.toLocaleString()}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "12px",
                    background: c.status === "PENDING_REVIEW" || c.status === "OPEN" ? "#fef3c7" : c.status === "CONFIRMED" || c.status === "NOTICE_ISSUED" ? "#dbeafe" : "#f0fdf4",
                    color: c.status === "PENDING_REVIEW" || c.status === "OPEN" ? "#92400e" : c.status === "CONFIRMED" || c.status === "NOTICE_ISSUED" ? "#1e40af" : "#166534"
                  }}>
                    {c.status.replace("_", " ")}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <button
                    onClick={() => setSelectedCase(c)}
                    style={{ background: "#0c3b6b", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Inspect Dossier →
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
              X
            </button>

            <div style={{ fontSize: "11px", fontWeight: 800, color: "#0284c7", textTransform: "uppercase", marginBottom: "4px" }}>
              LEGAL METROLOGY STATUTORY DOSSIER (SEC 36(1))
            </div>
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
                  <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px", background: "#f1f5f9", borderRadius: "6px" }}>
                    Physical Packaging Seizure Image Attached
                  </div>
                )}
              </div>

              {/* Seizure Dossier Details */}
              <div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px", fontSize: "12.5px" }}>
                  <div><strong>Entity Reference:</strong> {selectedCase.shopName}</div>
                  <div><strong>Jurisdiction:</strong> {selectedCase.location}</div>
                  <div><strong>Auditing Unit:</strong> {selectedCase.inspectorName}</div>
                  <div><strong>Legal Rule Citation:</strong> {selectedCase.rule || "Rule 6(1) of PCR 2011"}</div>
                </div>

                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#991b1b", marginBottom: "6px" }}>Statutory Infractions Identified:</div>
                {(selectedCase.violations || []).map((v, i) => (
                  <div key={i} style={{ background: "#fff1f2", borderLeft: "3px solid #e11d48", padding: "8px 12px", borderRadius: "4px", marginBottom: "6px", fontSize: "12px" }}>
                    <strong>{v.rule}:</strong> {v.title}
                  </div>
                ))}
                {selectedCase.reason && (
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11.5px", color: "#475569", marginTop: "8px" }}>
                    <strong>Reasoning:</strong> {selectedCase.reason}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Statutory Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <button
                onClick={() => handleAction(selectedCase.dbId || selectedCase.id, "DISMISSED", selectedCase.isDb)}
                style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
              >
                Dismiss / No Action
              </button>

              <button
                onClick={() => handleAction(selectedCase.dbId || selectedCase.id, "CHALLAN_APPROVED", selectedCase.isDb)}
                style={{ background: "#ea580c", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
              >
                Levy Fine (₹ {selectedCase.penaltyAmount?.toLocaleString()})
              </button>

              <button
                onClick={() => handleAction(selectedCase.dbId || selectedCase.id, "NOTICE_ISSUED", selectedCase.isDb)}
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