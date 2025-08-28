import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  LogOut,
  Stars,
  GitFork,
  Eye,
  Search,
  ExternalLink,
  Github,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import "../styles/Dashboard.css";
import StatPill from "./StatPill";
import Footer from "./Footer.jsx";
export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("updated");
  const gradientRef = useRef(null);
  const navigate = useNavigate();

  // Interactive gradient like the landing page
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

  // Fetch profile & repos
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await fetch("http://localhost:5001/github/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);

        const reposRes = await fetch("http://localhost:5001/github/repos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!reposRes.ok) throw new Error("Failed to fetch repos");
        const reposData = await reposRes.json();

        setRepos(reposData);
        setFilteredRepos(sortRepos(reposData, sort));
        setCardsLoaded(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sort]);

  // Sort helper
  const sortRepos = (list, mode) => {
    const cloned = [...list];
    switch (mode) {
      case "stars":
        return cloned.sort((a, b) => b.stargazers_count - a.stargazers_count);
      case "forks":
        return cloned.sort((a, b) => b.forks_count - a.forks_count);
      case "updated":
      default:
        return cloned.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
    }
  };

  // Filter + sort when search/sort change
  useEffect(() => {
    const filtered = repos.filter((repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRepos(sortRepos(filtered, sort));
  }, [searchTerm, repos, sort]);

  // Tilt effect for cards
  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * -8;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  };
  const resetTilt = (e) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)";
  };

  // Skeleton while loading
  if (loading) {
    return (
      <div
        ref={gradientRef}
        className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 800px at 20% 10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(1000px 700px at 80% 20%, rgba(236,72,153,0.25), transparent 60%), linear-gradient(120deg,#00041d 0%, #1e293b 65%, #0b1021 100%)",
          backgroundSize: "200% 200%",
        }}
      >
       <div class="wrapper">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="shadow"></div>
    <div class="shadow"></div>
    <div class="shadow"></div>
</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
      className="min-h-screen flex items-center justify-center text-white font-sans"
      style={{
        background: "linear-gradient(to bottom right, #b1beff, #0d1b4d, #020833)",
      }}
    >
      <motion.div
        className="bg-white/20 backdrop-blur-lg border border-white/30 p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          ⚠️ Session Expired
        </h2>
        <p className="text-gray-200 mb-6">
          Your session has expired. Please log in again to continue.
        </p>

        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            navigate("/");
          }}
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition"
        >
          Logout
        </button>
      </motion.div>
    </div>
    );
  }

  return (
    <div
      ref={gradientRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 800px at 20% 10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(1000px 700px at 80% 20%, rgba(236,72,153,0.25), transparent 60%), linear-gradient(120deg, #00041d 0%, #2b51ba 80%, #3b82f6 100%)",
        backgroundSize: "200% 200%",
      }}
    >
      {/* Floating particles (matches landing page) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-30 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${6 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 flex items-center justify-between px-5 md:px-10 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 backdrop-blur flex items-center justify-center shadow-lg">
            <Github className="w-5 h-5 text-white/90" />
          </div>
          <div className="text-white font-semibold tracking-tight">Repositories</div>
          <span className="ml-2 px-2 py-1 text-xs rounded-lg bg-white/10 border border-white/10 text-indigo-200 hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
         

          <button
            onClick={logout}
            className="group px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/90 hover:bg-white/20 transition duration-300 shadow-lg flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 px-5 md:px-10 pb-16 pt-8">

        {/* Profile Card */}
        {profile && (
  <section className="mb-10 rounded-3xl p-6 md:p-8">
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Left: Profile */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
       <img
  src={profile.avatar_url}
  alt="avatar"
  className="w-24 h-24 rounded-full object-cover ring-2 ring-white/40 shadow-xl"
/>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {profile.name || profile.login}
            </h1>
            {profile.login && (
              <a
                href={profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-200/90 hover:text-white hover:underline inline-flex items-center gap-1"
              >
                @{profile.login} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="text-indigo-100/90 mt-2">
            {profile.bio || "No bio available"}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatPill label="Followers" value={profile.followers} variant="plain" />
            <StatPill label="Following" value={profile.following} variant="plain" />
            <StatPill label="Public Repos" value={profile.public_repos} variant="plain" />
            {profile.location && (
              <StatPill label="Location" value={profile.location} variant="plain" />
            )}
          </div>
        </div>
      </div>

      {/* Right: Compact Stats (inline divs, no func) */}
      <div className="flex gap-3 lg:flex-col">
        <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-2">
          <Stars className="w-4 h-4 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-xs text-white/70">Stars</span>
            <span className="text-sm font-semibold text-white">
              {filteredRepos.reduce((a, r) => a + r.stargazers_count, 0)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-pink-500/10 border border-pink-500/20 px-3 py-2">
          <GitFork className="w-4 h-4 text-pink-400" />
          <div className="flex flex-col">
            <span className="text-xs text-white/70">Forks</span>
            <span className="text-sm font-semibold text-white">
              {filteredRepos.reduce((a, r) => a + r.forks_count, 0)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2">
          <Eye className="w-4 h-4 text-purple-400" />
          <div className="flex flex-col">
            <span className="text-xs text-white/70">Watchers</span>
            <span className="text-sm font-semibold text-white">
              {filteredRepos.reduce((a, r) => a + r.watchers_count, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
)}


        {/* Controls */}
        <section className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
className="w-3/4 pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 transform translate-x-[15%]"
            />
          </div>

          <select
  value={sort}
  onChange={(e) => setSort(e.target.value)}
  className=" transform translate-x-[-85%] px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
>
  <option value="updated" className="bg-gray-900 text-white">
    Recently Updated
  </option>
  <option value="stars" className="bg-gray-900 text-white">
    Most Stars
  </option>
  <option value="forks" className="bg-gray-900 text-white">
    Most Forks
  </option>
</select>

        </section>

        {/* Quick Stats */}
       

        {/* Repo Grid */}
        {filteredRepos.length === 0 ? (
          <p className="text-indigo-100/90">No repositories found.</p>
        ) : (
         <section
  className={`grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-700 mx-4 sm:mx-6 lg:mx-12 ${
    cardsLoaded ? "opacity-100" : "opacity-0"
  }`}
>

            {filteredRepos.map((repo, i) => (
        <motion.article
  key={repo.id}
className="
    group
  rounded-md
  p-5 md:p-8
  bg-white/10
  backdrop-blur-3xl
  border border-white/10
  shadow-[0_8px_20px_rgba(0,0,0,0.35),0_20px_60px_-10px_rgba(0,0,0,0.45)]
  hover:shadow-[0_12px_30px_rgba(0,0,0,0.4),0_30px_80px_-15px_rgba(0,0,0,0.55)]
  transform transition-all duration-500 ease-out
  hover:-translate-y-1 hover:scale-[1.02]
  flex flex-col justify-between
  h-full
  mt-8
"

  onMouseMove={handleTilt}
  onMouseLeave={resetTilt}
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.1 ,delay: 0.1}}
>
  {/* Title & Chevron */}
  <div>
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-lg md:text-xl font-semibold text-white/95 tracking-tight drop-shadow-lg">
        {repo.name}
      </h3>
      <ChevronRight className="w-5 h-5 text-white/70 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-300" />
    </div>

    {/* Description */}
    <p className="text-sm text-indigo-100/85 mt-2 line-clamp-2 drop-shadow-sm">
      {repo.description || "No description provided"}
    </p>

    {/* Meta Info */}
    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-indigo-100/80">
      <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
        ⭐ {repo.stargazers_count}
      </span>
      <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
        🍴 {repo.forks_count}
      </span>
      <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
        👀 {repo.watchers_count}
      </span>
      {repo.language && (
        <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
          {repo.language}
        </span>
      )}
      <span className="text-white/70">
        Updated {new Date(repo.updated_at).toLocaleDateString()}
      </span>
    </div>

    {/* Glass progress bar */}
    <div className="mt-4 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-500 animate-progress"
        style={{
          width: `${Math.min(
            100,
            Math.max(
              10,
              Math.floor(
                ((repo.stargazers_count + repo.forks_count + repo.watchers_count) / 300) * 100
              )
            )
          )}%`,
        }}
      />
    </div>
  </div>

  {/* Actions */}
  <div className="mt-5 flex justify-between items-center gap-3">
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 hover:scale-[1.05] transition shadow-md"
    >
      <ExternalLink className="w-4 h-4" />
      View Repo
    </a>

    <button
      onClick={() => navigate(`/repos/${repo.owner.login}/${repo.name}/prs`)}
      className="px-4 py-2.5 rounded-xl bg-white text-black shadow-[0_4px_10px_rgba(0,0,0,0.25)] hover:scale-[1.03] hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] active:scale-[0.99] transition"
    >
      View PRs
    </button>
  </div>
</motion.article>

            ))}
          </section>
        )}
      </main>

      {/* Animations & helpers */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-18px); opacity: 0.8; }
          100% { transform: translateY(0); opacity: 0.35; }
        }
        .animate-float { animation: float linear infinite; }
        @keyframes progressPulse {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(0%); }
        }
        .animate-progress { animation: progressPulse 1.8s ease-in-out infinite alternate; }
      `}</style>
     
    </div>
  );
}

/* ---------- Small presentational components ---------- */

// function StatPill({ label, value }) {
//   return (
//     <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90 backdrop-blur inline-flex items-center gap-2">
//       <span className="text-sm">{label}</span>
//       <span className="text-white font-semibold">{value}</span>
//     </div>
//   );
// }

function QuickStat({ title, value, Icon, hue = "indigo" }) {
  const ring =
    hue === "pink"
      ? "from-pink-400 to-rose-500"
      : hue === "purple"
      ? "from-purple-400 to-fuchsia-500"
      : "from-indigo-400 to-blue-500";
  return (
    <div
      className="rounded-3xl p-5 bg-white/10 border border-white/10 backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] hover:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.65)] transition-all duration-500"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">{title}</p>
          <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
        </div>
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ring} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      
    </div>
    
  );
}
