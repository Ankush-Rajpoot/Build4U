import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Option as Motion, Syringe as Spring } from 'lucide-react';
import { useUser } from '../context/UserContext';
import AuthForm from './auth/AuthForm';


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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
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
    // <div className="min-h-screen bg-gradient-to-b from-black to-[#000212]">
    // <div className="min-h-screen bg-gradient-to-b from-[#000212] to-black">
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
     {/* <div className="min-h-screen bg-gradient-to-b from-black to-gray-950"> */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .animate-blink {
            animation: blink 1s steps(1) infinite;
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          {/* <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-500 mb-6">
              SERVICE CONNECT
          </h1> */}
          <div className="h-12 flex items-center justify-center">
            <TypewriterText
              text="Connecting skilled professionals with clients seeking quality services"
              speed={40}
              delay={500}
              pauseDuration={3000}
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 max-w-6xl mx-auto">
          <div 
            className="w-full md:w-1/2 max-w-md group"
            onClick={() => handleRoleSelect('client')}
          >
            <div className="relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer">
              {/* Top gradient border - covers half width */}
              <div className="absolute top-0 left-0 h-[2px] w-1/2 bg-gradient-to-r from-blue-700 to-transparent z-10"></div>
              {/* Left gradient border - covers half height */}
              <div className="absolute top-0 left-0 w-[2px] h-1/2 bg-gradient-to-b from-blue-700 to-transparent z-10"></div>
              {/* Corner gradient to connect top and left borders */}
              <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-gradient-to-br from-blue-700 via-blue-700 to-transparent z-20 rounded-tl-xl"></div>
              
              <div className="p-8 bg-gradient-to-b from-black to-[#1A1C3E] rounded-xl">
                <h2 className="text-2xl font-bold text-gray-400 mb-4">I'm a Client</h2>
                <p className="text-gray-300 mb-6">
                  I'm looking for skilled professionals to help with my projects and services.
                </p>
                <div className="bg-blue-100 text-blue-800 py-2 px-4 rounded-full inline-block font-medium transition-all duration-300 group-hover:bg-blue-200">
                  Find Services
                </div>
              </div>
            </div>
          </div>

          <div 
            className="w-full md:w-1/2 max-w-md group"
            onClick={() => handleRoleSelect('worker')}
          >
            <div className="relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer">
              {/* Top gradient border - covers half width */}
              <div className="absolute top-0 left-0 h-[2px] w-1/2 bg-gradient-to-r from-green-700 to-transparent z-10"></div>
              {/* Left gradient border - covers half height */}
              <div className="absolute top-0 left-0 w-[2px] h-1/2 bg-gradient-to-b from-green-700 to-transparent z-10"></div>
              {/* Corner gradient to connect top and left borders */}
              <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-gradient-to-br from-green-700 via-green-700 to-transparent z-20 rounded-tl-xl"></div>
              
              <div className="p-8 bg-gradient-to-b from-black to-[#051F20] rounded-xl">
                <h2 className="text-2xl font-bold text-gray-400 mb-4">I'm a Worker</h2>
                <p className="text-gray-300 mb-6">
                  I offer professional services and I'm looking for clients who need my skills.
                </p>
                <div className="bg-green-100 text-green-800 py-2 px-4 rounded-full inline-block font-medium transition-all duration-300 group-hover:bg-green-200">
                  Find Work
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <p className="text-gray-500">
            What describes you the most? Select the option that best matches your needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;

// [#0a3815]