import API from "./api";

export const reportService = {
  getEnforcementReports: async (filters) => {
    const response = await API.get("/reports/enforcement", { params: filters });
    return response.data;
  },

  downloadReportPDF: async (reportId) => {
    const response = await API.get(`/reports/download/${reportId}`, {
      responseType: "blob", // To handle PDF file downloads
    });
    return response.data;
  },
};