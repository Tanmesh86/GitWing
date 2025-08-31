import React, { useEffect, useRef, useState } from "react";
import { Github, BarChart3, GitPullRequest, AlertTriangle } from "lucide-react"; 
import "../styles/Home.css";
import { Link } from "react-router-dom";

import Footer from "./Footer";
const Home = () => {
  const gradientRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gradientRef.current) return;

      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 100;
      const y = (e.clientY / innerHeight) * 100;

      gradientRef.current.style.backgroundPosition = `${x}% ${y}%`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Check if logged in (token stored after backend login)
useEffect(() => {
  const token = localStorage.getItem("authToken"); // ✅ same key name
  if (token) setIsLoggedIn(true);
}, []);


  // Card tilt effect
  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 8; 
    const rotateY = ((x - centerX) / centerX) * -8;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const resetTilt = (e) => {
    const card = e.currentTarget;
    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  const handleLogin = () => {
    window.location.href = "https://auth-service-j350.onrender.com/auth/github";
  };

  const handleGetStarted = () => {
    window.location.href = "/dashboard"; // change path if needed
  };

  return (
    <div >
    <div
      ref={gradientRef}
      className="interactive-gradient flex flex-col items-center justify-start min-h-screen text-center  font-sans relative overflow-hidden"
      style={{ backgroundSize: "200% 200%" }}
    >
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-40 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen w-full relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500 mb-4 tracking-tight animate-title">
          <span className=" text-white px-2 rounded">Meet</span> GitWing
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 animate-subtext max-w-2xl">
          Faster code reviews. Fewer mistakes. Happier Pipelines.
        </p>
        <div className="flex gap-4 animate-buttons">
          {isLoggedIn ? (
         <Link
  to="/dashboard"
  className="px-8 py-3 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 inline-block text-center"
>
  Get Started
</Link>
          ) : (
            <button
              onClick={handleLogin}
              className="px-8 py-3 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
            >
              <Github className="inline mr-2" /> Login with GitHub
            </button>
          )}

          <a href="#features">
            <button className="px-8 py-3 text-lg font-medium rounded-xl border border-white/60 text-white hover:bg-white hover:text-black transition duration-300">
              Learn More
            </button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-20 flex flex-col items-center justify-center gap-16 relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 animate-fadeIn">
          Why GitWing?
        </h2>

        <div className="grid gap-10 md:grid-cols-3 w-full max-w-6xl">
          {/* Card 1 */}
          <div
            className="feature-card p-6 rounded-2xl bg-white/10 backdrop-blur shadow-lg border border-white/20 hover:border-indigo-400/60 transition-transform duration-300 flex flex-col items-center text-center"
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            <BarChart3 className="w-10 h-10 text-indigo-400 mb-3 animate-icon" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Track Repositories
            </h3>
            <p className="text-gray-200 text-sm">
              See all your GitHub repositories in one dashboard with real-time
              stars, forks, and activity metrics.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="feature-card p-6 rounded-2xl bg-white/10 backdrop-blur shadow-lg border border-white/20 hover:border-pink-400/60 transition-transform duration-300 flex flex-col items-center text-center"
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            <GitPullRequest className="w-10 h-10 text-pink-400 mb-3 animate-icon" />
            <h3 className="text-xl font-semibold text-white mb-3">Analyze PRs</h3>
            <p className="text-gray-200 text-sm">
              Get instant AI summaries, detect issues, and understand PRs
              without scrolling endlessly.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="feature-card p-6 rounded-2xl bg-white/10 backdrop-blur shadow-lg border border-white/20 hover:border-red-400/60 transition-transform duration-300 flex flex-col items-center text-center"
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3 animate-icon" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Reduce Prod Issues
            </h3>
            <p className="text-gray-200 text-sm">
              Catch bugs early with automated analysis and smart insights —
              preventing production issues before they happen.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 relative z-10">
        <h2 className="text-4xl font-bold text-white mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 max-w-5xl mx-auto">
          <div className="step-card">1️⃣ Connect GitHub</div>
          <div className="step-card">2️⃣ View PR's</div>
          <div className="step-card">3️⃣ Review the AI Analysis</div>
          <div className="step-card">4️⃣ Merge Confidently</div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-20 flex flex-col items-center justify-center gap-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fadeIn">
          Ready to Get Started?
        </h2>
        <p className="text-gray-200 text-lg mb-6 max-w-xl">
          Connect your GitHub account and let GitWing handle the messy reviews —
          so you can focus on building great software.
        </p>
        {isLoggedIn ? (
         <Link
  to="/dashboard"
  className="px-8 py-3 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 inline-block text-center"
>
  Get Started
</Link>
        ) : (
          <button
            onClick={handleLogin}
            className="px-10 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:scale-110 hover:shadow-xl transition duration-300"
          >
            <Github className="inline mr-2" /> Login with GitHub
          </button>
        )}
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1.2s ease forwards; }

        @keyframes titlePop {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-title { animation: titlePop 1.5s ease forwards; }

        @keyframes subtext {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-subtext { animation: subtext 1.5s ease 0.3s forwards; }

        @keyframes buttonRise {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-buttons { animation: buttonRise 1.5s ease 0.6s forwards; }

        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-icon { animation: iconBounce 2.5s infinite; }

        @keyframes float {
          0% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-20px); opacity: 0.8; }
          100% { transform: translateY(0); opacity: 0.4; }
        }
        .animate-float { animation: float linear infinite; }

        .step-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-weight: 500;
          transition: transform 0.3s ease;
        }
        .step-card:hover {
          transform: scale(1.05);
          border-color: #818cf8;
        }
      `}</style>
      <div className="w-full">

</div>

    </div>
    <Footer />
    </div>
  );
};

export default Home;
