import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FileText, 
  Search, 
  Filter, 
  PlusCircle, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Building2,
  UserCheck,
  User,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import { API_BASE_URL as API_BASE } from "../../services/api";

const EnforcementCases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [officerFilter, setOfficerFilter] = useState(user?.role === "CHECKER" ? "my" : "all"); // 'my' or 'all'
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const isInspector = user?.role === "CHECKER";

  const fetchCases = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = `${API_BASE}/cases?page=${page}&limit=20`;
      
      // Inspector or explicitly selected "my" cases
      if (isInspector || officerFilter === "my") {
        url += `&my_cases_only=true`;
        if (user?.id) {
          url += `&officer_id=${user.id}`;
        }
      }

      if (statusFilter) url += `&status=${statusFilter}`;
      if (severityFilter) url += `&severity=${severityFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await axios.get(url, { headers });
      if (res.data) {
        setCases(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Fetch cases error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter, severityFilter, officerFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCases();
  };

  const inspectorName = user?.full_name || user?.name || "Inspector Vikram Singh";
  const inspectorBadge = `CHK-${user?.id || '109'}`;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", background: "#ffffff", padding: "18px 20px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
              {isInspector ? `My Statutory Enforcement Cases (${total})` : `Statutory Enforcement Cases (${total})`}
            </h1>
            
            {/* Inspector Scoping Badge */}
            {(isInspector || officerFilter === "my") && (
              <span style={{ 
                background: "#ecfdf5", 
                color: "#166534", 
                border: "1px solid #86efac", 
                padding: "3px 10px", 
                borderRadius: "14px", 
                fontSize: "11.5px", 
                fontWeight: 700, 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "5px" 
              }}>
                <UserCheck size={13} color="#166534" />
                Handling Officer: {inspectorName} ({inspectorBadge})
              </span>
            )}
          </div>

          <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#475569" }}>
            {isInspector 
              ? `Displaying statutory cases investigated, verified, and administered by your officer profile.` 
              : `Track full lifecycle from Non-Compliance Detection to Notice Issuance, Compounding, and Settlement.`}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={fetchCases} className="btn-gov-secondary">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => navigate("/enforcement/inspect")} className="btn-gov-primary" style={{ background: "#166534" }}>
            <PlusCircle size={15} /> New Statutory Inspection
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="gov-card" style={{ padding: "14px 18px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          
          {/* Search Box */}
          <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0 10px" }}>
            <Search size={16} color="#64748b" />
            <input 
              type="text"
              placeholder="Search Case #, Product, Entity, or Officer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", background: "transparent", padding: "8px", width: "100%", outline: "none", fontSize: "13px" }}
            />
          </div>

          {/* Admin Officer Filter Toggle */}
          {!isInspector && (
            <select 
              value={officerFilter} 
              onChange={(e) => { setOfficerFilter(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", background: "#ffffff", fontWeight: 600 }}
            >
              <option value="all">All Officers (Department Wide)</option>
              <option value="my">Handled by Me ({inspectorName})</option>
            </select>
          )}

          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", background: "#ffffff" }}
          >
            <option value="">All Statuses</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="NOTICE_ISSUED">Notice Issued</option>
            <option value="PENALTY_IMPOSED">Penalty Imposed</option>
            <option value="COMPOUNDED">Compounded / Paid</option>
            <option value="CLOSED">Closed</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          {/* Severity Filter */}
          <select 
            value={severityFilter} 
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", background: "#ffffff" }}
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button type="submit" className="btn-gov-primary">
            Apply Filters
          </button>
        </form>
      </div>

      {/* Cases Table */}
      <div className="gov-table-wrapper">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Case Reference</th>
              <th>Product / Commodity</th>
              <th>Responsible Party</th>
              <th>Handling Inspector</th>
              <th>Statutory Section</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Notice / Penalty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                  Loading enforcement cases...
                </td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <UserCheck size={32} color="#94a3b8" />
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>
                      No enforcement cases found handled by {inspectorName}.
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Launch a new statutory package inspection to register and process compliance cases under your officer profile.
                    </div>
                    <button 
                      onClick={() => navigate("/enforcement/inspect")} 
                      className="btn-gov-primary" 
                      style={{ background: "#166534", marginTop: "8px" }}
                    >
                      <PlusCircle size={14} /> Launch Statutory Inspection
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              cases.map((c) => {
                const isHandledByCurrent = Boolean(
                  (user?.id && c.officer_id === user.id) ||
                  (user?.full_name && c.officer_name && c.officer_name.toLowerCase().includes(user.full_name.toLowerCase()))
                );

                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 800, color: "#0c3b6b" }}>
                      {c.case_number}
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>
                        {new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.product_name}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{c.product_brand || "N/A"} • {c.product_category || "Packaged Goods"}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Building2 size={13} color="#64748b" /> {c.responsible_party_name || "Unassigned"}
                      </div>
                      <span style={{ fontSize: "10.5px", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", color: "#475569" }}>
                        {c.entity_type}
                      </span>
                    </td>
                    
                    {/* Handling Inspector Column */}
                    <td>
                      <div style={{ fontWeight: 700, color: "#0c3b6b", display: "flex", alignItems: "center", gap: "5px" }}>
                        <UserCheck size={13} color="#166534" />
                        <span>{c.officer_name || inspectorName}</span>
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <span>Badge: {c.officer_badge || inspectorBadge}</span>
                        {isHandledByCurrent && (
                          <span style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", padding: "0 5px", borderRadius: "4px", fontSize: "9.5px", fontWeight: 800 }}>
                            ASSIGNED TO YOU
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                      {c.applicable_act_section || "Section 36(1)"}
                    </td>
                    <td>
                      <span className={`badge-severity-${c.severity?.toLowerCase()}`} style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700 }}>
                        {c.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status badge-status-${c.status?.toLowerCase().replace('_', '-')}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.imposed_penalty ? (
                        <span style={{ fontWeight: 800, color: "#166534" }}>
                          ₹{Number(c.imposed_penalty).toLocaleString("en-IN")}
                        </span>
                      ) : c.notice_number ? (
                        <span style={{ fontSize: "11px", color: "#991b1b", fontWeight: 600 }}>
                          {c.notice_number}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          Est: ₹{Number(c.potential_penalty_max || 25000).toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => navigate(`/enforcement/cases/${c.id}`)}
                        className="btn-gov-primary"
                        style={{ padding: "4px 10px", fontSize: "11.5px" }}
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnforcementCases;
