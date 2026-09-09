import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { InspectionProvider } from "./context/InspectionContext";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import ShopkeeperLayout from "./layouts/ShopkeeperLayout.jsx";
import CheckerLayout from "./layouts/CheckerLayout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";

// Admin Pages (All Modules)
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminViolations from "./pages/admin/Violations.jsx";
import Users from "./pages/admin/Users.jsx";
import Products from "./pages/admin/Products.jsx";
import Compliance from "./pages/admin/Compliance.jsx";
import Manufacturers from "./pages/admin/Manufacturers.jsx";
import Rules from "./pages/admin/Rules.jsx";
import Inspections from "./pages/admin/Inspections.jsx";
import Risk from "./pages/admin/Risk.jsx";
import Reports from "./pages/admin/Reports.jsx";
import Audit from "./pages/admin/Audit.jsx";
import Settings from "./pages/admin/Settings.jsx";

// Checker / Inspector Pages
import CheckerDashboard from "./pages/checker/Dashboard.jsx";
import CheckerScan from "./pages/checker/ScanProduct.jsx";
import CheckerEvidence from "./pages/checker/Evidence.jsx";
import CheckerReports from "./pages/checker/Reports.jsx";
import CheckerProfile from "./pages/checker/Profile.jsx";
import CheckerProducts from "./pages/checker/Products.jsx";
import CheckerResults from "./pages/checker/Results.jsx";
import CheckerRiskIntelligence from "./pages/checker/RiskIntelligence.jsx";

// Shopkeeper Pages
import ShopkeeperDashboard from "./pages/shopkeeper/Dashboard.jsx";
import AddProduct from "./pages/shopkeeper/AddProduct.jsx";
import ShopkeeperProducts from "./pages/shopkeeper/Products.jsx";
import ShopkeeperScan from "./pages/shopkeeper/ScanProduct.jsx";
import ShopkeeperCompliance from "./pages/shopkeeper/Compliance.jsx";
import ShopkeeperViolation from "./pages/shopkeeper/Violation.jsx";
import ShopkeeperReports from "./pages/shopkeeper/Reports.jsx";

function App() {
  return (
    <AuthProvider>
      <InspectionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Protected Routes (Fixed Mappings) */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="violations" element={<AdminViolations />} />
                <Route path="users" element={<Users />} />
                <Route path="products" element={<Products />} />
                <Route path="compliance" element={<Compliance />} />
                <Route path="manufacturers" element={<Manufacturers />} />
                <Route path="rules" element={<Rules />} />
                <Route path="inspections" element={<Inspections />} />
                <Route path="risk" element={<Risk />} />
                <Route path="reports" element={<Reports />} />
                <Route path="audit" element={<Audit />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Checker Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["CHECKER"]} />}>
              <Route path="/checker" element={<CheckerLayout />}>
                <Route path="dashboard" element={<CheckerDashboard />} />
                <Route path="scan" element={<CheckerScan />} />
                <Route path="evidence" element={<CheckerEvidence />} />
                <Route path="reports" element={<CheckerReports />} />
                <Route path="profile" element={<CheckerProfile />} />
                <Route path="products" element={<CheckerProducts />} />
                <Route path="results" element={<CheckerResults />} />
                <Route path="risk" element={<CheckerRiskIntelligence />} />
              </Route>
            </Route>

            {/* Shopkeeper Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["SHOPKEEPER"]} />}>
              <Route path="/shopkeeper" element={<ShopkeeperLayout />}>
                <Route path="dashboard" element={<ShopkeeperDashboard />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="products" element={<ShopkeeperProducts />} />
                <Route path="scan" element={<ShopkeeperScan />} />
                <Route path="compliance" element={<ShopkeeperCompliance />} />
                <Route path="violations" element={<ShopkeeperViolation />} />
                <Route path="reports" element={<ShopkeeperReports />} />
                <Route path="history" element={<ShopkeeperReports />} />
                <Route path="online-listing" element={<ShopkeeperProducts />} />
                <Route path="help" element={<ShopkeeperCompliance />} />
                <Route path="profile" element={<ShopkeeperDashboard />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </InspectionProvider>
    </AuthProvider>
  );
}

export default App;