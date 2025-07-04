import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import NotificationCenter from '../notifications/NotificationCenter';

const WorkerHeader = ({ onMenuToggle, isMobileMenuOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { isConnected } = useSocket();
  const { openChat } = useChat ? useChat() : { openChat: () => {} };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-12">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 mr-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex-shrink-0 flex items-center">
              <span className="text-green-600 font-bold text-lg sm:text-xl">ServiceConnect</span>
              {isConnected && (
                <div className="ml-2 flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="ml-1 text-xs text-gray-500 hidden sm:inline">Online</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <NotificationCenter />
            
            <div className="relative">
              <button className="flex items-center space-x-1.5 border border-gray-300 rounded-full px-2 sm:px-2.5 py-1 hover:bg-gray-50 transition-colors duration-200">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 hidden sm:inline">
                  {user?.name || 'User'}
                </span>
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-1 sm:ml-2 px-2 sm:px-3 py-1.5 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkerHeader;