import API from "./api";

export const productService = {
  getProducts: async () => {
    const response = await API.get("/products/");
    return response.data;
  },

  getProductById: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },

  registerProduct: async (productData) => {
    const response = await API.post("/products/", productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  },

  getProductVersions: async (id) => {
    const response = await API.get(`/products/${id}/versions`);
    return response.data;
  },

  getProductScans: async (id) => {
    const response = await API.get(`/products/${id}/scans`);
    return response.data;
  },

  getDigitalTwin: async (id) => {
    const response = await API.get(`/products/${id}/digital-twin`);
    return response.data;
  },

  getProductDrift: async (id) => {
    const response = await API.get(`/products/${id}/drift`);
    return response.data;
  },

  compareOnlineListing: async (id) => {
    const response = await API.post(`/products/${id}/compare-online`);
    return response.data;
  },

  getRepeatOffenders: async () => {
    const response = await API.get("/manufacturers/repeat-offenders");
    return response.data;
  },

  getInspectionPriority: async () => {
    const response = await API.get("/inspections/priority");
    return response.data;
  }
};

export default productService;