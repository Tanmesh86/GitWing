import React, { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide navbar if not logged in
  if (!user) return null;

  return (
    <nav className="w-full bg-black shadow-lg" style={{ background: "#00002e" }}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Left section: Brand + Help/Contact */}
        <div className="flex items-center space-x-6">
         <Link
  to="/"
  className="flex items-center text-indigo-400 hover:text-indigo-300 transition"
>
  <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500 tracking-tight animate-title text-2xl md:text-2xl m-0">
    GitWing
  </h1>
</Link>

         
        </div>

        {/* Right section: Nav links + Avatar */}
        <div className="flex items-center space-x-4">
          <Link
  to="/"
  className="text-white hover:text-indigo-400 transition font-medium text-sm"
>
  Home
</Link>
<Link
  to="/dashboard"
  className="text-white hover:text-indigo-400 transition font-medium text-sm"
>
  Dashboard
</Link>
<Link
  to="/help"
  className="text-white hover:text-indigo-400 transition font-medium text-sm"
>
  Help
</Link>
<Link
  to="/contact"
  className="text-white hover:text-indigo-400 transition font-medium text-sm"
>
  Contact
</Link>

          {/* Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <img
              src={user.avatarUrl} // assuming user object has avatar_url
              alt="avatar"
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-white/20"
            />
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-black rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
