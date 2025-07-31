import React from "react";
import { motion } from "framer-motion";
import Arrow from "./Arrow";

const ArrowsAnimation = () => (
  <motion.div className="relative flex flex-col lg:flex-row items-center justify-center my-4 lg:my-0">
    <Arrow
      color="#3B82F6"
      direction="right"
      delay={0.8}
      animateX={3}
      rotation="rotate-90 lg:rotate-0"
      filterId="blueGlow"
    />
    <Arrow
      color="#10B981"
      direction="left"
      delay={1.2}
      animateX={-3}
      rotation="-rotate-90 lg:rotate-180"
      filterId="greenGlow"
    />
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.5 }}
    >
      <motion.div
        className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-[#3B82F6] to-[#10B981] rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          boxShadow:
            "0 0 20px rgba(59,130,246,0.5), 0 0 40px rgba(16,185,129,0.3)",
        }}
      />
    </motion.div>
  </motion.div>
);

export default ArrowsAnimation;
