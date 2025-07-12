import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  ClipboardList, 
  Clock, 
  CheckCircle,
  LayoutDashboard, 
  Settings, 
  HelpCircle,
  User,
  XCircle,
  Play
} from 'lucide-react';
import SettingsModal from '../shared/SettingsModal';

const ClientSidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, onMenuClose }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const navItems = [
    { 
      id: 'all', 
      label: 'All Requests', 
      icon: <ClipboardList className="h-5 w-5" />,
      description: 'View all requests'
    },
    { 
      id: 'pending', 
      label: 'Pending', 
      icon: <Clock className="h-5 w-5" />,
      description: 'Waiting for workers'
    },
    { 
      id: 'active', 
      label: 'Active Jobs', 
      icon: <Play className="h-5 w-5" />,
      description: 'Accepted & in progress'
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Finished jobs'
    },
    { 
      id: 'cancelled', 
      label: 'Cancelled', 
      icon: <XCircle className="h-5 w-5" />,
      description: 'Cancelled requests'
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onMenuClose) {
      onMenuClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onMenuClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Hidden on mobile unless menu is open, always visible on md+ */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 
        fixed md:relative 
        inset-y-0 left-0 
        z-50 md:z-auto
        w-64 md:w-48 
        bg-white dark:bg-dark-surface shadow-lg md:shadow-sm 
        border-r border-gray-200 dark:border-dark-border 
        transition-transform duration-300 ease-in-out
        md:transition-none
        overflow-y-auto
      `}>
        <div className="p-3 md:p-4 h-full flex flex-col">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <Home className="h-4 w-4 text-blue-600 dark:text-dark-primary" />
            </div>
            <div className="ml-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-text">Client Portal</h2>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Manage requests</p>
            </div>
          </div>

          <nav className="space-y-0.5 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center px-3 py-2.5 md:px-2 md:py-1.5 text-sm md:text-xs font-medium rounded-md transition-colors duration-200 group ${
                  activeTab === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-dark-primary border-r-2 border-blue-500 dark:border-dark-primary'
                    : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary hover:text-gray-900 dark:hover:text-dark-text'
                }`}
                onClick={() => handleTabClick(item.id)}
              >
                <span className="mr-3 md:mr-2">{React.cloneElement(item.icon, { className: 'h-5 w-5 md:h-4 md:w-4' })}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm md:text-xs">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-dark-text-secondary md:hidden">{item.description}</div>
                </div>
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-200 dark:border-dark-border space-y-0.5">
            <button
              className={`w-full flex items-center px-3 py-2.5 md:px-2 md:py-1.5 text-sm md:text-xs font-medium rounded-md transition-colors duration-200 group ${
                activeTab === 'profile'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-dark-primary border-r-2 border-blue-500 dark:border-dark-primary'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary hover:text-gray-900 dark:hover:text-dark-text'
              }`}
              onClick={() => handleTabClick('profile')}
            >
              <User className="mr-3 md:mr-2 h-5 w-5 md:h-4 md:w-4" />
              <span className="text-sm md:text-xs">My Profile</span>
            </button>
            <button 
              className="w-full flex items-center px-3 py-2.5 md:px-2 md:py-1.5 text-sm md:text-xs font-medium rounded-md text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary hover:text-gray-900 dark:hover:text-dark-text transition-colors duration-200"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="mr-3 md:mr-2 h-5 w-5 md:h-4 md:w-4" />
              <span className="text-sm md:text-xs">Settings</span>
            </button>
            <button className="w-full flex items-center px-3 py-2.5 md:px-2 md:py-1.5 text-sm md:text-xs font-medium rounded-md text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary hover:text-gray-900 dark:hover:text-dark-text transition-colors duration-200">
              <HelpCircle className="mr-3 md:mr-2 h-5 w-5 md:h-4 md:w-4" />
              <span className="text-sm md:text-xs">Help Center</span>
            </button>
          </div>
        </div>
      </div>
      
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </>
  );
};

export default ClientSidebar;