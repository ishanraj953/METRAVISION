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
};