import { createContext, useContext, useState } from "react";
import { apiFetch } from "../utils/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  //Load saved user from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser || storedUser === "undefined") {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user in localStorage", error);
      return null;
    }
  });

  //Load saved token
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  //Login
  const login = async (formData) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  //Register
  const register = async (formData) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  //Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
