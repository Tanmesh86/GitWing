import React, { useEffect } from "react";

const Login = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://auth-service-j350.onrender.com/auth/github";
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center h-screen bg-gray-950 font-sans">
      {/* Techy Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1740&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-[90%] max-w-md text-center bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/20 transform transition-all duration-500 hover:scale-105 hover:shadow-[0_8px_50px_rgba(0,0,0,0.6)]">
        <h1 className="text-4xl font-semibold text-white mb-4 tracking-wide">
          Welcome to <span className="text-indigo-400">Your Startup</span>
        </h1>
        <p className="text-gray-300 mb-8 text-lg animate-fadeIn">
          Redirecting you to GitHub login...
        </p>

        {/* Sleek Loading Spinner */}
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
        </div>

        <p className="mt-8 text-sm text-gray-400 tracking-wide">
          Please wait while we connect you securely 🔒
        </p>
      </div>
    </div>
  );
};

export default Login;
