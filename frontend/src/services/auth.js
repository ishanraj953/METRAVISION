import API from "./api";

export const authService = {
  login: async (credentials) => {
    const response = await API.post("/auth/login", credentials);
    const data = response.data;
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem("token", token);
      const user = {
        id: data.user_id,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
        name: data.full_name
      };
      localStorage.setItem("user", JSON.stringify(user));
    }
    return data;
  },

  register: async (userData) => {
    const response = await API.post("/auth/register", userData);
    const data = response.data;
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem("token", token);
      const user = {
        id: data.user_id,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
        name: data.full_name
      };
      localStorage.setItem("user", JSON.stringify(user));
    }
    return data;
  },

  getMe: async () => {
    const response = await API.get("/auth/me");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await API.put("/auth/profile", profileData);
    const data = response.data;
    const storedUser = authService.getCurrentUser() || {};
    const updated = {
      ...storedUser,
      full_name: data.full_name,
      name: data.full_name,
      email: data.email
    };
    localStorage.setItem("user", JSON.stringify(updated));
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("gov_token");
    localStorage.removeItem("gov_role");
    localStorage.removeItem("gov_user");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;