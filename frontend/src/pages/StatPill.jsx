import React from "react";

const StatPill = ({ label, value, variant = "plain" }) => {
  const baseClasses =
    "px-4 py-2 rounded-xl text-sm font-medium text-center";

  const variants = {
    plain: "bg-transparent shadow-none border-none text-white/90",
    glass:
      "bg-white/10 backdrop-blur-md border border-white/20 shadow-md text-white",
  };

  return (
    <div className={`${baseClasses} ${variants[variant]}`}>
      <div className="text-xs uppercase tracking-wide">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

export default StatPill;
