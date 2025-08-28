import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        
        // Optional: check if authToken is expired (JWT exp is in seconds)
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          // authToken expired, clear it
          localStorage.removeItem("authToken");
          setUser(null);
          return;
        }

        setUser(decoded);
      } catch (e) {
        console.error("Invalid authToken", e);
        localStorage.removeItem("authToken");
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
