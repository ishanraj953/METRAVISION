import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gov_token");
    const role = localStorage.getItem("gov_role");
    const name = localStorage.getItem("gov_user");

    if (token && role) {
      setUser({ token, role, name });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("gov_token", userData.token);
    localStorage.setItem("gov_role", userData.role);
    localStorage.setItem("gov_user", userData.name);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);