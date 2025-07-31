import React, { useEffect, useState } from "react";

const TypewriterText = ({ text, speed = 50, delay = 1000, pauseDuration = 2000, className = "" }) => {
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
    <span
      className={`typewriter-gradient-text ${className}`}
      style={{
        background: 'linear-gradient(90deg, #fff, #d1d5db)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
        display: 'inline-block',
      }}
    >
      {displayText}
      {isTyping && (
        <span className="ml-1 text-gray-900 animate-blink cursor-glow" style={{WebkitTextFillColor: '#d1d5db', color: '#d1d5db'}}>|</span>
      )}
    </span>
  );
};

export default TypewriterText;
