import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OAuthSuccess from "./pages/OAuthSuccess";
import PRList from "./pages/PRlist";
import PRDetails from "./pages/PRDetails";
import "./index.css";
import Help from "./pages/Help";
import ContactUs from "./pages/Contact";
function App() {
  return (
    
    <>
    
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/repos/:owner/:repo/prs" element={<PRList />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/help" element={<Help />} />
        
        {/* Match the frontend route to API expectations */}
        <Route
          path="/repos/:owner/:repo/pulls/:number/details"
          element={<PRDetails />}
        />
      </Routes>
    </>
  );
}

export default App;
