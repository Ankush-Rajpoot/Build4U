import React from 'react';
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
  Play,
  DollarSign,
  TrendingUp
} from 'lucide-react';

const ClientSidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, onMenuClose }) => {
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
    { 
      id: 'invoices', 
      label: 'Invoices', 
      icon: <DollarSign className="h-5 w-5" />,
      description: 'View & manage invoices'
    },
    { 
      id: 'financial-dashboard', 
      label: 'Financial Dashboard', 
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Financial insights'
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
        bg-white shadow-lg md:shadow-sm 
        border-r border-gray-200 
        transition-transform duration-300 ease-in-out
        md:transition-none
        overflow-y-auto
      `}>
        <div className="p-3 md:p-4 h-full flex flex-col">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Home className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-2">
              <h2 className="text-sm font-semibold text-gray-900">Client Portal</h2>
              <p className="text-xs text-gray-500">Manage requests</p>
            </div>
          </div>

          <nav className="space-y-0.5 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center px-3 py-2.5 md:px-2 md:py-1.5 text-sm md:text-xs font-medium rounded-md transition-colors duration-200 group ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => handleTabClick(item.id)}
              >
                <span className="mr-3 md:mr-2">{React.cloneElement(item.icon, { className: 'h-5 w-5 md:h-4 md:w-4' })}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm md:text-xs">{item.label}</div>
                  <div className="text-xs text-gray-500 md:hidden">{item.description}</div>
                </div>
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-200 space-y-0.5">
            <button
              className={`w-full flex items-center px-3 py-2.5 md:px-2 md:py-1.5 text-sm md:text-xs font-medium rounded-md transition-colors duration-200 group ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => handleTabClick('profile')}
            >
              <User className="mr-3 md:mr-2 h-5 w-5 md:h-4 md:w-4" />
              <span className="text-sm md:text-xs">My Profile</span>
            </button>
            <button className="w-full flex items-center px-3 py-2.5 md:px-2 md:py-1.5 text-sm md:text-xs font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <Settings className="mr-3 md:mr-2 h-5 w-5 md:h-4 md:w-4" />
              <span className="text-sm md:text-xs">Settings</span>
            </button>
            <button className="w-full flex items-center px-3 py-2.5 md:px-2 md:py-1.5 text-sm md:text-xs font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <HelpCircle className="mr-3 md:mr-2 h-5 w-5 md:h-4 md:w-4" />
              <span className="text-sm md:text-xs">Help Center</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientSidebar;