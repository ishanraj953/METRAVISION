import API from "./api";

export const scanService = {
  verifyBarcode: async (barcode) => {
    const response = await API.get(`/scans/verify/${barcode}`);
    return response.data;
  },

  logScanHistory: async (scanData) => {
    const response = await API.post("/scans/log", scanData);
    return response.data;
  },

  // Upgraded local/client-side fallback validation and processing function
  processAndValidateScan: async (scannedData) => {
    const { productName, mrp, netQuantity, packerDetails, isBlur } = scannedData;

    // 1. Check for blur or unreadable text
    if (isBlur || !productName) {
      return {
        status: "Needs Review",
        message: "Image is too blurry or text is unreadable."
      };
    }

    // 2. Check for mandatory Legal Metrology fields
    if (!mrp || !netQuantity || !packerDetails) {
      return {
        status: "Non-Compliant",
        message: "Mandatory declarations (MRP, Net Quantity, or Packer details) are missing."
      };
    }

    // 3. If all checks pass, log it automatically or return compliant status
    try {
      await scanService.logScanHistory(scannedData);
    } catch (error) {
      console.error("Failed to log scan history:", error);
    }

    return {
      status: "Compliant",
      message: "All mandatory legal metrology declarations verified successfully."
    };
  }
};