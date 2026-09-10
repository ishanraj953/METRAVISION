import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif", color: "#0c3b6b" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#0c3b6b", marginBottom: "8px" }}>METRAVISION</div>
          <div style={{ fontSize: "14px", fontWeight: 700 }}>Verifying Authorized Government Session...</div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, navigate to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is not permitted, navigate to their allowed portal or home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "CHECKER") return <Navigate to="/checker/scan" replace />;
    if (user.role === "SHOPKEEPER") return <Navigate to="/shopkeeper/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;