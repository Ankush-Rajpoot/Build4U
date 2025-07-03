import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import NotificationCenter from '../notifications/NotificationCenter';

const WorkerHeader = () => {
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
            <div className="flex-shrink-0 flex items-center">
              <span className="text-green-600 font-bold text-lg">ServiceConnect</span>
              {isConnected && (
                <div className="ml-2 flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="ml-1 text-xs text-gray-500">Online</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationCenter />
            
            <div className="relative">
              <button className="flex items-center space-x-1.5 border border-gray-300 rounded-full px-2.5 py-1 hover:bg-gray-50">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {user?.name || 'User'}
                </span>
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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