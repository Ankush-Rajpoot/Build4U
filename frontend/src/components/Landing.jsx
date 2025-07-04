import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AuthForm from './auth/AuthForm.jsx';
import LottieBackground from './shared/LottieBackground';


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
    const startTyping = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTyping);
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
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    text,
    speed,
    isTyping,
    isDeleting,
    isPaused,
    pauseDuration,
  ]);

  return (
    <span className={className}>
      {displayText}
      {isTyping && (
        <span className="ml-1 font-bold text-blue-500 animate-blink">|</span>
      )}
    </span>
  );
};

// Add blink animation style

const Landing = () => {
  const navigate = useNavigate();
  const { userRole, loading } = useUser();
  const [selectedRole, setSelectedRole] = useState(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && userRole) {
      navigate(
        userRole === "client" ? "/client-dashboard" : "/worker-dashboard"
      );
    }
  }, [userRole, loading, navigate]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ margin: 0, padding: 0 }}>
        <LottieBackground />
        
        {/* Loading Content */}
        <div className="relative z-20 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-green-200 flex items-center justify-center px-4">
        <AuthForm role={selectedRole} onBack={() => setSelectedRole(null)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ margin: 0, padding: 0 }}>
      <LottieBackground />
      
      {/* Content */}
      <div className="relative z-20 min-h-screen overflow-y-auto">
        <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .animate-blink {
            animation: blink 1s steps(1) infinite;
          }
          
          /* Ensure no body margins/padding interfere */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden;
            width: 100vw;
            height: 100vh;
          }
          
          * {
            box-sizing: border-box;
          }
          
          #root {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
          }
        `}
        </style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <div className="h-16 sm:h-12 flex items-center justify-center">
            <TypewriterText
              text="Connecting skilled professionals with clients seeking quality services"
              speed={40}
              delay={500}
              pauseDuration={3000}
              className="text-lg sm:text-xl md:text-2xl text-gray-900 max-w-3xl mx-auto leading-relaxed font-medium px-4"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 max-w-5xl mx-auto">
          <div 
            className="w-full md:w-1/2 max-w-sm md:max-w-md group"
            onClick={() => handleRoleSelect('client')}
          >
            <div className="relative rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-3xl cursor-pointer">
              <div className="bg-gradient-to-br from-white/85 to-blue-50/75 p-6 md:p-8 rounded-xl border border-blue-100 backdrop-blur-sm">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 text-center">I'm a Client</h2>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-center leading-relaxed">
                  I'm looking for skilled professionals to help with my projects and services.
                </p>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 md:py-3 px-4 md:px-6 rounded-full font-medium transition-all duration-300 group-hover:shadow-lg text-center transform group-hover:-translate-y-1 text-sm md:text-base">
                  Find Services
                </div>
              </div>
            </div>
          </div>

          <div 
            className="w-full md:w-1/2 max-w-sm md:max-w-md group"
            onClick={() => handleRoleSelect('worker')}
          >
            <div className="relative rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-3xl cursor-pointer">
              <div className="bg-gradient-to-br from-white/85 to-green-50/75 p-6 md:p-8 rounded-xl border border-green-100 backdrop-blur-sm">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 text-center">I'm a Contractor</h2>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-center leading-relaxed">
                  I offer professional services and I'm looking for clients who need my skills.
                </p>
                <div className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 md:py-3 px-4 md:px-6 rounded-full font-medium transition-all duration-300 group-hover:shadow-lg text-center transform group-hover:-translate-y-1 text-sm md:text-base">
                  Find Work
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="mt-24 text-center">
          <p className="text-gray-600 text-lg font-medium">
            What describes you the most? Select the option that best matches your needs.
          </p>
        </div> */}
        
      </div>
      </div>
    </div>
  );
};

export default Landing;

// [#0a3815]