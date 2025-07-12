import { useState, useEffect } from 'react';

/**
 * Custom hook for managing skeleton loading states with optional delays
 * @param {boolean} isLoading - External loading state
 * @param {number} minDelay - Minimum delay in milliseconds to show skeleton
 * @param {number} maxDelay - Maximum delay in milliseconds before forcing hide
 * @returns {object} - Loading state and controls
 */
export const useSkeletonLoader = (isLoading = false, minDelay = 300, maxDelay = 10000) => {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [hasMinDelayPassed, setHasMinDelayPassed] = useState(false);

  useEffect(() => {
    let minDelayTimer;
    let maxDelayTimer;

    if (isLoading) {
      setShowSkeleton(true);
      setHasMinDelayPassed(false);
      
      // Set minimum delay timer
      minDelayTimer = setTimeout(() => {
        setHasMinDelayPassed(true);
      }, minDelay);
      
      // Set maximum delay timer
      maxDelayTimer = setTimeout(() => {
        setShowSkeleton(false);
        setHasMinDelayPassed(true);
      }, maxDelay);
    } else {
      // Only hide skeleton if minimum delay has passed
      if (hasMinDelayPassed) {
        setShowSkeleton(false);
      } else {
        // Wait for minimum delay before hiding
        minDelayTimer = setTimeout(() => {
          setShowSkeleton(false);
          setHasMinDelayPassed(true);
        }, minDelay);
      }
    }

    return () => {
      if (minDelayTimer) clearTimeout(minDelayTimer);
      if (maxDelayTimer) clearTimeout(maxDelayTimer);
    };
  }, [isLoading, minDelay, maxDelay, hasMinDelayPassed]);

  return {
    showSkeleton,
    isLoading,
    hasMinDelayPassed
  };
};

/**
 * Hook for managing multiple skeleton states
 * @param {object} loadingStates - Object with multiple loading states
 * @param {number} minDelay - Minimum delay for all skeletons
 * @returns {object} - Object with skeleton states for each loading state
 */
export const useMultipleSkeletons = (loadingStates = {}, minDelay = 300) => {
  const [skeletonStates, setSkeletonStates] = useState({});

  useEffect(() => {
    const newStates = {};
    
    Object.entries(loadingStates).forEach(([key, isLoading]) => {
      const { showSkeleton } = useSkeletonLoader(isLoading, minDelay);
      newStates[key] = showSkeleton;
    });
    
    setSkeletonStates(newStates);
  }, [loadingStates, minDelay]);

  return skeletonStates;
};

/**
 * Hook for sequential skeleton loading (useful for dashboard components)
 * @param {array} loadingSequence - Array of loading states in order
 * @param {number} staggerDelay - Delay between each skeleton appearance
 * @returns {array} - Array of boolean states for each skeleton
 */
export const useSequentialSkeletons = (loadingSequence = [], staggerDelay = 200) => {
  const [visibleSkeletons, setVisibleSkeletons] = useState([]);

  useEffect(() => {
    const timers = [];
    setVisibleSkeletons([]);

    loadingSequence.forEach((isLoading, index) => {
      if (isLoading) {
        const timer = setTimeout(() => {
          setVisibleSkeletons(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * staggerDelay);
        
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [loadingSequence, staggerDelay]);

  return visibleSkeletons;
};

/**
 * Hook for managing skeleton states with retry functionality
 * @param {function} fetchFunction - Function to fetch data
 * @param {array} dependencies - Dependencies for the fetch function
 * @param {number} retryCount - Number of retries before giving up
 * @returns {object} - Loading state, data, error, and retry function
 */
export const useSkeletonWithRetry = (fetchFunction, dependencies = [], retryCount = 3) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(0);

  const { showSkeleton } = useSkeletonLoader(loading);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err);
      if (retries < retryCount) {
        setTimeout(() => {
          setRetries(prev => prev + 1);
          fetchData();
        }, 1000 * (retries + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const retry = () => {
    setRetries(0);
    fetchData();
  };

  return {
    loading,
    showSkeleton,
    data,
    error,
    retry,
    retries
  };
};

export default {
  useSkeletonLoader,
  useMultipleSkeletons,
  useSequentialSkeletons,
  useSkeletonWithRetry
};
