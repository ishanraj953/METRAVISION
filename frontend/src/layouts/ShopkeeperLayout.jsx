import React from "react";
import { Outlet } from "react-router-dom";
import GovHeader from "../components/common/GovHeader";

const ShopkeeperLayout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f4f6f9" }}>
      <GovHeader />
      <main style={{ flex: 1, padding: "16px 24px" }}>
        <Outlet />
      </main>
      <footer style={{ background: "#071f38", color: "#94a3b8", padding: "12px 24px", fontSize: "11px", textAlign: "center", borderTop: "1px solid #1e293b" }}>
        Merchant Self-Compliance Verification Service • Legal Metrology (Packaged Commodities) Rules, 2011 • Govt of India
      </footer>
    </div>
  );
};

export default ShopkeeperLayout;