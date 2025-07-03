import React, { createContext, useContext, useState, useEffect } from 'react';
import { serviceRequestService } from '../services/serviceRequestService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Helper to ensure full service request object
  const ensureFullServiceRequest = async (serviceRequest) => {
    if (!serviceRequest) return null;
    // If already has client and worker, return as is
    if (serviceRequest.client && serviceRequest.worker) return serviceRequest;
    // If only an ID is provided, fetch full details
    const id = serviceRequest._id || serviceRequest.id || serviceRequest;
    if (id) {
      try {
        const data = await serviceRequestService.getServiceRequest(id);
        return data.data || serviceRequest;
      } catch (err) {
        console.error('Failed to fetch full service request in ChatContext:', err);
        return serviceRequest;
      }
    }
    return serviceRequest;
  };

  // Listen for logout events to close chat
  useEffect(() => {
    const handleLogout = () => {
      setActiveChat(null);
      setIsMinimized(false);
    };

    // Listen for custom logout event
    window.addEventListener('userLogout', handleLogout);

    return () => {
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  const openChat = async (serviceRequest) => {
    if (!serviceRequest || !(serviceRequest._id || serviceRequest.id)) {
      console.warn('Attempted to open chat with missing or invalid serviceRequest:', serviceRequest);
      // Optionally, show a toast/alert here
      return;
    }
    const fullRequest = await ensureFullServiceRequest(serviceRequest);
    setActiveChat(fullRequest);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setActiveChat(null);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
  };

  const value = {
    activeChat,
    isMinimized,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};