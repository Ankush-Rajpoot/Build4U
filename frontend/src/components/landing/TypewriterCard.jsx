import React from "react";
import TypewriterText from "../TypewriterText";
import "./TypewriterCard.css";

const TypewriterCard = () => (
  <div className="typewriter-border-container mb-6 hidden sm:block" style={{ marginBottom: '2.5rem' }}>
    <div className="typewriter-border"></div>
    <div 
      className="enhanced-card p-4 rounded-lg flex items-center justify-center" 
      style={{ 
        position: 'relative', 
        zIndex: 2, 
        width: '100%', 
        overflow: 'visible', 
        borderRadius: '40px' 
      }}
    >
      <TypewriterText
        text="Connecting skilled professionals with clients seeking quality services"
        speed={40}
        delay={500}
        pauseDuration={3000}
        className="text-base mx-auto leading-relaxed font-medium px-2 whitespace-nowrap"
      />
    </div>
  </div>
);

export default TypewriterCard;