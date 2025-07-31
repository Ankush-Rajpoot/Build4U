import React from "react";
import finalcube1 from "../../assets/finalcube1.gif";

const GifArrow = () => (
  <div className="relative mb-6 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center landing-mobile-hide">
    <div className="hidden sm:block w-full h-full shadow-lg gif-shimmer-border" style={{ background: '#0A0A0A', borderRadius: '0.75rem' }}>
      <img
        src={finalcube1}
        alt="Animated Cube"
        className="w-20 h-20 md:w-24 md:h-24 object-contain rounded"
        style={{ display: "inline-block" }}
      />
      {/* Vertical gradient arrow from GIF to dot */}
      <svg
        className="absolute left-1/2 transform -translate-x-1/2"
        width="18"
        height="300"
        viewBox="0 0 18 150"
        fill="none"
        style={{ top: '100%' }}
      >
        <defs>
          <linearGradient id="arrowGradient" x1="9" y1="0" x2="9" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#000" />
            <stop id="shineStop" offset="0%" stopColor="#fff">
              <animate attributeName="offset" values="0;1" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="stop-color" values="#fff;#60A5FA;#fff" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
        </defs>
        <line x1="9" y1="0" x2="9" y2="130" stroke="url(#arrowGradient)" strokeWidth="3" />
        {/* Arrowhead at the tip, positioned at y=130 */}
        <polygon points="4,123 14,123 9,135" fill="#fff" />
      </svg>
    </div>
  </div>
);

export default GifArrow;
