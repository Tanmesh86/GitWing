import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom"; // <-- import Link

export default function Footer({
  brand = "GitWing",
  year = new Date().getFullYear(),
  links = [
      { label: "Home", to: "/" },
    { label: "Help", to: "/help" },
    { label: "Contact", to: "/contact" },
  ],
  socials = [
    { label: "GitHub", icon: <FaGithub size={18} />, href: "https://github.com/Tanmesh86" },
    { label: "LinkedIn", icon: <FaLinkedin size={18} />, href: "https://www.linkedin.com/in/tanmesh-chandra-sahu-20309a201/" },
    { label: "Twitter", icon: <FaTwitter size={18} />, href: "https://x.com/mrtechfreak96?s=21" },
    { label: "Email", icon: <FaEnvelope size={18} />, href: "mailto:tanmeshchandrasahu@gmail.com" },
  ],
}) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full text-gray-200 p-20"
      style={{ backgroundColor: "#010a1aff", height: "320px" }}
    >
      <div className="w-full flex flex-col items-center justify-center gap-6 text-center">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500 mb-4 tracking-tight animate-title"
          >
            {brand}
          </motion.h1>
          <p className="text-sm text-gray-400">
            © {year} {brand}. All rights reserved.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
          {links.map((link, i) => (
            <motion.div key={i} whileHover={{ scale: 1.1 }}>
              <Link
                to={link.to}
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Socials */}
        <div className="flex justify-center gap-4 mt-2">
          {socials.map((s, i) => (
            <motion.a
              key={i}
              href={s.href}
              aria-label={s.label}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 5 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
            >
              {s.icon}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
