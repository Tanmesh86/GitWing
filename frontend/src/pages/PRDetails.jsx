import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/PRDetails.css"; // Import your custom styles
const CONTEXT_LINES = 20;
import axios from "axios";
import Footer from "./Footer.jsx";
import { useNavigate } from "react-router-dom";



export default function PRDetails() {
  const { owner, repo, number } = useParams();
  const [prDetails, setPrDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedHunks, setExpandedHunks] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState({});
const [showLogout, setShowLogout] = useState(false);
const navigate = useNavigate();


  // Fetch PR Details
  useEffect(() => {
    const fetchPRDetails = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5001/github/repos/${owner}/${repo}/pulls/${number}/details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
          if (res.status === 401) {
        setShowLogout(true);   // <-- show the logout overlay
        return;
      }
        if (!res.ok) throw new Error(`Failed to fetch PR details: ${res.status}`);
        const data = await res.json();
        setPrDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPRDetails();
  }, [owner, repo, number]);

  // Fetch Analysis
  useEffect(() => {
    const fetchAnalysis = async () => {
      setAnalyzing(true);
      setAnalysis(null);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `http://localhost:5001/github/repos/${owner}/${repo}/pulls/${number}/analyze`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

          if (res.status === 401) {
        setShowLogout(true);   // <-- show the logout overlay
        return;
      }
        if (!res.ok) throw new Error(`Failed to analyze PR: ${res.status}`);
        const data = await res.json();
        setAnalysis(data.analysis || { summary: "No issues detected ✅", findings: [] });
      } catch (err) {
        setError(err.message);
      } finally {
        setAnalyzing(false);
      }
    };

    fetchAnalysis();
  }, [owner, repo, number]);
function formatFinding(result) {
  switch (result.type) {
    case "unbalanced_braces":
      return `In  ${result.file} , the recent changes introduced a brace mismatch. Please check for missing '{' or '}' characters.`;

    case "removed_type_still_used":
      return `In  ${result.file} , the type  ${result.message.match(/'(.+)'/)[1]}  was removed, but it is still referenced in the code. This will likely break compilation.`;

    case "type_removed":
      return `The type  ${result.message.match(/'(.+)'/)[1]}  was removed from  ${result.file} . Ensure it is no longer needed or replaced.`;

    case "console_log":
      return `A \`console.log\` statement was found in  ${result.file}  at line ${result.line}. Consider removing it before merging.`;

    case "non_java_syntax":
      return `Suspicious non-Java syntax detected in  ${result.file}  at line ${result.line} (e.g., console.log). Please remove it.`;

    case "stray_text_added":
      return `A stray text line was added in  ${result.file}  at line ${result.line}: "${result.message.replace("Stray non-Java text added: ", "")}".`;

    case "large_change":
      return `The file  ${result.file}  has ${result.message.match(/\d+/)} changes, which may be too large for easy review. Consider splitting into smaller pull requests.`;

    case "function_summary":
      return `The function  ${result.function}  in  ${result.file}  was modified (lines ${result.startLine}–${result.endLine}). Changes: ${result.addedLines} additions, ${result.removedLines} deletions.`;

    case "class_summary":
      return `The class  ${result.class}  in  ${result.file}  was modified (lines ${result.startLine}–${result.endLine}). Changes: ${result.addedLines} additions, ${result.removedLines} deletions.`;

    case "todo_comment":
      return `A TODO/FIXME comment was found in  ${result.file} . Please resolve it or link to a tracking issue.`;

    case "debugger_statement":
      return `A \`debugger\` statement was found in  ${result.file}  (line ${result.line}). Please remove it before merging.`;

    case "eval_usage":
      return `The code in  ${result.file}  contains \`eval()\`, which is a critical security risk. Refactor to avoid using eval.`;

    default:
      return result.message || "An unspecified issue was found.";
  }
}

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
    </div>
  );


  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400 font-sans">
        <motion.p
          className="text-lg font-medium"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.p>
      </div>
    );


    const toggleFileCollapse = (filename) => {
  setCollapsedFiles((prev) => ({
    ...prev,
    [filename]: !prev[filename],
  }));
};
  if (!prDetails) return <p className="text-center mt-5 text-white">No PR details found</p>;

  const { details, files } = prDetails;

  // --- Hunk Parsing & Expand Logic ---
  const parseHunks = (patch) => {
    const lines = patch.split("\n");
    const hunks = [];
    let currentHunk = null;
    let oldLine = 0,
      newLine = 0;

    lines.forEach((line) => {
      if (line.startsWith("@@")) {
        const match = /@@ -(\d+),?\d* \+(\d+),?\d* @@/.exec(line);
        if (match) {
          oldLine = parseInt(match[1], 10) - 1;
          newLine = parseInt(match[2], 10) - 1;
        }
        if (currentHunk) hunks.push(currentHunk);
        currentHunk = { header: line, lines: [] };
      } else if (currentHunk) {
        let type = "unchanged";
        let displayOld = oldLine + 1;
        let displayNew = newLine + 1;

        if (line.startsWith("+")) {
          type = "added";
          displayOld = "";
          newLine++;
        } else if (line.startsWith("-")) {
          type = "removed";
          displayNew = "";
          oldLine++;
        } else {
          oldLine++;
          newLine++;
        }

        currentHunk.lines.push({ line, type, oldLine: displayOld, newLine: displayNew });
      }
    });

    if (currentHunk) hunks.push(currentHunk);
    return hunks;
  };

  const toggleExpand = (file, hIdx, direction, expand = true) => {
    setExpandedHunks((prev) => {
      const key = `${file.filename}-${hIdx}`;
      const state = prev[key] || { above: 0, below: 0 };
      const hunks = parseHunks(file.patch || "");
      const hunk = hunks[hIdx];
      if (!hunk) return prev;

      const firstChanged = hunk.lines.findIndex((l) => l.type !== "unchanged");
      const lastChanged =
        hunk.lines.length - 1 - [...hunk.lines].reverse().findIndex((l) => l.type !== "unchanged");

      const newState = { ...state };
      if (direction === "above") {
        newState.above = expand ? Math.min(state.above + CONTEXT_LINES, firstChanged) : 0;
      } else {
        newState.below = expand ? Math.min(state.below + CONTEXT_LINES, hunk.lines.length - 1 - lastChanged) : 0;
      }

      return { ...prev, [key]: newState };
    });
  };

  const expandAll = (file) => {
    const updated = {};
    parseHunks(file.patch || "").forEach((_, hIdx) => {
      updated[`${file.filename}-${hIdx}`] = { above: 1000, below: 1000 };
    });
    setExpandedHunks(updated);
  };

  const collapseAll = (file) => {
    const updated = {};
    parseHunks(file.patch || "").forEach((_, hIdx) => {
      updated[`${file.filename}-${hIdx}`] = { above: 0, below: 0 };
    });
    setExpandedHunks(updated);
  };

  //PR Score

  // Utility: calculate PR score from analysis
const calculatePRScore = (analysis) => {
  if (!analysis || !analysis.findings) return 100;

  let score = 100;
  analysis.findings.forEach((f) => {
    if (f.severity === "critical") score -= 30;
    else if (f.severity === "warning") score -= 15;
    else if (f.severity === "safe") score += 2;
  });

  // Clamp between 0–100
  return Math.max(0, Math.min(100, score));
};

// Utility: calculate Standards Snapshot (Complexity, Maintainability, Reliability)
const calculateStandards = (analysis) => {
  if (!analysis) {
    return {
      complexity: "Medium",
      maintainability: "Medium",
      reliability: "Medium",
      risk: "Medium",
    };
  }

  const { critical = 0, warnings = 0, safe = 0 } = analysis;

  // Complexity → driven by critical issues
  const complexity =
    critical > 2 ? "High" : critical > 0 ? "Medium" : "Low";

  // Maintainability → driven by warnings
  const maintainability =
    warnings > 5 ? "High" : warnings > 2 ? "Medium" : "Low";

  // Reliability → safe vs risky ratio
  const totalFindings = critical + warnings + safe;
  const reliabilityScore =
    totalFindings === 0 ? 1 : safe / totalFindings;

  const reliability =
    reliabilityScore > 0.7 ? "High" : reliabilityScore > 0.4 ? "Medium" : "Low";

  // Risk → driven by critical + warnings
  const totalRisks = critical + warnings;
  const risk =
    totalRisks > 5 ? "High" : totalRisks > 2 ? "Medium" : "Low";

  return { complexity, maintainability, reliability, risk };
};


// Utility: Generate sentence-style coding standards review
const generateCodingStandards = (analysis) => {
  if (!analysis || !analysis.findings) {
    return {
      complexity: "The code looks reasonably straightforward with no major red flags.",
      performance: "No performance bottlenecks are expected in this change.",
      maintainability: "The structure appears maintainable and clean.",
      coupling: "No risky dependencies between components were introduced.",
      designPatterns: "No clear design patterns, but the structure feels consistent.",
      refactoring: "No obvious refactoring is needed right now.",
      reliability: "Edge cases seem covered and reliability looks fine.",
      impact: "This change has limited impact and is safe to merge.",
    };
  }

  const critical = analysis.findings.filter(f => f.severity === "critical");
  const warnings = analysis.findings.filter(f => f.severity === "warning");
  const functions = analysis.findings.filter(f => f.type === "function_summary");
  const classes = analysis.findings.filter(f => f.type === "class_summary");

  return {
    complexity:
      critical.length > 2
        ? "The code feels overly complex — multiple critical issues were introduced, which may make it harder to follow."
        : critical.length > 0
        ? "The code has a few risky spots that increase its complexity."
        : "The code remains straightforward and easy to follow.",

    performance:
      warnings.some(f => f.type === "large_change")
        ? "This PR introduces large changes that might affect performance or review speed."
        : "No performance issues are likely from this change.",

    maintainability:
      warnings.length > 3
        ? "There are several warnings — maintaining this code could be tricky unless addressed."
        : warnings.length > 0
        ? "A few minor issues were flagged, but overall it should be maintainable."
        : "The code looks clean and maintainable.",

    coupling:
      critical.some(f => f.type === "removed_type_still_used")
        ? "There’s a coupling issue: a removed type is still being referenced, which will break things unless fixed."
        : "No strong coupling concerns were detected.",

    designPatterns:
      classes.length > 0
        ? "Some class structures suggest a reasonable use of design practices."
        : "No clear design patterns are visible here, but that’s not necessarily a problem.",

    refactoring:
      warnings.length > 0
        ? "Some areas could benefit from refactoring to improve clarity or consistency."
        : "The code doesn’t need immediate refactoring.",

    reliability:
      critical.length > 0
        ? "Because of the critical issues, reliability may be affected — worth a closer review."
        : "The code looks reliable and should handle typical cases well.",

    impact:
      functions.length > 0
        ? `Around ${functions.length} functions were modified, so this change deserves careful testing.`
        : "The functional impact of this PR is minimal.",
  };
};



const { complexity, maintainability, reliability, risk } = calculateStandards(analysis);

if (showLogout) {
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


if (analyzing) {
   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background:
            "linear-gradient(270deg, #ffffff, #1d0969, #6753ff)",
          backgroundSize: "600% 600%",
          animation: "gradientShift 8s ease infinite",
        }}
      ></div>

      {/* Loader */}
<div class="loader">
  <span><span></span><span></span><span></span><span></span></span>
  <div class="base">
    <span></span>
    <div class="face"></div>
    
  </div>
  
</div>
<p className="text-white text-lg font-sans tracking-widest animate-pulse absolute z-10" style={{ left: "31%" }}>
  GitWing On the way...
</p>
<div class="longfazers">
  <span></span><span></span><span></span><span></span>
</div>


      {/* Long Fazers (sci-fi beams) */}
      <div className="absolute inset-0 flex justify-around items-center longfazers">
        <span className="w-1 h-full bg-white/10 animate-pulse"></span>
        <span className="w-1 h-full bg-white/20 animate-pulse delay-200"></span>
        <span className="w-1 h-full bg-white/30 animate-pulse delay-400"></span>
        <span className="w-1 h-full bg-white/40 animate-pulse delay-600"></span>
      </div>

      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .loader span {
            display: block;
          }
          .loader > span > span {
            display: inline-block;
            width: 8px;
            height: 8px;
            margin: 2px;
            background: white;
            border-radius: 50%;
            animation: bounce 0.8s infinite alternate;
          }
          .loader > span > span:nth-child(2) { animation-delay: 0.2s; }
          .loader > span > span:nth-child(3) { animation-delay: 0.4s; }
          .loader > span > span:nth-child(4) { animation-delay: 0.6s; }

          @keyframes bounce {
            from { transform: translateY(0); opacity: 0.6; }
            to { transform: translateY(-10px); opacity: 1; }
          }

          .longfazers span {
            animation: beamFlow 2s linear infinite;
          }
          @keyframes beamFlow {
            0% { transform: translateY(100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-100%); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

  return (
    <div>
<div
  className="min-h-screen px-6 py-10 text-white font-sans"
  style={{
    background: "linear-gradient(to bottom right, #b1beffff, #0d1b4d, #020833)",
  }}
>
      {/* Header */}
     <div className="flex flex-col md:flex-row justify-between items-center mb-10">
  <h2 className="text-3xl font-bold tracking-wide">
    PR #{details.number}: <span className="text-white">{details.title}</span>
  </h2>
  <Link
    to={`/repos/${owner}/${repo}/prs`}
    className="mt-4 md:mt-0 px-5 py-2 rounded-lg bg-red-500/20 border border-red-500 text-red-300
    hover:bg-red-500/40 hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)] transition duration-300"
  >
    ⬅ Back to PR List
  </Link>
</div>


      <div className="flex flex-col lg:flex-row gap-8">
  {/* Left column: Analysis + AI Summary */}
  
  <div className="lg:w-1/3 flex flex-col gap-6">
 
{/* PR Score Card */}
<motion.div
  className="bg-white/30 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl flex flex-row items-start justify-between w-full max-w-3xl"
  initial={{ opacity: 0, x: -40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7 }}
>
  {analysis && (
    <>
      {/* Left Column - Score + Action */}
      <div className="flex flex-col items-center w-1/2">
        {/* Score Circle */}
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#grad)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - calculatePRScore(analysis) / 100)}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - calculatePRScore(analysis) / 100) }}
              transition={{ duration: 1 }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" stopColor="#00BFA6" /> {/* teal */}
  <stop offset="100%" stopColor="#3D5AFE" /> {/* indigo */}
</linearGradient>

            </defs>
          </svg>

          {/* Center Score */}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-900">
              {calculatePRScore(analysis)}
            </span>
            <span className="text-sm text-gray-700">Score</span>
          </div>
        </div>

        {/* Action Recommendation */}
        <div className="text-center">
          <span className="text-sm font-bold text-red-700">🛑 Action Recommendation:</span>
          <div className="mt-1">
            {calculatePRScore(analysis) >= 80 && (
              <span className="px-3 py-1 rounded-lg bg-green-200/50 text-green-700 font-semibold">
                ✅ Mergeable
              </span>
            )}
            {calculatePRScore(analysis) >= 50 && calculatePRScore(analysis) < 80 && (
              <span className="px-3 py-1 rounded-lg bg-yellow-200/50 text-yellow-700 font-semibold">
                ⚠️ Needs Fixes
              </span>
            )}
            {calculatePRScore(analysis) < 50 && (
              <span className="px-3 py-1 rounded-lg bg-red-200/50 text-red-700 font-semibold">
                ⛔ Blocked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - GitWing Score + Merge */}
      <div className="flex flex-col justify-between w-1/2">
        <h4 className="text-indigo-700 font-semibold mb-2">GitWing Score</h4>
        {/* GitWing Score Section */}
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/20 text-sm text-gray-900 w-4/4">
          {(() => {
            const { complexity, maintainability, reliability } = calculateStandards(analysis);
            return (
              <>
                <h4 className="text-indigo-700 font-semibold mb-2">Overall</h4>
                <p>- Complexity: <span className="font-medium">{complexity}</span></p>
                <p>- Maintainability: <span className="font-medium">{maintainability}</span></p>
                <p>- Reliability: <span className="font-medium">{reliability}</span></p>
                <p>- Risk: <span className="font-medium">{risk}</span></p>
              </>
            );
          })()}
        </div>

        {/* Merge Button Section */}
        <button
          onClick={() =>
            window.open(`https://github.com/${owner}/${repo}/pull/${number}`, "_blank")
          }
          className="mt-4 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition"
        >
          Merge Pull Request
        </button>
      </div>
    </>
  )}
</motion.div>





    {/* Rule Engine Analysis */}
   <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg flex flex-col p-4">
   <h4 className="font-sans text-White- p-4 top-0 z-10 text-2xl">
  GitWing Findings
</h4>

 <ul className="p-1 overflow-y-auto max-h-[500px] custom-scrollbar flex-1 space-y-4">
  {analysis.findings.map((result, idx) => {
    let color = "text-blue-400";
    if (result.severity === "warning") color = " text-yellow-400";
    if (result.severity === "critical") color = "text-red-500";
    if (result.severity === "safe") color = "text-green-700";
    if (result.severity === "info") color = "text-blue-700";

    // build detail string if message missing
    let details = result.message;
    if (!details) {
      if (result.impact) details = result.impact;
      else if (result.class) details = `Class: ${result.class}`;
      else if (result.function) details = `Function: ${result.function}`;
      else details = "(No extra details)";
    }

    return (
      <motion.li
        key={idx}
        className="bg-transparent px-4 py-3 rounded-2xl 
                   border border-transparent
                   hover:border-white/50 
                   hover:shadow-lg hover:shadow-white/10
                   transform hover:-translate-y-1 hover:scale-[1.02]
                   transition-all duration-300 ease-out"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: idx * 0.1 }}
      >
        <span className={` p-1 bg-white  rounded-md font-semibold tracking-wide ${color}`}>
          [{result.severity.toUpperCase()}]
        </span>{" "}<br />
        {formatFinding(result)}
      </motion.li>
    );
  })}
</ul>

</div>


    {/* AI Summary */}
{/* GitWing Summary (sentence style) */}
<div className="mt-2 bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg 
                max-h-[80vh] overflow-y-auto no-scrollbar">
  <h4 className="text-2xl p-4 text-white mb-4 tracking-wide">
    GitWing Analysis
  </h4>
  {(() => {
    const summary = generateCodingStandards(analysis);
    return (
      <ul className="space-y-3 p-4 text-white text-base leading-relaxed">
        <li>
          <span className="font-black text-xl text-white">Complexity</span><br />
          {summary.complexity}
        </li>
        <br />
        <li>
          <span className="font-black text-xl text-white">Performance</span><br />
          {summary.performance}
        </li>
        <br />
        <li>
          <span className="font-black text-xl text-white">Maintainability</span><br />
          {summary.maintainability}
        </li>
        <br />
        <li>
          <span className="font-black text-xl text-white">Coupling & Interdependencies</span><br />
          {summary.coupling}
        </li><br />
        <li>
          <span className="font-black text-xl text-white">Design Patterns</span><br />
          {summary.designPatterns}
        </li>
        <br />
        <li>
          <span className="font-black text-xl text-white">Refactoring Opportunities</span><br />
          {summary.refactoring}
        </li>
        <br />
        <li>
          <span className="font-black text-xl text-white">Edge Cases & Reliability</span><br />
          {summary.reliability}
        </li>
        <br />
        <li>
          <span className="font-black text-xl text-white">Function Impact</span><br />
          {summary.impact}
        </li>
      </ul>
    );
  })()}
</div>



  </div>

  {/* Right column: Code window */}
  <motion.div
  className="lg:w-2/3 flex flex-col gap-6"
  initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7 }}
>
  {files.map((file, fIdx) => {
    const hunks = parseHunks(file.patch || "");
    const isCollapsed = collapsedFiles[file.filename]; // Track collapsed state

    return (
      <motion.div
        key={fIdx}
        className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-md shadow-lg overflow-y-auto max-h-screen "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: fIdx * 0.15 }}
      >
        {/* File header */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-white">{file.filename}</h4>

          <div className="flex gap-2">
            {/* Toggle file collapse */}
            <button
              onClick={() => toggleFileCollapse(file.filename)}
              className="px-2 py-1 text-xs bg-gray-600/30 rounded hover:bg-gray-600/50 transition"
            >
              {isCollapsed ? "Expand File" : "Collapse File"}
            </button>

            <button
              onClick={() => expandAll(file)}
              className="px-2 py-1 text-xs bg-indigo-600/30 rounded hover:bg-indigo-600/50 transition"
            >
              Expand All
            </button>
            <button
              onClick={() => collapseAll(file)}
              className="px-2 py-1 text-xs bg-gray-600/30 rounded hover:bg-gray-600/50 transition"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Code block (conditionally render) */}
        {!isCollapsed && (
          <div
            className="overflow-auto max-h-[600px] rounded-lg p-2  [scrollbar-width:none] [-ms-overflow-style:none] 
             [&::-webkit-scrollbar]:hidden"
            style={{
              backgroundColor: "#0a1a3b",
              fontFamily:
                "Consolas, Monaco, 'Lucida Console', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New'",
              fontWeight: 400,
              color: "#ffffff",
            }}
          >
            {hunks.map((hunk, hIdx) => {
              const key = `${file.filename}-${hIdx}`;
              const state = expandedHunks[key] || { above: 0, below: 0 };
              const firstChanged = hunk.lines.findIndex((l) => l.type !== "unchanged");
              const lastChanged =
                hunk.lines.length - 1 - [...hunk.lines].reverse().findIndex((l) => l.type !== "unchanged");
              const start = Math.max(0, firstChanged - state.above);
              const end = Math.min(hunk.lines.length - 1, lastChanged + state.below);
              const visibleLines = hunk.lines.slice(start, end + 1);

              return (
                <motion.div
                  key={hIdx}
                  className="mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: hIdx * 0.1 }}
                >
                  {/* Hunk header + buttons */}
                  <div className="flex justify-between items-center bg-white p-1 rounded mb-1">
                    <span className="text-gray-500 font-bold">{hunk.header}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleExpand(file, hIdx, "above", true)}
                        className="px-2 py-1 text-xs bg-indigo-600 rounded hover:bg-indigo-600/50 transition"
                      >
                        ⬆ Expand above
                      </button>
                      <button
                        onClick={() => toggleExpand(file, hIdx, "above", false)}
                        className="px-2 py-1 text-xs bg-gray-600 rounded hover:bg-gray-600/50 transition"
                      >
                        ⬆ Collapse above
                      </button>
                      <button
                        onClick={() => toggleExpand(file, hIdx, "below", true)}
                        className="px-2 py-1 text-xs bg-indigo-600 rounded hover:bg-indigo-600/50 transition"
                      >
                        ⬇ Expand below
                      </button>
                      <button
                        onClick={() => toggleExpand(file, hIdx, "below", false)}
                        className="px-2 py-1 text-xs bg-gray-600 rounded hover:bg-gray-600/50 transition"
                      >
                        ⬇ Collapse below
                      </button>
                    </div>
                  </div>

                  {start > 0 && <div className="text-gray-400">... {start} hidden line(s) above ...</div>}

                  {visibleLines.map((lineObj, i) => {
                    let bg = "";
                    if (lineObj.type === "added") bg = "bg-green-600/70";
                    if (lineObj.type === "removed") bg = "bg-red-600/30";
                    return (
                      <div key={i} className="flex">
                        <span className="w-12 text-right pr-2 text-gray-400">{lineObj.oldLine || ""}</span>
                        <span className="w-12 text-right pr-2 text-gray-400">{lineObj.newLine || ""}</span>
                        <span className={`flex-1 px-2 ${bg}`} style={{ color: "#ffffff" }}>
                          {lineObj.line}
                        </span>
                      </div>
                    );
                  })}

                  {end < hunk.lines.length - 1 && (
                    <div className="text-gray-400">... {hunk.lines.length - 1 - end} hidden line(s) below ...</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  })}
</motion.div>
      
</div>



    </div>
    <Footer className="mt-10"/>
    </div>
  );
}
