import React from 'react';
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

const ClientSidebar = ({ activeTab, setActiveTab }) => {
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
      id: 'profile', 
      label: 'My Profile', 
      icon: <User className="h-5 w-5" />,
      description: 'Manage your profile'
    },
  ];

  return (
    <div className="w-full md:w-48 bg-white shadow-sm border-r border-gray-200">
      <div className="p-3 md:p-4">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Home className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-2">
            <h2 className="text-sm font-semibold text-gray-900">Client Portal</h2>
            <p className="text-xs text-gray-500">Manage requests</p>
          </div>
        </div>

        <nav className="space-y-0.5 mb-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 group ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="mr-2">{React.cloneElement(item.icon, { className: 'h-4 w-4' })}</span>
              <div className="flex-1 text-left">
                <div className="font-medium text-xs">{item.label}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="pt-3 border-t border-gray-200 space-y-0.5">
          <button className="w-full flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </button>
          <button className="w-full flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientSidebar;