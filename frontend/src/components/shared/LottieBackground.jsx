import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import landingPageAnimation from '../../assets/Landing Page.json';

const LottieBackground = ({ className = "", overlay = true, overlayIntensity = "from-white/30 via-blue-50/25 to-green-50/25" }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // For small screens, show only gradient background
  if (isSmallScreen) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-100 to-green-200 z-0"></div>
    );
  }

  return (
    <>
      {/* Lottie Background Animation */}
      <div className={`absolute w-screen h-screen lottie-container ${className}`} style={{ left: 0, top: 0, right: 0, bottom: 0 }}>
        <Lottie 
          animationData={landingPageAnimation}
          loop={true}
          autoplay={true}
          quality="high"
          renderer="canvas"
          style={{
            position: 'absolute',
            top: '-5%',
            left: '-5%',
            width: '110%',
            height: '110%',
            objectFit: 'cover'
          }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
            progressiveLoad: false,
            hideOnTransparent: true,
            clearCanvas: true,
            context: 2,
            scaleMode: 'noScale'
          }}
          interactivity={false}
        />
      </div>
      
      {/* Optional Overlay */}
      {overlay && (
        <div className={`absolute inset-0 bg-gradient-to-br ${overlayIntensity} z-10`}></div>
      )}
      
      {/* Performance CSS - Only added once */}
      <style>
        {`
          /* Performance optimizations for Lottie */
          .lottie-container {
            will-change: transform;
            backface-visibility: hidden;
            perspective: 1000px;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimize-contrast;
          }
          
          /* Disable pointer events on background */
          .lottie-container > * {
            pointer-events: none;
          }
        `}
      </style>
    </>
  );
};

export default LottieBackground;
