import React, { useState } from "react";

const Users = () => {
  const [userList, setUserList] = useState([
    { id: "USR-001", name: "Dr. Rajesh Sharma", role: "ADMIN", email: "rajesh.sharma@gov.in", status: "Active" },
    { id: "USR-002", name: "Inspector Anil Kumar", role: "CHECKER", email: "anil.kumar@metrology.gov.in", status: "Active" },
    { id: "USR-003", name: "Gupta Kirana Store", role: "SHOPKEEPER", email: "guptakirana@gmail.com", status: "Active" },
    { id: "USR-004", name: "Sharma Retail Hub", role: "SHOPKEEPER", email: "sharmaretail@yahoo.com", status: "Pending Review" },
    { id: "USR-005", name: "Inspector Priya Singh", role: "CHECKER", email: "priya.singh@metrology.gov.in", status: "Inactive" },
  ]);

  const toggleStatus = (id) => {
    setUserList(userList.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === "Active" ? "Inactive" : "Active" };
      }
      return u;
    }));
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0c3b6b 0%, #0284c7 100%)", borderRadius: "14px", padding: "22px 28px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 6px 20px rgba(12, 59, 107, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0" }}>
            👥 User Access & Role Management
          </h1>
          <p style={{ fontSize: "12.5px", opacity: 0.9, margin: 0 }}>
            Control portal access levels for Admins, Field Inspectors (Checkers), and Registered Retailers.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Registered System Users ({userList.length})
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            Role-Based Access Control (RBAC) Active
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "11.5px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>User ID & Name</th>
                <th style={{ padding: "14px 20px" }}>Assigned Role</th>
                <th style={{ padding: "14px 20px" }}>Contact Email</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                    {item.name}
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>ID: {item.id}</div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: item.role === "ADMIN" ? "#eff6ff" : item.role === "CHECKER" ? "#fdf4ff" : "#f0fdf4",
                      color: item.role === "ADMIN" ? "#1d4ed8" : item.role === "CHECKER" ? "#86198f" : "#166534"
                    }}>
                      {item.role}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{item.email}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: item.status === "Active" ? "#f0fdf4" : item.status === "Pending Review" ? "#fef3c7" : "#ffeeef",
                      color: item.status === "Active" ? "#166534" : item.status === "Pending Review" ? "#92400e" : "#b91c1c"
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button 
                      onClick={() => toggleStatus(item.id)}
                      style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: item.status === "Active" ? "#b91c1c" : "#166534", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                    >
                      {item.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default Users;