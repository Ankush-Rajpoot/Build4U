import React from "react";

const RoleCard = ({ title, description, points, onClick }) => (
  <div
    className="enhanced-card p-4 rounded-lg sm:w-96 w-[72vw] max-w-xs cursor-pointer"
    onClick={onClick}
  >
    <div className="w-full flex justify-center items-center gif-shimmer-border" style={{ background: 'transparent', borderRadius: '50px', maxWidth: '220px', margin: '0 auto' }}>
      <h2 className="text-sm font-semibold card-title text-center text-white py-1 px-4">{title}</h2>
    </div>
    <p className="card-description mt-2 text-center text-sm">{description}</p>
    <ul className="mt-3 text-xs text-gray-400 space-y-1">
      {points.map((point, idx) => (
        <li key={idx} className="transition-colors duration-300 hover:text-gray-300">• {point}</li>
      ))}
    </ul>
    <button className="enhanced-button  border border-gray-600 mt-4 w-full text-gray-200 py-1.5 rounded text-sm relative z-10" style={{ borderWidth: '1px' }}>
      Get Started 
    </button>
  </div>
);

export default RoleCard;
