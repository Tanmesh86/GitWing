import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

import { motion } from "framer-motion";

export default function PRList() {
  const { owner, repo } = useParams();
  const [prs, setPRs] = useState([]);
  const [filteredPRs, setFilteredPRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [prFilter, setPrFilter] = useState("all");
  const navigate = useNavigate();
  const [cardsLoaded, setCardsLoaded] = useState(false);

  // Fetch PRs
  useEffect(() => {
    const fetchPRs = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://gitwing.onrender.com/github/repos/${owner}/${repo}/pulls`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error(`Failed to fetch PRs: ${res.status}`);
        const data = await res.json();
        setPRs(data);
        setFilteredPRs(data);
        setCardsLoaded(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, [owner, repo]);

  // Apply search, sort, and filter
  useEffect(() => {
    let updatedPRs = [...prs];

    if (prFilter !== "all") {
      updatedPRs = updatedPRs.filter((pr) =>
        prFilter === "declined"
          ? pr.state === "closed" && pr.merged_at === null
          : pr.state === prFilter
      );
    }

    if (searchTerm) {
      updatedPRs = updatedPRs.filter((pr) =>
        pr.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    updatedPRs.sort((a, b) =>
      sortOrder === "latest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
    );

    setFilteredPRs(updatedPRs);
  }, [prs, searchTerm, sortOrder, prFilter]);

if (loading)
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#0a1a66] via-[#0d1b4d] to-[#020833]">
<div class="wrapper">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="shadow"></div>
    <div class="shadow"></div>
    <div class="shadow"></div>
</div>
      <p className="text-white text-lg font-semibold animate-pulse">
        Loading pull requests…
      </p>
    </div>
  );


  if (error)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="px-6 py-5 rounded-2xl backdrop-blur-xl bg-red-500/10 shadow-2xl border border-red-400/40">
          <p className="text-red-300 font-semibold">⚠️ {error}</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );

  return (
    <div
      id="prlist-root"
      className="min-h-screen w-full flex flex-col px-5 md:px-8 py-12 text-white relative overflow-hidden"  style={{
          background:
            "radial-gradient(1200px 800px at 20% 10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(1000px 700px at 80% 20%, rgba(236,72,153,0.25), transparent 60%), linear-gradient(120deg,#00041d 0%, #1e293b 65%, #0b1021 100%)",
          backgroundSize: "200% 200%",
        }}
    >
      {/* Background gradient same as dashboard */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#1e1b4b] to-[#312e81] opacity-95" />
      <div className="absolute inset-0 backdrop-blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-3 animate-fadeDown">
          <h2 className="text-3xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-sky-400 to-purple-400">
            Pull Requests — {owner}/{repo}
          </h2>
          <Link
            to="/dashboard"
            className="px-5 py-2 rounded-xl bg-red-500/20 border border-red-400 text-red-300
                       hover:bg-red-500/40 hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] 
                       transition duration-300"
          >
            ⬅ Back
          </Link>
        </div>

        {/* Controls */}
<div className="flex flex-col md:flex-row items-center gap-4 mb-10 w-full animate-fadeIn delay-200 translate-x-[15%] mt-[10%] ">
          <input
            type="text"
            placeholder="🔍 Search PRs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md 
                       placeholder-white/70 text-white border border-white/20
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 
                       transition w-full md:w-1/2"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20
                       text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="latest" className="bg-[#1f1f2e] text-white">
              Sort by Latest
            </option>
            <option value="oldest" className="bg-[#1f1f2e] text-white">
              Sort by Oldest
            </option>
          </select>

          <select
  value={prFilter}
  onChange={(e) => setPrFilter(e.target.value)}
  className="px-3 py-2 rounded-lg bg-black/40 backdrop-blur-md 
             border border-white/20 text-white shadow-lg 
             focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
>
  <option value="all" className="bg-black text-white">
    All PRs
  </option>
  <option value="open" className="bg-black text-white">
    Open
  </option>
  <option value="closed" className="bg-black text-white">
    Closed
  </option>
  <option value="declined" className="bg-black text-white">
    Declined
  </option>
</select>

        </div>

        {/* PR Grid */}
        {filteredPRs.length === 0 ? (
          <p className="text-indigo-100/80">No pull requests found.</p>
        ) : (
         <div
  className={`px-6 sm:px-10 lg:px-16 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-700 mx-6${
    cardsLoaded ? "opacity-100" : "opacity-0"
  }`}
>
  {filteredPRs.map((pr, i) => (
    <motion.div
      key={pr.id}
      className="
        group
        relative
        flex flex-col justify-between
        rounded-3xl
        p-6
        bg-white/10
        backdrop-blur-3xl
        border border-white/10
        shadow-[0_8px_20px_rgba(0,0,0,0.35),0_20px_60px_-10px_rgba(0,0,0,0.45)]
        transition-transform duration-300 ease-out
        hover:-translate-y-2 hover:scale-[1.03]
        overflow-hidden
      "
      style={{
        animation: `fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards`,
        animationDelay: `${i * 120}ms`,
        minHeight: "160px",
      }}
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * 5; // tilt intensity
        const rotateY = ((x - centerX) / centerX) * -5;
        card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget;
        card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
      }}
    >
      {/* Glow gradient border */}
      <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg md:text-xl font-semibold text-indigo-100 group-hover:text-white transition-colors line-clamp-2 drop-shadow-md">
            {pr.title}
          </h3>
          <span
            className={`inline-block rounded-md text-xs font-bold px-2 py-1 ml-2 shadow-md transition-all duration-300 ${
              pr.state === "open"
                ? "bg-green-500/80 text-white"
                : "bg-gray-600/80 text-gray-100"
            }`}
          >
            {pr.state.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-indigo-100/80 mt-1 line-clamp-2 drop-shadow-sm">
          #{pr.number} opened by <strong className="text-indigo-200">{pr.user.login}</strong>
        </p>
        <p className="text-sm text-indigo-100/70 mt-1 drop-shadow-sm">
          📅 {new Date(pr.created_at).toLocaleDateString()}
        </p>

        <div className="mt-auto flex justify-end gap-3 pt-5">
          <button
            onClick={() =>
              navigate(`/repos/${owner}/${repo}/pulls/${pr.number}/details`)
            }
            className="
              px-4 py-2
              rounded-xl
              text-white
              border border-white/20
              bg-white/5
              hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600
              hover:border-transparent
              hover:shadow-lg
              transition-all duration-300 ease-out
            "
          >
            View PR →
          </button>
        </div>
      </div>
    </motion.div>
  ))}
</div>


        )}
      </div>

      <style>
        {`
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(20px) scale(0.98); }
            60% { opacity: 1; transform: translateY(-6px) scale(1.02); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fadeDown {
            animation: fadeDown 0.7s ease forwards;
          }
          @keyframes fadeDown {
            0% { opacity: 0; transform: translateY(-15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s ease forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
