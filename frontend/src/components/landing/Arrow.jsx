import React from "react";
import { motion } from "framer-motion";

const Arrow = ({ color, direction, delay, animateX, rotation, filterId }) => (
  <div className={`relative lg:mx-2 ${rotation} mb-2 lg:mb-0`}>
    <motion.svg
      width="60"
      height="30"
      viewBox="0 0 60 30"
      className={rotation}
      style={{ minWidth: "60px" }}
      animate={{ x: [0, animateX, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M8 15 L45 15 M38 8 L45 15 L38 22"
        stroke={color}
        strokeWidth="2"
        fill="none"
        filter={`url(#${filterId})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay }}
      />
    </motion.svg>
  </div>
);

export default Arrow;
