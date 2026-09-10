import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ menuItems, portalTitle }) => {
  return (
    <aside style={{
      width: "240px",
      background: "#fff",
      borderRight: "1px solid var(--gov-border)",
      display: "flex",
      flexDirection: "column",
      minHeight: "calc(100vh - 65px)"
    }}>
      <div style={{
        padding: "14px 16px",
        background: "var(--gov-navy)",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "12px",
        letterSpacing: "0.5px"
      }}>
        {portalTitle.toUpperCase()}
      </div>
      <nav style={{ flex: 1, padding: "6px 0" }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: "block",
              padding: "10px 16px",
              color: isActive ? "var(--gov-navy)" : "var(--gov-text)",
              textDecoration: "none",
              fontWeight: isActive ? "700" : "500",
              borderLeft: isActive ? "4px solid var(--gov-gold)" : "4px solid transparent",
              background: isActive ? "var(--gov-bg)" : "transparent",
              borderBottom: "1px solid #f1f3f5"
            })}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;