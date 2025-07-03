import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      const storedUserRole = localStorage.getItem('userRole');
      const storedUser = localStorage.getItem('user');

      if (token && storedUserRole && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUserRole(storedUserRole);
          setUser(userData);
          
          // Store user ID for messaging
          localStorage.setItem('userId', userData._id);
          
          // Verify token is still valid by fetching profile
          if (storedUserRole === 'client') {
            await authService.getClientProfile();
          } else if (storedUserRole === 'worker') {
            await authService.getWorkerProfile();
          }
        } catch (error) {
          // Token is invalid, clear storage
          logout();
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  const login = (userData, token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', userData._id);
    setUser(userData);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setUser(null);
    setUserRole(null);
    
    // Dispatch custom event to notify other components about logout
    window.dispatchEvent(new CustomEvent('userLogout'));
  };

  const updateUser = (updatedUserData) => {
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    localStorage.setItem('userId', updatedUserData._id);
    setUser(updatedUserData);
  };

  return (
    <UserContext.Provider value={{ 
      userRole, 
      user, 
      loading,
      login, 
      logout, 
      updateUser,
      setUserRole // Keep for backward compatibility
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};