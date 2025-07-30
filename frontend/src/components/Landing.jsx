import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import finalcube1 from "../assets/finalcube1.gif";
import { useUser } from "../context/UserContext";
import AuthForm from "./auth/AuthForm.jsx";
import { LoadingScreenSkeleton } from "./shared/skeletons";

/** Typewriter text animation */
const TypewriterText = ({
  text,
  speed = 50,
  delay = 1000,
  pauseDuration = 2000,
  className = "",
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => setIsTyping(true), delay);
    return () => clearTimeout(start);
  }, [delay]);

  useEffect(() => {
    if (!isTyping || isPaused) return;

    let timeout;

    if (!isDeleting && currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
    } else if (!isDeleting && currentIndex === text.length) {
      timeout = setTimeout(() => {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
      }, 500);
    } else if (isDeleting && currentIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => prev - 1);
      }, speed / 2);
    } else if (isDeleting && currentIndex === 0) {
      timeout = setTimeout(() => setIsDeleting(false), 500);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, isTyping, isDeleting, isPaused, pauseDuration]);

  return (
    <span className={`gradient-text ${className}`}>
      {displayText}
      {isTyping && (
        <span className="ml-1 font-bold text-blue-400 animate-blink cursor-glow">|</span>
      )}
    </span>
  );
};

/** Mobile Arrow component for up/down arrows */
const MobileArrow = ({ color, direction }) => {
  // direction: 'down' or 'up'
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

const Landing = () => {
  const navigate = useNavigate();
  const { userRole, loading } = useUser();
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (!loading && userRole) {
      navigate(userRole === "client" ? "/client-dashboard" : "/worker-dashboard");
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="relative z-20 flex items-center justify-center h-full">
        <LoadingScreenSkeleton />
      </div>
    );
  }

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <AuthForm role={selectedRole} onBack={() => setSelectedRole(null)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#000000] text-gray-300 flex flex-col items-center justify-center px-4">
      <style>
        {`
          .card-border {
            border: 1px solid #374151;
          }
          .arrow-glow {
            animation: arrow-pulse 2s infinite ease-in-out;
          }
          @keyframes arrow-pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }

          .gif-shimmer-border {
            position: relative;
            z-index: 1;
          }
          .gif-shimmer-border::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 0.75rem;
            z-index: 2;
            pointer-events: none;
            background: linear-gradient(
              to right,
              #fff 20%, #fff 40%, #ECD08C 50%, #ECD08C 55%, #fff 70%, #fff 100%
            );
            background-size: 200% auto;
            animation: gif-shine 2.5s linear infinite;
            border: 1px solid transparent;
            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
          }
          @keyframes gif-shine {
            to {
              background-position: 200% center;
            }
          }

          /* Performance Optimizations */
          .will-change-transform {
            will-change: transform;
          }

          .will-change-auto {
            will-change: auto;
          }

          /* Reduce motion for accessibility */
          @media (prefers-reduced-motion: reduce) {
            .gradient-text,
            .introducing-badge::before,
            .introducing-badge::after,
            .cursor-glow,
            .card-title,
            .enhanced-card,
            .enhanced-button,
            #shineStopBelow,
            .gif-shimmer-border::before {
              animation: none !important;
            }
            
            .will-change-transform {
              will-change: auto;
            }
          }

          /* GPU acceleration for heavy animations */
          .gradient-text,
          .introducing-badge,
          .enhanced-card,
          .gif-shimmer-border {
            transform: translateZ(0);
            backface-visibility: hidden;
          }

          /* Optimize font rendering */
          .introducing-text,
          .card-title,
          .gradient-text {
            text-rendering: optimizeSpeed;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Introducing Build4U Badge */
          .introducing-badge {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 20px;
            background: rgba(10, 10, 10, 0.9);
            border: 1px solid rgba(55, 65, 81, 0.6);
            border-radius: 25px;
            overflow: hidden;
            backdrop-filter: blur(10px);
          }

          .introducing-badge::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(59, 130, 246, 0.4) 20%,
              rgba(147, 197, 253, 0.6) 40%,
              rgba(255, 255, 255, 0.8) 50%,
              rgba(147, 197, 253, 0.6) 60%,
              rgba(59, 130, 246, 0.4) 80%,
              transparent 100%
            );
            animation: badge-shimmer 3s linear infinite;
            border-radius: inherit;
          }

          .introducing-badge::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 1px;
            background: linear-gradient(
              90deg,
              rgba(55, 65, 81, 0.3) 0%,
              rgba(59, 130, 246, 0.5) 25%,
              rgba(147, 197, 253, 0.7) 50%,
              rgba(59, 130, 246, 0.5) 75%,
              rgba(55, 65, 81, 0.3) 100%
            );
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: xor;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            animation: badge-border-rotate 4s linear infinite;
          }

          @keyframes badge-shimmer {
            0% {
              left: -100%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              left: 100%;
              opacity: 0;
            }
          }

          @keyframes badge-border-rotate {
            0% {
              background: linear-gradient(
                90deg,
                rgba(55, 65, 81, 0.3) 0%,
                rgba(59, 130, 246, 0.5) 25%,
                rgba(147, 197, 253, 0.7) 50%,
                rgba(59, 130, 246, 0.5) 75%,
                rgba(55, 65, 81, 0.3) 100%
              );
            }
            25% {
              background: linear-gradient(
                180deg,
                rgba(55, 65, 81, 0.3) 0%,
                rgba(59, 130, 246, 0.5) 25%,
                rgba(147, 197, 253, 0.7) 50%,
                rgba(59, 130, 246, 0.5) 75%,
                rgba(55, 65, 81, 0.3) 100%
              );
            }
            50% {
              background: linear-gradient(
                270deg,
                rgba(55, 65, 81, 0.3) 0%,
                rgba(59, 130, 246, 0.5) 25%,
                rgba(147, 197, 253, 0.7) 50%,
                rgba(59, 130, 246, 0.5) 75%,
                rgba(55, 65, 81, 0.3) 100%
              );
            }
            75% {
              background: linear-gradient(
                360deg,
                rgba(55, 65, 81, 0.3) 0%,
                rgba(59, 130, 246, 0.5) 25%,
                rgba(147, 197, 253, 0.7) 50%,
                rgba(59, 130, 246, 0.5) 75%,
                rgba(55, 65, 81, 0.3) 100%
              );
            }
            100% {
              background: linear-gradient(
                90deg,
                rgba(55, 65, 81, 0.3) 0%,
                rgba(59, 130, 246, 0.5) 25%,
                rgba(147, 197, 253, 0.7) 50%,
                rgba(59, 130, 246, 0.5) 75%,
                rgba(55, 65, 81, 0.3) 100%
              );
            }
          }

          .introducing-text {
            position: relative;
            z-index: 10;
            font-size: 0.875rem;
            font-weight: 500;
            color: #e5e7eb;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            letter-spacing: 0.025em;
          }
          .gradient-text {
            background: linear-gradient(
              135deg,
              #ffffff 0%,
              #e0e7ff 15%,
              #c7d2fe 30%,
              #93c5fd 45%,
              #60a5fa 60%,
              #3b82f6 75%,
              #2563eb 90%,
              #ffffff 100%
            );
            background-size: 300% 300%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-shift 4s ease-in-out infinite;
          }

          @keyframes gradient-shift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          .cursor-glow {
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4);
            animation: cursor-pulse 1s ease-in-out infinite alternate;
          }

          @keyframes cursor-pulse {
            from {
              opacity: 1;
              text-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4);
            }
            to {
              opacity: 0.3;
              text-shadow: 0 0 5px rgba(59, 130, 246, 0.4), 0 0 10px rgba(59, 130, 246, 0.2);
            }
          }

          /* Enhanced Card Styles */
          .enhanced-card {
            background: linear-gradient(
              145deg,
              rgba(10, 10, 10, 0.9) 0%,
              rgba(17, 24, 39, 0.8) 50%,
              rgba(10, 10, 10, 0.9) 100%
            );
            border: 1px solid transparent;
            background-clip: padding-box;
            position: relative;
            transition: all 0.3s ease;
          }

          .enhanced-card::before {
            content: '';
            position: absolute;
            inset: 0;
            padding: 1px;
            background: linear-gradient(
              135deg,
              rgba(55, 65, 81, 0.6) 0%,
              rgba(75, 85, 99, 0.4) 25%,
              rgba(107, 114, 128, 0.3) 50%,
              rgba(75, 85, 99, 0.4) 75%,
              rgba(55, 65, 81, 0.6) 100%
            );
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: xor;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            z-index: -1;
          }

          .enhanced-card:hover {
            transform: scale(1.05) translateY(-5px);
            box-shadow: 
              0 10px 25px rgba(0, 0, 0, 0.5),
              0 0 20px rgba(59, 130, 246, 0.1);
          }

          .enhanced-card:hover::before {
            background: linear-gradient(
              135deg,
              rgba(59, 130, 246, 0.3) 0%,
              rgba(16, 185, 129, 0.2) 25%,
              rgba(139, 92, 246, 0.2) 50%,
              rgba(16, 185, 129, 0.2) 75%,
              rgba(59, 130, 246, 0.3) 100%
            );
          }

          .card-title {
            background: linear-gradient(
              135deg,
              #ffffff 0%,
              #f1f5f9 20%,
              #e2e8f0 40%,
              #cbd5e1 60%,
              #94a3b8 80%,
              #ffffff 100%
            );
            background-size: 200% 200%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: title-shimmer 3s ease-in-out infinite;
          }

          @keyframes title-shimmer {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          .card-description {
            color: #9ca3af;
            transition: color 0.3s ease;
          }

          .enhanced-card:hover .card-description {
            color: #d1d5db;
          }

          .enhanced-button {
            background: linear-gradient(
              135deg,
              rgba(38, 38, 38, 0.9) 0%,
              rgba(64, 64, 64, 0.8) 50%,
              rgba(38, 38, 38, 0.9) 100%
            );
            border: 1px solid rgba(75, 85, 99, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .enhanced-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(59, 130, 246, 0.2),
              transparent
            );
            transition: left 0.5s ease;
          }

          .enhanced-button:hover::before {
            left: 100%;
          }

          .enhanced-button:hover {
            background: linear-gradient(
              135deg,
              rgba(59, 130, 246, 0.2) 0%,
              rgba(64, 64, 64, 0.9) 50%,
              rgba(59, 130, 246, 0.2) 100%
            );
            border-color: rgba(59, 130, 246, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          }

          /* Mobile-specific styles */
          @media (max-width: 640px) {
            .landing-mobile-hide {
              display: none !important;
            }
            .landing-mobile-flex-col {
              flex-direction: column !important;
              gap: 1.5rem !important;
            }
            .landing-mobile-arrow-row {
              flex-direction: row !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 0.5rem !important;
              margin: 0.5rem 0 !important;
            }
            .landing-mobile-dot {
              margin: 0 0.5rem !important;
            }
          }
        `}
      </style>

      {/* Top section: GIF, typewriter card to right (desktop only), badge below GIF, vertical arrow preserved */}
      <div className="text-center mb-6 md:mb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            {/* Typewriter Card above GIF - single line, static width */}
            <div className="mb-6" style={{ width: '700px', minWidth: '700px', maxWidth: '700px', overflow: 'visible', borderRadius: '40px' }}>
              <div className="enhanced-card p-4 rounded-lg flex items-center justify-center" style={{ position: 'relative', zIndex: 2, width: '100%', overflow: 'visible', borderRadius: '40px' }}>
                <TypewriterText
                  text="Connecting skilled professionals with clients seeking quality services"
                  speed={40}
                  delay={500}
                  pauseDuration={3000}
                  className="text-base sm:text-lg md:text-xl mx-auto leading-relaxed font-medium px-2 whitespace-nowrap"
                />
              </div>
              {/* Arrow head (comment box style) only on desktop */}
              <svg
                className="hidden md:block"
                width="32"
                height="24"
                viewBox="0 0 32 24"
                fill="none"
                style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)', zIndex: 1 }}
              >
                <polygon points="0,0 32,12 0,24" fill="#171717" stroke="#374151" strokeWidth="1" />
              </svg>
            </div>

            {/* GIF + vertical arrow always centered */}
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
          </div>

          {/* Introducing Build4U Badge below GIF and typewriter */}
          <div className="mb-2 flex items-center justify-center">
            <div className="introducing-badge">
              <span className="introducing-text">Introducing Build4U</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards and arrows section: responsive for mobile */}
      <div className="flex flex-col md:flex-row items-center gap-8 landing-mobile-flex-col">
        <RoleCard
          title="I'm a Client"
          description="Looking to hire talented professionals for your next project."
          points={["Post Service Requests", "Browse & Hire Skilled Workers", "Track Jobs & Spending", "Secure Messaging", "Rate & Review Services"]}
          onClick={() => setSelectedRole("client")}
        />

        {/* Desktop arrows animation, hidden on mobile */}
        <div className="landing-mobile-hide">
          <ArrowsAnimation />
        </div>

        {/* Mobile arrows animation: blue arrow down, dot, green arrow up, only on mobile */}
        <div className="flex landing-mobile-arrow-row sm:hidden">
          <MobileArrow color="#3B82F6" direction="down" />
          <span className="w-2 h-2 bg-gradient-to-r from-[#3B82F6] to-[#10B981] rounded-full landing-mobile-dot" style={{ boxShadow: "0 0 10px #3B82F6, 0 0 20px #10B981" }} />
          <MobileArrow color="#10B981" direction="up" />
        </div>

        <RoleCard
          title="I'm a Contractor"
          description="Ready to showcase your skills and work on exciting projects."
          points={["Find & Apply for Jobs", "Build Your Portfolio", "Track Earnings & Reviews", "Manage Availability", "Grow Your Network"]}
          onClick={() => setSelectedRole("worker")}
        />
      </div>

      <p className="mt-12 text-gray-500 text-xs">
        Join thousands of professionals already using our platform
      </p>
    </div>
  );
};

/** Enhanced Role Card */
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

/** Arrows Animation between cards */
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

export default Landing;