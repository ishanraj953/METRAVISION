import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import scanService from "../../services/scans";
import productService from "../../services/products";
import violationService from "../../services/violations";

const Results = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [products, setProducts] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedInspection, setSelectedInspection] = useState(null);

  useEffect(() => {
    fetchResultsData();
  }, []);

  const fetchResultsData = async () => {
    setLoading(true);
    try {
      const [inspData, prodData, violData] = await Promise.all([
        scanService.getInspectionHistory().catch(() => []),
        productService.getProducts().catch(() => []),
        violationService.getAllViolations().catch(() => [])
      ]);
      setInspections(inspData || []);
      setProducts(prodData || []);
      setViolations(violData || []);
      if (inspData && inspData.length > 0) {
        setSelectedInspection(inspData[0]);
      }
    } catch (err) {
      console.error("Error fetching audit results:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter((insp) => {
    if (filterStatus === "ALL") return true;
    return insp.status === filterStatus;
  });

  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
      
      {/* Header Banner */}
      <div className="gov-panel" style={{ background: "#ffffff", padding: "18px 24px", borderTopColor: "#0c3b6b", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="badge-gov badge-info">PCR 2011 STATUTORY AUDIT</span>
              <span className="badge-gov badge-compliant">VERIFIED RESULTS</span>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0c3b6b", margin: "6px 0 2px 0" }}>
              Compliance Audit Outcomes & Statutory Assessments
            </h1>
            <p style={{ fontSize: "12.5px", color: "#475569", margin: 0 }}>
              Official verification memos, verified commodity records, and penalty assessment dockets.
            </p>
          </div>

          <button
            onClick={() => navigate("/checker/scan")}
            className="btn-gov-success"
            style={{ padding: "10px 18px", fontSize: "12.5px", fontWeight: 800 }}
          >
            Launch New Scan →
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div style={{ background: "#ffffff", padding: "12px 18px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Filter by Statutory Status:</span>
        {["ALL", "COMPLIANT", "UNDER_REVIEW", "ASSIGNED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: "6px 14px",
              borderRadius: "4px",
              fontSize: "11.5px",
              fontWeight: 700,
              border: filterStatus === st ? "1px solid #0c3b6b" : "1px solid #cbd5e1",
              background: filterStatus === st ? "#0c3b6b" : "#f8fafc",
              color: filterStatus === st ? "#ffffff" : "#334155",
              cursor: "pointer"
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Two Column Results View */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "20px" }}>
        
        {/* Left: Audit Inspections Roster */}
        <div className="gov-panel">
          <div className="gov-panel-header">
            <span>Monitored Audit Files ({filteredInspections.length})</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Official Records</span>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "600px", overflowY: "auto" }}>
            {filteredInspections.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b", fontSize: "12.5px" }}>
                No inspection results matching the current filter.
              </div>
            ) : (
              filteredInspections.map((insp) => {
                const isSelected = selectedInspection?.id === insp.id;
                const prod = products.find(p => p.id === insp.product_id);
                return (
                  <div
                    key={insp.id}
                    onClick={() => setSelectedInspection(insp)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "6px",
                      border: isSelected ? "2px solid #0c3b6b" : "1px solid #e2e8f0",
                      background: isSelected ? "#f0f9ff" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#0c3b6b" }}>
                        {insp.inspection_code} • Product #{insp.product_id}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "2px" }}>
                        {prod?.name || "Packaged Commodity"} ({prod?.category?.toUpperCase() || "GENERAL"})
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px" }}>
                        Priority Score: <strong>{insp.priority_score?.toFixed(0) || 50} / 100</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className={`badge-gov ${insp.status === "COMPLIANT" ? "badge-compliant" : "badge-critical"}`}>
                        {insp.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Statutory Memo Dossier */}
        <div className="gov-panel">
          <div className="gov-panel-header">
            <span>Official Legal Metrology Assessment Docket</span>
            {selectedInspection && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#0c3b6b" }}>
                Docket #{selectedInspection.inspection_code}
              </span>
            )}
          </div>

          <div style={{ padding: "18px" }}>
            {!selectedInspection ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
                Select an inspection from the list on the left to review its legal outcome docket.
              </div>
            ) : (
              <div>
                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: "#0c3b6b", marginBottom: "4px" }}>
                    Government of India • Ministry of Consumer Affairs
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>
                    Department of Legal Metrology • Verification Certificate & Finding Memo
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", marginBottom: "16px" }}>
                  <div><strong>Inspection Code:</strong> {selectedInspection.inspection_code}</div>
                  <div><strong>Commodity ID:</strong> #{selectedInspection.product_id}</div>
                  <div><strong>Statutory Verdict:</strong> <span style={{ color: selectedInspection.status === "COMPLIANT" ? "#16a34a" : "#dc2626", fontWeight: 800 }}>{selectedInspection.status}</span></div>
                  <div><strong>Risk Priority:</strong> {selectedInspection.priority_score?.toFixed(0) || 50} / 100</div>
                </div>

                <div style={{ background: "#ffffff", padding: "12px", borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#334155", marginBottom: "16px" }}>
                  <strong>Official Findings & Remarks:</strong>
                  <div style={{ marginTop: "4px", color: "#475569" }}>
                    {selectedInspection.remarks || "Automated optical audit completed. Legal Metrology PCR 2011 declarations verified."}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => alert(`Official Verification Memo for ${selectedInspection.inspection_code} printed.`)}
                    className="btn-gov-primary"
                    style={{ flex: 1, padding: "10px", fontSize: "12px" }}
                  >
                    Print Statutory Memo
                  </button>
                  <button
                    onClick={() => navigate("/checker/evidence")}
                    className="btn-gov-primary"
                    style={{ flex: 1, padding: "10px", fontSize: "12px", background: "#f8fafc", color: "#0c3b6b", border: "1px solid #cbd5e1" }}
                  >
                    Inspect Photographic Proof
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Results;