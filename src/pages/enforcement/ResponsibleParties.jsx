import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Building2, 
  Search, 
  Filter, 
  PlusCircle, 
  ShieldAlert, 
  Phone, 
  Mail, 
  MapPin,
  RefreshCw
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

const ResponsibleParties = () => {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = `${API_BASE}/responsible-parties?limit=50`;
      if (activeTab !== "ALL") url += `&entity_type=${activeTab}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const [pRes, sRes] = await Promise.all([
        axios.get(url, { headers }),
        axios.get(`${API_BASE}/responsible-parties/stats`, { headers }).catch(() => null)
      ]);

      if (pRes.data) setParties(pRes.data.items || []);
      if (sRes && sRes.data) setStats(sRes.data);
    } catch (err) {
      console.error("Parties fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [activeTab]);

  const tabs = [
    { key: "ALL", label: "All Entities" },
    { key: "MANUFACTURER", label: "Manufacturers" },
    { key: "PACKER", label: "Packers" },
    { key: "IMPORTER", label: "Importers" },
    { key: "BRAND_OWNER", label: "Brand Owners" },
    { key: "SELLER_DEALER", label: "Sellers & Dealers" },
    { key: "ECOMMERCE_ENTITY", label: "E-Commerce" },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", background: "#ffffff", padding: "16px 20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <div>
          <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
            Responsible Parties & Commercial Entities Directory
          </h1>
          <p style={{ margin: "3px 0 0 0", fontSize: "12.5px", color: "#475569" }}>
            Track compliance history, repeat violations, and compounding liability under Legal Metrology Act, 2009.
          </p>
        </div>
        <button onClick={fetchParties} className="btn-gov-secondary">
          <RefreshCw size={14} /> Refresh Directory
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", borderBottom: "2px solid #e2e8f0", paddingBottom: "2px" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              background: activeTab === t.key ? "#0c3b6b" : "#ffffff",
              color: activeTab === t.key ? "#ffffff" : "#475569",
              border: "1px solid #cbd5e1",
              borderBottom: "none",
              padding: "8px 16px",
              borderRadius: "6px 6px 0 0",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {t.label} {stats?.by_type && stats.by_type[t.key] ? `(${stats.by_type[t.key]})` : ""}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="gov-card" style={{ padding: "10px 14px" }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchParties(); }} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0 10px" }}>
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search Entity Name, Brand, Registration #, State..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", background: "transparent", padding: "8px", width: "100%", outline: "none", fontSize: "13px" }}
            />
          </div>
          <button type="submit" className="btn-gov-primary">Search</button>
        </form>
      </div>

      {/* Grid of Entity Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
        {loading ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading commercial entities directory...
          </div>
        ) : parties.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#64748b" }}>
            No entities found in this category.
          </div>
        ) : (
          parties.map((p) => (
            <div key={p.id} className="gov-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "#0c3b6b", margin: 0 }}>
                      {p.name}
                    </h3>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                      Reg: {p.registration_number || "Pending Registration (Rule 27)"}
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {p.entity_type}
                  </span>
                </div>

                {p.brand_name && (
                  <div style={{ fontSize: "12px", color: "#334155", margin: "8px 0", background: "#f8fafc", padding: "4px 8px", borderRadius: "4px" }}>
                    <strong>Brands:</strong> {p.brand_name}
                  </div>
                )}

                <div style={{ fontSize: "12px", color: "#475569", margin: "8px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {p.address && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={13} color="#64748b" /> {p.address}, {p.city || ""} {p.state || ""}
                    </div>
                  )}
                  {p.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Mail size={13} color="#64748b" /> {p.email}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Violations / Cases</div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: p.total_violations > 1 ? "#dc2626" : "#0f172a" }}>
                    {p.total_violations} Violations • {p.open_cases || 0} Open
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/enforcement/responsible-parties/${p.id}`)}
                  className="btn-gov-secondary"
                  style={{ padding: "5px 12px", fontSize: "12px" }}
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ResponsibleParties;
