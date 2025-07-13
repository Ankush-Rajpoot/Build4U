import { useState, useCallback } from 'react';

export const useSplashScreen = () => {
  const [showSplash, setShowSplash] = useState(false);

  const triggerSplash = useCallback(() => {
    setShowSplash(true);
  }, []);

  const hideSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  return {
    showSplash,
    triggerSplash,
    hideSplash
  };
};
