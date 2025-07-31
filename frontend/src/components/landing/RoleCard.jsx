import React from "react";

const RoleCard = ({ title, description, points, onClick }) => (
  <div
    className="enhanced-card p-4 rounded-lg sm:w-96 w-[72vw] max-w-xs cursor-pointer"
    onClick={onClick}
  >
    <h2 className="text-2xl font-semibold card-title text-center">{title}</h2>
    <p className="card-description mt-2 text-center text-sm">{description}</p>
    <ul className="mt-3 text-xs text-gray-400 space-y-1">
      {points.map((point, idx) => (
        <li key={idx} className="transition-colors duration-300 hover:text-gray-300">• {point}</li>
      ))}
    </ul>
    <button className="enhanced-button mt-4 w-full text-gray-200 py-1.5 rounded text-sm relative z-10">
      Get Started
    </button>
  </div>
);

export default RoleCard;
