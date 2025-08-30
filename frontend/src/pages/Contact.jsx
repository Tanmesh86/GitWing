import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import profileImg from "../assets/profile.JPG";
import Footer from "./Footer";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg("");

    try {
      const res = await fetch("https://feedback-7rds.onrender.com/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      setFeedbackMsg("Thank you! Your message has been sent.");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setFeedbackMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center p-6 animate-gradient">
        <style>{`
          @property --angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }

          @keyframes rotateGradient {
            0% { --angle: 0deg; }
            100% { --angle: 360deg; }
          }

          .animate-gradient {
            background: linear-gradient(var(--angle), #f56c2cff, #6a00ffff, #0574ebff);
            background-size: 300% 300%;
            animation: rotateGradient 5s linear infinite;
          }
        `}</style>

       <motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 120, damping: 14 }}
  className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-2xl"
  style={{
    backgroundColor: "#ffffff",
    boxShadow: `
      0 4px 8px rgba(0,0,0,0.12),
      0 12px 24px rgba(0,0,0,0.08),
      0 24px 48px rgba(0,0,0,0.06),
      0 48px 96px rgba(0,0,0,0.04)
    `,
  }}
>

          {/* Left Column */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex flex-col items-center justify-center text-center md:w-1/2 p-8 bg-gray-50"
          >
            <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg mb-6">
              <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Tanmesh Chandra Sahu</h2>
            <p className="text-gray-500">Full Stack Developer</p>

            <div className="mt-6 space-y-3 text-gray-600 text-sm">
              <p className="flex items-center gap-2 justify-center">
                <Mail size={18} /> tanmeshchandrasahu@gmail.com
              </p>
              <p className="flex items-center gap-2 justify-center">
                <Phone size={18} /> +91 9175135157
              </p>
              <p className="flex items-center gap-2 justify-center">
                <MapPin size={18} /> Bangalore, India
              </p>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
className="md:w-1/2 p-8 flex flex-col justify-center"
style={{ backgroundColor: "#11043bff" }} // same as bg-indigo-50
          >
            <h2 className="text-3xl font-bold text-white mb-6">Your Feedback means a Lot!</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="p-3 rounded-lg border text-white bg-transparent border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="p-3 rounded-lg border text-white bg-transparent border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="p-3 rounded-lg border text-white bg-transparent border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                required
              ></textarea>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-xl transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                <Send size={18} /> {loading ? "Sending..." : "Send Message"}
              </motion.button>
            </form>

            {feedbackMsg && (
              <p className="mt-3 text-center text-sm text-white">{feedbackMsg}</p>
            )}
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
