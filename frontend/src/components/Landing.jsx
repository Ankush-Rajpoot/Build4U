import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingScreenSkeleton } from "./shared/skeletons";
import AuthForm from "./auth/AuthForm.jsx";
import TypewriterCard from "./landing/TypewriterCard";
import GifArrow from "./landing/GifArrow";
import IntroducingBadge from "./landing/IntroducingBadge";
import RoleCardsSection from "./landing/RoleCardsSection";
import { useUser } from "../context/UserContext";
import "./landing/Landing.css";

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
    <div className="fixed inset-0 w-screen h-screen text-gray-300 flex flex-col items-center justify-center px-4 pt-8 sm:pt-0 overflow-hidden" style={{
      background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(59,130,246,0.10) 0%, rgba(16,185,129,0.08) 40%, rgba(0,0,0,0.95) 80%)',
    }}>
      {/* Floating Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'float-grid 20s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            animation: 'float-grid-reverse 25s ease-in-out infinite'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center mb-6 md:mb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            <TypewriterCard />
            <GifArrow />
          </div>
          <IntroducingBadge />
        </div>
      </div>

      <div className="relative z-10">
        <RoleCardsSection setSelectedRole={setSelectedRole} />
      </div>

      <p className="relative z-10 mt-12 text-gray-500 text-xs">
        Join thousands of professionals already using our platform
      </p>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-grid {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -5px) rotate(0.5deg);
          }
          50% {
            transform: translate(-5px, 10px) rotate(-0.3deg);
          }
          75% {
            transform: translate(8px, 5px) rotate(0.2deg);
          }
        }

        @keyframes float-grid-reverse {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(-8px, 7px) rotate(-0.4deg);
          }
          50% {
            transform: translate(12px, -3px) rotate(0.6deg);
          }
          75% {
            transform: translate(-6px, -8px) rotate(-0.2deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;