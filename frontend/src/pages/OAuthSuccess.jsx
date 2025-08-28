import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import jwtDecode from "jwt-decode";

const OAuthSuccess = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Save token with consistent key name
      localStorage.setItem("authToken", token);
      try {
        const decoded = jwtDecode(token);
        setUser(decoded); // Update user context
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to decode token:", error);
        navigate("/");
      }
    } else {
      // No token found — redirect to login/home
      navigate("/");
    }
  }, [location.search, setUser, navigate]);

  return <div>Logging you in...</div>;
};

export default OAuthSuccess;
