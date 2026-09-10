import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Building2, 
  ArrowLeft, 
  ShieldAlert, 
  FileText, 
  IndianRupee, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  AlertTriangle
} from "lucide-react";

import API from "../../services/api";

const EntityProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/responsible-parties/${id}`);
        if (res.data) setParty(res.data);
      } catch (err) {
        console.error("Entity profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading entity profile...</div>;
  }

  if (!party) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Entity Not Found</h3>
        <button onClick={() => navigate("/enforcement/responsible-parties")} className="btn-gov-secondary">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", background: "#ffffff", padding: "16px 20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/enforcement/responsible-parties")} className="btn-gov-secondary" style={{ padding: "6px 10px" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
                {party.name}
              </h1>
              <span style={{ fontSize: "11px", background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                {party.entity_type}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              Registration Number: {party.registration_number || "Not Registered (PCR Rule 27 Investigation)"}
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate("/enforcement/inspect")} 
          className="btn-gov-primary"
          style={{ background: "#166534" }}
        >
          Initiate Field Inspection
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <div className="gov-card">
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>TOTAL INSPECTIONS</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
            {party.total_inspections || 0}
          </div>
        </div>

        <div className="gov-card">
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>RECORDED VIOLATIONS</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: party.total_violations > 1 ? "#dc2626" : "#166534", marginTop: "4px" }}>
            {party.total_violations || 0}
          </div>
        </div>

        <div className="gov-card">
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>OPEN ENFORCEMENT CASES</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0284c7", marginTop: "4px" }}>
            {party.open_cases || 0}
          </div>
        </div>

        <div className="gov-card">
          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>PENALTIES COLLECTED</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>
            ₹{Number(party.total_penalties || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Profile Details & Contacts */}
      <div className="gov-card">
        <div className="gov-card-header">
          <div className="gov-card-title">
            <Building2 size={16} color="#0c3b6b" /> Statutory Registration & Address Details
          </div>
        </div>
        <table style={{ width: "100%", fontSize: "13px", lineHeight: "2" }}>
          <tbody>
            <tr>
              <td style={{ color: "#64748b", width: "30%" }}>Registered Address</td>
              <td style={{ fontWeight: 600 }}>{party.address || "Address not on file"}</td>
            </tr>
            <tr>
              <td style={{ color: "#64748b" }}>City / State / Pincode</td>
              <td>{party.city || "N/A"}, {party.state || "National"} {party.pincode ? `- ${party.pincode}` : ""}</td>
            </tr>
            <tr>
              <td style={{ color: "#64748b" }}>Contact Person / Director</td>
              <td style={{ fontWeight: 600 }}>{party.contact_person || "Compliance Officer"}</td>
            </tr>
            <tr>
              <td style={{ color: "#64748b" }}>Official Email</td>
              <td>{party.email || "N/A"}</td>
            </tr>
            <tr>
              <td style={{ color: "#64748b" }}>Phone Number</td>
              <td>{party.phone || "N/A"}</td>
            </tr>
            <tr>
              <td style={{ color: "#64748b" }}>Associated Brand Names</td>
              <td style={{ fontWeight: 700, color: "#0c3b6b" }}>{party.brand_name || "N/A"}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default EntityProfile;
