import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw
} from "lucide-react";

import { API_BASE_URL as API_BASE } from "../../services/api";

const OfficerNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/notifications`, { headers });
      if (res.data) {
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${API_BASE}/notifications/read-all`, {}, { headers });
      fetchNotifs();
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        const token = localStorage.getItem("metrax_token") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.put(`${API_BASE}/notifications/${notif.id}/read`, {}, { headers });
      } catch (e) {}
    }
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", background: "#ffffff", padding: "16px 20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <div>
          <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#0c3b6b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={20} color="#0c3b6b" /> Officer Alerts & Statutory Deadlines ({unreadCount} Unread)
          </h1>
          <p style={{ margin: "3px 0 0 0", fontSize: "12.5px", color: "#475569" }}>
            Real-time notifications for Show Cause Notice expirations, new non-compliance detections, and repeat offenders.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={fetchNotifs} className="btn-gov-secondary">
            <RefreshCw size={14} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-gov-secondary">
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="gov-card" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            No operational alerts at this time. All statutory cases are in order.
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className="gov-card"
              style={{
                cursor: "pointer",
                borderLeft: n.severity === "CRITICAL" ? "4px solid #dc2626" : n.severity === "HIGH" ? "4px solid #ea580c" : "4px solid #0284c7",
                background: n.is_read ? "#ffffff" : "#f0f9ff",
                transition: "all 0.15s ease",
                padding: "14px 16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: n.is_read ? "#1e293b" : "#0c3b6b", margin: 0 }}>
                      {n.title}
                    </h3>
                    {!n.is_read && (
                      <span style={{ background: "#0c3b6b", color: "#ffffff", fontSize: "10px", fontWeight: 800, padding: "1px 6px", borderRadius: "4px" }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "6px 0 0 0", fontSize: "12.5px", color: "#475569" }}>
                    {n.message}
                  </p>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
                    {new Date(n.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} IST
                  </div>
                </div>

                {n.action_url && (
                  <span style={{ color: "#0c3b6b", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                    View Case <ArrowRight size={13} />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default OfficerNotifications;
