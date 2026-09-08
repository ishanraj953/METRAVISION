import axios from "axios";

// Create an Axios instance pointing to the Legal Metrology backend gateway
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Replace with your backend port/URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically attach Bearer token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;