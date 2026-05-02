import { createContext, useContext, useEffect, useState } from "react";
import adminApi from "../services/adminApi";

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const storedUser = localStorage.getItem("adminUser");
        if (token && storedUser) {
          setAdminUser(JSON.parse(storedUser));
        }
      } catch (error) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await adminApi.post("/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));
      setAdminUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, login, logout, loading }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};
