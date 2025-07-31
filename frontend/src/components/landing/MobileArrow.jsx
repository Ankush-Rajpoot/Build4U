import React from "react";

const MobileArrow = ({ color, direction }) => {
  const rotate = direction === 'down' ? 'rotate-90' : '-rotate-90';
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className={rotate}
      style={{ minWidth: "32px" }}
    >
      <defs>
        <filter id="mobileGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M8 16 L24 16 M17 9 L24 16 L17 23"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        filter="url(#mobileGlow)"
      />
    </svg>
  );
};

export default MobileArrow;
