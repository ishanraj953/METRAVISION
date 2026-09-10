import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { InspectionProvider } from "./context/InspectionContext";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import CheckerLayout from "./layouts/CheckerLayout.jsx";
import ShopkeeperLayout from "./layouts/ShopkeeperLayout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";

// Modern Legal Metrology Enforcement Pages
import EnforcementDashboard from "./pages/enforcement/Dashboard.jsx";
import NewInspection from "./pages/enforcement/NewInspection.jsx";
import EnforcementCases from "./pages/enforcement/Cases.jsx";
import CaseDetail from "./pages/enforcement/CaseDetail.jsx";
import ResponsibleParties from "./pages/enforcement/ResponsibleParties.jsx";
import EntityProfile from "./pages/enforcement/EntityProfile.jsx";
import OfficerNotifications from "./pages/enforcement/Notifications.jsx";

// Existing Inspection & Evidence Views (Preserved)
import CheckerEvidence from "./pages/checker/Evidence.jsx";
import CheckerScan from "./pages/checker/ScanProduct.jsx";
import CheckerInspections from "./pages/checker/Inspections.jsx";
import CheckerReports from "./pages/checker/Reports.jsx";
import CheckerRiskIntelligence from "./pages/checker/RiskIntelligence.jsx";
import Rules from "./pages/admin/Rules.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminViolations from "./pages/admin/Violations.jsx";

function App() {
  return (
    <AuthProvider>
      <InspectionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Unified Enforcement Suite (Checker & Admin Protected) */}
            <Route element={<ProtectedRoute allowedRoles={["CHECKER", "ADMIN", "SHOPKEEPER"]} />}>
              <Route path="/enforcement" element={<CheckerLayout />}>
                <Route path="" element={<Navigate to="/enforcement/dashboard" replace />} />
                <Route path="dashboard" element={<EnforcementDashboard />} />
                <Route path="inspect" element={<NewInspection />} />
                <Route path="cases" element={<EnforcementCases />} />
                <Route path="cases/:id" element={<CaseDetail />} />
                <Route path="responsible-parties" element={<ResponsibleParties />} />
                <Route path="responsible-parties/:id" element={<EntityProfile />} />
                <Route path="notifications" element={<OfficerNotifications />} />
              </Route>

              {/* Preserved Checker Routes */}
              <Route path="/checker" element={<CheckerLayout />}>
                <Route path="" element={<Navigate to="/enforcement/dashboard" replace />} />
                <Route path="dashboard" element={<EnforcementDashboard />} />
                <Route path="scan" element={<NewInspection />} />
                <Route path="evidence" element={<CheckerEvidence />} />
                <Route path="violations" element={<CheckerEvidence />} />
                <Route path="inspections" element={<EnforcementCases />} />
                <Route path="reports" element={<CheckerReports />} />
                <Route path="risk" element={<CheckerRiskIntelligence />} />
              </Route>

              {/* Preserved Admin Routes */}
              <Route path="/admin" element={<CheckerLayout />}>
                <Route path="" element={<Navigate to="/enforcement/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="violations" element={<AdminViolations />} />
                <Route path="rules" element={<Rules />} />
                <Route path="manufacturers" element={<ResponsibleParties />} />
              </Route>

              {/* Safe Redirection for Legacy Merchant Routes */}
              <Route path="/shopkeeper" element={<CheckerLayout />}>
                <Route path="" element={<Navigate to="/enforcement/dashboard" replace />} />
                <Route path="dashboard" element={<EnforcementDashboard />} />
                <Route path="scan" element={<NewInspection />} />
                <Route path="add-product" element={<NewInspection />} />
                <Route path="products" element={<ResponsibleParties />} />
                <Route path="compliance" element={<EnforcementDashboard />} />
                <Route path="reports" element={<CheckerReports />} />
                <Route path="violation" element={<EnforcementCases />} />
              </Route>
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/enforcement/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </InspectionProvider>
    </AuthProvider>
  );
}

export default App;
