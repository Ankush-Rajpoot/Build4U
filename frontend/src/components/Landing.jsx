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
    <span className={className}>
      {displayText}
      {isTyping && (
        <span className="ml-1 font-bold text-blue-500 animate-blink">|</span>
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

      {/* Top section: GIF and typewriter, hide GIF on mobile */}
      <div className="text-center mb-12 md:mb-16">
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-4 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center landing-mobile-hide">
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

          <div className="h-16 sm:h-12 flex items-center justify-center">
            <TypewriterText
              text="Connecting skilled professionals with clients seeking quality services"
              speed={40}
              delay={500}
              pauseDuration={3000}
              className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed font-medium px-4"
            />
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

/** Role Card */
const RoleCard = ({ title, description, points, onClick }) => (
  <div
    className="bg-[#0A0A0A] card-border p-4 rounded-lg sm:w-96 w-[72vw] max-w-xs cursor-pointer hover:scale-105 transition-transform"
    onClick={onClick}
  >
    <h2 className="text-2xl font-semibold text-gray-100 text-center">{title}</h2>
    <p className="text-gray-400 mt-2 text-center text-sm">{description}</p>
    <ul className="mt-3 text-xs text-gray-500 space-y-1">
      {points.map((point, idx) => (
        <li key={idx}>• {point}</li>
      ))}
    </ul>
    <button className="mt-4 w-full bg-[#262626] hover:bg-[#404040] text-gray-200 py-1.5 rounded text-sm">
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
