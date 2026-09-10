import React from "react";
import { Outlet } from "react-router-dom";
import GovHeader from "../components/common/GovHeader";

const AdminLayout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f4f6f9" }}>
      <GovHeader />
      <main style={{ flex: 1, padding: "16px 24px" }}>
        <Outlet />
      </main>
      <footer style={{ background: "#071f38", color: "#94a3b8", padding: "12px 24px", fontSize: "11px", textAlign: "center", borderTop: "1px solid #1e293b" }}>
        Central Directorate of Legal Metrology • National Enforcement Command Portal • Government of India
      </footer>
    </div>
  );
};

export default AdminLayout;