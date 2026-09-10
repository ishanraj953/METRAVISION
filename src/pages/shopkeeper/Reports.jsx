import React, { useState, useEffect } from "react";
import API, { API_BASE_URL } from "../../services/api";
import { downloadPDFWithAuth } from "../../services/reports";

const ShopkeeperReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await API.get("/reports");
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    setGenerating(true);
    try {
      const res = await API.post("/reports", {
        report_type: "SHOPKEEPER",
        format: "PDF"
      });
      if (res.data && res.data.id) {
        downloadPDFWithAuth(`/reports/${res.data.id}/download`, `Statutory_Report_${res.data.id}.pdf`);
      }
      fetchReports();
    } catch (err) {
      console.error("Failed to generate certificate:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (id) => {
    downloadPDFWithAuth(`/reports/${id}/download`, `Statutory_Report_${id}.pdf`);
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
            Merchant Compliance Certificates & Audit Records
          </h1>
          <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
            Generate and download official Legal Metrology (PCR 2011) self-compliance verification certificates.
          </p>
        </div>
        <button
          onClick={handleGenerateCertificate}
          disabled={generating}
          style={{ background: "#ffffff", color: "#0c3b6b", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: generating ? "not-allowed" : "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
        >
          {generating ? "Generating..." : "Generate Compliance Certificate (PDF)"}
        </button>
      </div>

      {/* Reports Table */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Official Compliance Documents ({reports.length})
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            MongoDB 8.0 Synchronized Repository
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading compliance documents...</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              No compliance certificates generated yet. Click "Generate Compliance Certificate" above.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                  <th style={{ padding: "14px 20px" }}>Document Title & Ref</th>
                  <th style={{ padding: "14px 20px" }}>Format</th>
                  <th style={{ padding: "14px 20px" }}>Issue Date</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                      {item.report_type.replace(/_/g, " ")} Certificate
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Ref: DOC-#{item.id}</div>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#0284c7", fontWeight: 600 }}>{item.format}</td>
                    <td style={{ padding: "14px 20px", color: "#475569" }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString("en-IN") : "Recent"}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDownload(item.id)}
                        style={{ background: "#0c3b6b", border: "none", color: "#ffffff", padding: "6px 14px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default ShopkeeperReports;
