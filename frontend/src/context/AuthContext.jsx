import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lifeflow_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("lifeflow_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("lifeflow_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("lifeflow_token");
        localStorage.removeItem("lifeflow_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (token, user) => {
    localStorage.setItem("lifeflow_token", token);
    localStorage.setItem("lifeflow_user", JSON.stringify(user));
    setUser(user);
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    persist(data.token, data.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.token, data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore network errors on logout */
    }
    localStorage.removeItem("lifeflow_token");
    localStorage.removeItem("lifeflow_user");
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("lifeflow_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
