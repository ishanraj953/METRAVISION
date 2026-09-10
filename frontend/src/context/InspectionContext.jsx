import React, { createContext, useContext, useState, useEffect } from "react";
import scanService from "../services/scans";

const InspectionContext = createContext();

export const InspectionProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await scanService.getInspectionHistory();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((insp) => ({
          id: insp.inspection_code || `INSP-${insp.id}`,
          dbId: insp.id,
          timestamp: insp.scheduled_at
            ? new Date(insp.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
            : "Live Case",
          inspectorName: insp.checker_id ? `Inspector (ID: ${insp.checker_id})` : "Central Legal Metrology Wing",
          shopName: insp.product?.manufacturer_name || "Registered Enterprise",
          location: "State Enforcement Jurisdiction",
          productName: insp.product?.name || `Commodity #${insp.product_id}`,
          batchNo: `BATCH-${insp.product_id}`,
          image: null,
          status: insp.status || "PENDING_REVIEW",
          violations: insp.status === "COMPLIANT" ? [] : [
            { rule: "Rule 6(1), PCR 2011", title: insp.remarks || "Statutory Declaration Under Review", severity: "HIGH" }
          ],
          penaltyAmount: insp.status === "COMPLIANT" ? 0 : 25000,
          notes: insp.remarks || "Field inspection record generated under Legal Metrology Act, 2009."
        }));
        setComplaints(mapped);
      }
    } catch (err) {
      console.warn("Could not load initial inspections in InspectionContext:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const addComplaint = (newRecord) => {
    setComplaints((prev) => [newRecord, ...prev]);
  };

  const updateComplaintStatus = (id, newStatus, adminNote = "") => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, adminReviewNote: adminNote } : c))
    );
  };

  return (
    <InspectionContext.Provider value={{ complaints, addComplaint, updateComplaintStatus, refreshComplaints: fetchInspections, loading }}>
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => useContext(InspectionContext);