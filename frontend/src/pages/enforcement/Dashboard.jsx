import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShieldAlert, 
  FileText, 
  AlertTriangle, 
  IndianRupee, 
  Building2, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  PlusCircle, 
  Search,
  Filter,
  RefreshCw,
  Bell
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import API from "../../services/api";

const EnforcementDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [repeatOffenders, setRepeatOffenders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isInspector = user?.role === "CHECKER";

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const kpiUrl = isInspector
        ? `/cases/dashboard/kpi?my_cases_only=true&officer_id=${user?.id || ''}`
        : `/cases/dashboard/kpi`;

      const casesUrl = isInspector
        ? `/cases?limit=5&my_cases_only=true&officer_id=${user?.id || ''}`
        : `/cases?limit=5`;

      const [kpiRes, casesRes, partiesRes] = await Promise.all([
        API.get(kpiUrl).catch(() => null),
        API.get(casesUrl).catch(() => null),
        API.get(`/responsible-parties?limit=5`).catch(() => null)
      ]);

      if (kpiRes && kpiRes.data) setKpis(kpiRes.data);
      if (casesRes && casesRes.data) setRecentCases(casesRes.data.items || []);
      if (partiesRes && partiesRes.data) setRepeatOffenders(partiesRes.data.items || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, user?.role]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", background: "#ffffff", padding: "16px 20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
              Legal Metrology Enforcement Command Center
            </h1>
            {isInspector && (
              <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>
                Inspector View: {user?.full_name || "Inspector Vikram Singh"}
              </span>
            )}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#475569" }}>
            {isInspector 
              ? `Monitoring enforcement cases, notices, and compounding actions handled by your officer badge.`
              : `Packaged Commodities Rules (PCR) 2011 & Legal Metrology Act, 2009 Statutory Compliance Monitor`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button 
            onClick={fetchDashboardData} 
            className="btn-gov-secondary"
            title="Refresh KPIs"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button 
            onClick={() => navigate("/enforcement/inspect")} 
            className="btn-gov-primary"
            style={{ background: "#166534" }}
          >
            <PlusCircle size={15} /> New Statutory Inspection
          </button>
        </div>
      </div>

      {/* Statutory Alert Banner */}
      <div className="statutory-disclaimer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldAlert size={18} color="#b45309" />
          <span>
            <strong>Statutory Notice:</strong> Automated detections serve as evidentiary recommendations. All Show Cause Notices and Compounding Penalties require explicit <strong>Officer Confirmation</strong>.
          </span>
        </div>
        <Link to="/enforcement/notifications" style={{ color: "#92400e", fontWeight: 700, fontSize: "12px", textDecoration: "underline" }}>
          View Officer Alerts & Deadlines →
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        {/* Total Active Cases */}
        <div className="gov-card" style={{ borderLeft: "4px solid #0284c7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Active Cases</div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                {kpis ? kpis.active_cases : 0}
              </div>
            </div>
            <div style={{ background: "#e0f2fe", padding: "8px", borderRadius: "8px", color: "#0284c7" }}>
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "8px" }}>
            {kpis?.status_breakdown?.UNDER_REVIEW || 0} Under Review • {kpis?.total_cases || 0} Total Logged
          </div>
        </div>

        {/* Pending Notices */}
        <div className="gov-card" style={{ borderLeft: "4px solid #dc2626" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Show Cause Notices</div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#991b1b", marginTop: "4px" }}>
                {kpis ? kpis.notices_pending : 0}
              </div>
            </div>
            <div style={{ background: "#fee2e2", padding: "8px", borderRadius: "8px", color: "#dc2626" }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: "11.5px", color: "#b91c1c", marginTop: "8px", fontWeight: 600 }}>
            Awaiting party written representation
          </div>
        </div>

        {/* Penalties Imposed / Collected */}
        <div className="gov-card" style={{ borderLeft: "4px solid #16a34a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Compounding Imposed</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>
                ₹{kpis ? Number(kpis.penalties_imposed_inr || 0).toLocaleString("en-IN") : "0"}
              </div>
            </div>
            <div style={{ background: "#f0fdf4", padding: "8px", borderRadius: "8px", color: "#16a34a" }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "8px" }}>
            Collected: ₹{kpis ? Number(kpis.penalties_collected_inr || 0).toLocaleString("en-IN") : "0"}
          </div>
        </div>

        {/* Repeat Offenders Flagged */}
        <div className="gov-card" style={{ borderLeft: "4px solid #ea580c" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Repeat Offenders</div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#c2410c", marginTop: "4px" }}>
                {kpis ? kpis.repeat_offenders_count : 0}
              </div>
            </div>
            <div style={{ background: "#fff7ed", padding: "8px", borderRadius: "8px", color: "#ea580c" }}>
              <Building2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: "11.5px", color: "#9a3412", marginTop: "8px", fontWeight: 600 }}>
            Subject to enhanced Sec 36(1) / 39 penalties
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Cases & Entity Directory Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "20px" }}>
        
        {/* Recent Cases Table */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <FileText size={16} color="#0c3b6b" /> Recent Enforcement Cases
            </div>
            <Link to="/enforcement/cases" style={{ fontSize: "12px", color: "#0c3b6b", fontWeight: 700, textDecoration: "none" }}>
              View All Cases ({kpis?.total_cases || 0}) →
            </Link>
          </div>

          <div className="gov-table-wrapper">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Product / Commodity</th>
                  <th>Responsible Entity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                      No enforcement cases recorded yet. Start a new inspection.
                    </td>
                  </tr>
                ) : (
                  recentCases.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: "#0c3b6b" }}>{c.case_number}</td>
                      <td>{c.product_name || "Pre-Packaged Commodity"}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{c.responsible_party_name || "Unassigned"}</span>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{c.entity_type}</div>
                      </td>
                      <td>
                        <span className={`badge-status badge-status-${c.status?.toLowerCase().replace('_', '-')}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => navigate(`/enforcement/cases/${c.id}`)}
                          className="btn-gov-secondary"
                          style={{ padding: "4px 10px", fontSize: "11.5px" }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Risk Responsible Parties */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <Building2 size={16} color="#0c3b6b" /> Responsible Entities Directory
            </div>
            <Link to="/enforcement/responsible-parties" style={{ fontSize: "12px", color: "#0c3b6b", fontWeight: 700, textDecoration: "none" }}>
              Full Directory ({repeatOffenders.length}) →
            </Link>
          </div>

          <div className="gov-table-wrapper">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Entity Name</th>
                  <th>Type</th>
                  <th>Violations</th>
                  <th>Penalties Imposed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {repeatOffenders.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                      No registered entities found.
                    </td>
                  </tr>
                ) : (
                  repeatOffenders.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>
                        {p.name}
                        {p.brand_name && <div style={{ fontSize: "11px", color: "#64748b" }}>Brands: {p.brand_name}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                          {p.entity_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: p.total_violations > 1 ? "#dc2626" : "#166534" }}>
                          {p.total_violations}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹{Number(p.total_penalties || 0).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <button 
                          onClick={() => navigate(`/enforcement/responsible-parties/${p.id}`)}
                          className="btn-gov-secondary"
                          style={{ padding: "4px 10px", fontSize: "11.5px" }}
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Statutory Section Breakdown Cards */}
      <div className="gov-card">
        <div className="gov-card-header">
          <div className="gov-card-title">
            <ShieldAlert size={16} color="#0c3b6b" /> Statutory Legal Metrology Provisions Active
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, color: "#0c3b6b", fontSize: "13px" }}>Section 36(1) • Non-Standard Declarations</div>
            <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px" }}>
              Penalty: 1st Offence: ₹25,000 | 2nd Offence: ₹50,000 | Subsequent: ₹1,00,000 / Imprisonment.
            </div>
          </div>
          <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, color: "#0c3b6b", fontSize: "13px" }}>Section 36(2) • MRP Overcharge & Alteration</div>
            <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px" }}>
              Penalty: 1st Offence: ₹20,000 | 2nd Offence: ₹50,000. Applies to retailers & distributors.
            </div>
          </div>
          <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, color: "#0c3b6b", fontSize: "13px" }}>Section 39 • Rule 27 Registration Omission</div>
            <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px" }}>
              Penalty: ₹25,000–₹50,000 for non-registration of Manufacturer / Packer / Importer.
            </div>
          </div>
          <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, color: "#0c3b6b", fontSize: "13px" }}>Section 49 & Rule 6(10) • E-Commerce & Corporate</div>
            <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px" }}>
              Penalty: Up to ₹5,00,000. Liability of Directors and Digital Marketplace disclosure obligations.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EnforcementDashboard;
