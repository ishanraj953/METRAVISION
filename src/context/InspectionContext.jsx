import React, { createContext, useContext, useState } from "react";

const InspectionContext = createContext();

export const InspectionProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([
    {
      id: "CMP-LM-2026-081",
      timestamp: "08 Sep 2026, 11:20 AM",
      inspectorName: "R. Sharma (CHK-109)",
      shopName: "Gupta Kirana & Daily Needs",
      location: "Shop #14, Sector 9, Guntur, AP",
      productName: "Sana Coconut Chips (140g)",
      batchNo: "SN-9982-A",
      image: null,
      status: "PENDING_REVIEW",
      violations: [
        { rule: "Rule 6(1)(e)", title: "MRP Declaration Font Size Deficient", severity: "HIGH" },
        { rule: "Rule 18", title: "Customer Care Email / Contact Missing", severity: "MEDIUM" }
      ],
      penaltyAmount: 25000,
      notes: "Field inspection during routine market surveillance. Dual label detected over MRP."
    }
  ]);

  const addComplaint = (newRecord) => {
    setComplaints((prev) => [newRecord, ...prev]);
  };

  const updateComplaintStatus = (id, newStatus, adminNote = "") => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, adminReviewNote: adminNote } : c))
    );
  };

  return (
    <InspectionContext.Provider value={{ complaints, addComplaint, updateComplaintStatus }}>
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => useContext(InspectionContext);