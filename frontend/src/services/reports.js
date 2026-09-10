import API, { API_BASE_URL } from "./api";

/**
 * Downloads a PDF file with JWT auth header, triggers browser save dialog, and falls back to tokenized window.open.
 */
export const downloadPDFWithAuth = async (pathOrUrl, defaultFilename = "Statutory_Inspection_Memo.pdf") => {
  try {
    let cleanPath = pathOrUrl;
    if (cleanPath.startsWith(API_BASE_URL)) {
      cleanPath = cleanPath.replace(API_BASE_URL, "");
    }
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }

    const res = await API.get(cleanPath, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.warn("Direct blob download error, falling back with query token:", err);
    const token = localStorage.getItem("token");
    let fullUrl = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
    const separator = fullUrl.includes("?") ? "&" : "?";
    if (token) {
      fullUrl = `${fullUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    window.open(fullUrl, "_blank");
  }
};

export const reportService = {
  getReports: async (params) => {
    const response = await API.get("/reports", { params });
    return response.data;
  },

  downloadReportPDF: (reportId) => {
    downloadPDFWithAuth(`/reports/${reportId}/download`, `Statutory_Memo_${reportId}.pdf`);
  },

  downloadInspectionPDF: (inspectionId) => {
    downloadPDFWithAuth(`/reports/inspection/${inspectionId}/download`, `Official_Inspection_Memo_${inspectionId}.pdf`);
  },

  downloadScanPDF: (scanId) => {
    downloadPDFWithAuth(`/reports/scan/${scanId}/download`, `Scan_Inspection_Memo_${scanId}.pdf`);
  },

  downloadProductPDF: (productId) => {
    downloadPDFWithAuth(`/reports/product/${productId}/download`, `Commodity_Compliance_Memo_${productId}.pdf`);
  }
};

export default reportService;
