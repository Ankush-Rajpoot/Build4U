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
    <div className="fixed inset-0 w-screen h-screen bg-[#000000] text-gray-300 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-6 md:mb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            <TypewriterCard />
            <GifArrow />
          </div>
          <IntroducingBadge />
        </div>
      </div>

      <RoleCardsSection setSelectedRole={setSelectedRole} />

      <p className="mt-12 text-gray-500 text-xs">
        Join thousands of professionals already using our platform
      </p>
    </div>
  );
};

export default Landing;