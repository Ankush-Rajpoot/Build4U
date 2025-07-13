import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import splashGif from '../../assets/finalcube1.gif';

const SplashScreen = ({ onComplete, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center justify-center">
        <motion.img
          src={splashGif}
          alt="BuildForYou Loading"
          className="max-w-md w-full h-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
