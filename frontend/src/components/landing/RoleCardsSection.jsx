import React from "react";
import RoleCard from "./RoleCard";
import ArrowsAnimation from "./ArrowsAnimation";
import MobileArrow from "./MobileArrow";

const RoleCardsSection = ({ setSelectedRole }) => (
  <div className="flex flex-col md:flex-row items-center gap-8 landing-mobile-flex-col">
    <RoleCard
      title="Sign In as Client"
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
      title="Sign In as Contractor"
      description="Ready to showcase your skills and work on exciting projects."
      points={["Find & Apply for Jobs", "Build Your Portfolio", "Track Earnings & Reviews", "Manage Availability", "Grow Your Network"]}
      onClick={() => setSelectedRole("worker")}
    />
  </div>
);

export default RoleCardsSection;
