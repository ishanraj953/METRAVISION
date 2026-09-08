import API from "./api";

export const productService = {
  getProducts: async () => {
    const response = await API.get("/products");
    return response.data;
  },

  registerProduct: async (productData) => {
    const response = await API.post("/products", productData);
    return response.data;
  },

  scanPackageByBarcode: async (barcode) => {
    const response = await API.get(`/scans/verify/${barcode}`);
    return response.data;
  },
};