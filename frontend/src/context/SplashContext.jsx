import React, { createContext, useContext, useState } from 'react';

const SplashContext = createContext();

export const SplashProvider = ({ children }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [splashConfig, setSplashConfig] = useState({
    duration: 3000,
    onComplete: null
  });

  const triggerSplash = (config = {}) => {
    setSplashConfig({
      duration: config.duration || 3000,
      onComplete: config.onComplete || null
    });
    setShowSplash(true);
  };

  const hideSplash = () => {
    setShowSplash(false);
    if (splashConfig.onComplete) {
      splashConfig.onComplete();
    }
  };

  return (
    <SplashContext.Provider value={{
      showSplash,
      splashConfig,
      triggerSplash,
      hideSplash
    }}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
};
