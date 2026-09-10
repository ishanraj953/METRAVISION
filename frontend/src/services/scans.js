import API from "./api";

export const scanService = {
  // Direct Instant Scan without needing pre-existing product ID
  scanInstantImage: async (imageFile, productName = null, category = null) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    if (productName) formData.append("product_name", productName);
    if (category) formData.append("category", category);

    const response = await API.post("/scans/instant", formData, {
      timeout: 180000,
    });
    return response.data;
  },

  // Multi-Facet AI Scan (at least 4 photos required under Legal Metrology Protocol)
  scanMultiFacetImages: async (filesArray, facetLabelsArray = [], productName = null, category = null) => {
    const formData = new FormData();
    filesArray.forEach((file) => {
      formData.append("files", file);
    });
    facetLabelsArray.forEach((label) => {
      formData.append("facet_labels", label);
    });
    if (productName) formData.append("product_name", productName);
    if (category) formData.append("category", category);

    const response = await API.post("/scans/multi", formData, {
      timeout: 180000,
    });
    return response.data;
  },

  get4FacetPreset: async () => {
    const response = await API.get("/scans/presets-4facet");
    return response.data;
  },

  load4FacetPresetFiles: async () => {
    const presetInfo = await scanService.get4FacetPreset();
    const filesWithLabels = [];
    for (const facet of presetInfo.facets) {
      const imgRes = await API.get(facet.url, { responseType: "blob" });
      const file = new File([imgRes.data], facet.file, { type: imgRes.data.type || "image/jpeg" });
      filesWithLabels.push({
        file,
        label: facet.label,
        index: facet.index,
        previewUrl: URL.createObjectURL(file)
      });
    }
    return {
      presetInfo,
      facets: filesWithLabels
    };
  },

  // Scan specifically linked to a pre-existing product ID
  scanProductImage: async (productId, imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await API.post(`/products/${productId}/scan`, formData, {
      timeout: 180000,
    });
    return response.data;
  },

  getScanPresets: async () => {
    const response = await API.get("/scans/presets");
    return response.data;
  },

  // 1-Click Scan of a sample preset image
  scanPresetByName: async (presetName, productName = null) => {
    // Fetch image blob from presets endpoint
    const imgRes = await API.get(`/scans/presets/${presetName}`, {
      responseType: "blob"
    });
    const file = new File([imgRes.data], presetName, { type: imgRes.data.type || "image/jpeg" });
    return scanService.scanInstantImage(file, productName || presetName);
  },

  getProductScans: async (productId) => {
    const response = await API.get(`/products/${productId}/scans`);
    return response.data;
  },

  getInspectionHistory: async () => {
    const response = await API.get("/inspections");
    return response.data;
  },

  getPriorityInspections: async () => {
    const response = await API.get("/inspections/priority");
    return response.data;
  }
};

export default scanService;