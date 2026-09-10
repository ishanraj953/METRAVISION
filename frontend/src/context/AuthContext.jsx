import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Synchronous initialization prevents race condition on page refresh or redirect
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("gov_token");
      let role = localStorage.getItem("gov_role");
      let name = localStorage.getItem("gov_user");

      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        if (!role) role = parsed.role;
        if (!name) name = parsed.full_name || parsed.name;
        if (token && role) {
          return { ...parsed, token, role, name };
        }
      }

      if (token && role) {
        return { token, role, name };
      }
    } catch (e) {
      console.error("Error reading stored user session:", e);
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Validate session against database on initial mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("gov_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const freshUser = await authService.getMe();
        if (freshUser && freshUser.id) {
          const updated = {
            id: freshUser.id,
            email: freshUser.email,
            role: freshUser.role,
            full_name: freshUser.full_name,
            name: freshUser.full_name,
            token: token
          };
          localStorage.setItem("user", JSON.stringify(updated));
          localStorage.setItem("gov_role", freshUser.role);
          localStorage.setItem("gov_user", freshUser.full_name);
          setUser(updated);
        }
      } catch (err) {
        console.warn("Session verification failed, clearing invalid token:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (userData) => {
    const token = userData.token || userData.access_token;
    const role = userData.role;
    const name = userData.name || userData.full_name || "Official User";
    localStorage.setItem("token", token);
    localStorage.setItem("gov_token", token);
    localStorage.setItem("gov_role", role);
    localStorage.setItem("gov_user", name);
    localStorage.setItem("user", JSON.stringify({ ...userData, token, role, name }));
    setUser({ ...userData, token, role, name });
  };

  const register = async (registerData) => {
    const authData = await authService.register(registerData);
    login({
      token: authData.access_token,
      role: authData.role,
      name: authData.full_name,
      email: authData.email,
      id: authData.user_id
    });
    return authData;
  };

  const updateProfile = async (profileData) => {
    const updated = await authService.updateProfile(profileData);
    setUser((prev) => ({
      ...prev,
      full_name: updated.full_name,
      name: updated.full_name,
      email: updated.email
    }));
    return updated;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);