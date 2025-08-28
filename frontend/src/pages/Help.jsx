import { motion } from "framer-motion";
import { FaRobot, FaGithub, FaUserPlus, FaProjectDiagram, FaCodeBranch, FaChartLine } from "react-icons/fa";
import Footer from "./Footer";

export default function Help() {
  const steps = [
    {
      title: "What is GitWing?",
      icon: <FaRobot size={32} className="text-indigo-400" />,
      description:
        "GitWing is an AI-powered GitHub Pull Request (PR) analyser. It scans PRs and provides feedback on quality, code health, and best practices in a clean score-based UI.",
    },
    {
      title: "Connect GitHub",
      icon: <FaGithub size={32} className="text-gray-300" />,
      description:
        "Go to github.com, create an account, and set up a repository. Then, visit www.gitwing.com, click 'Login with GitHub', and connect your account.",
    },
    {
      title: "Create a Repo",
      icon: <FaUserPlus size={32} className="text-pink-400" />,
      description:
        "Once logged in, you can search or select any repository linked to your GitHub account.",
    },
    {
      title: "Select PR",
      icon: <FaProjectDiagram size={32} className="text-green-400" />,
      description:
        "From the GitWing dashboard, search or select a Pull Request (PR) you want to analyse.",
    },
    {
      title: "AI Scans PR",
      icon: <FaCodeBranch size={32} className="text-yellow-400" />,
      description:
        "GitWing automatically scans the entire PR—checking code style, logic, test coverage, and potential issues.",
    },
    {
      title: "Get Feedback & Score",
      icon: <FaChartLine size={32} className="text-blue-400" />,
      description:
        "Receive detailed AI feedback in a beautiful score-based UI with suggestions to improve code quality.",
    },
  ];

  return (
    <div>
    <div className="min-h-screen bg-[#010a1a] text-gray-200 px-6 py-16 flex flex-col items-center">
      {/* Page Header */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500"
      >
        Help & Guide
      </motion.h1>

      {/* Steps Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: i * 0.15, type: "spring" }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-lg"
          >
            <div className="flex items-center gap-4 mb-3">
              {step.icon}
              <h2 className="text-xl font-semibold text-white">{step.title}</h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
    </div>
  );
}
