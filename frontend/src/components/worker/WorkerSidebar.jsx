import React from 'react';
import { 
  Briefcase, 
  ClipboardList, 
  CheckCircle,
  LayoutDashboard, 
  Settings, 
  HelpCircle,
  User,
  Search,
  Play,
  Archive
} from 'lucide-react';

const WorkerSidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { 
      id: 'available', 
      label: 'Available Jobs', 
      icon: <Search className="h-5 w-5" />,
      description: 'Find new opportunities',
      color: 'text-blue-600'
    },
    { 
      id: 'active', 
      label: 'Active Jobs', 
      icon: <Play className="h-5 w-5" />,
      description: 'Currently working on',
      color: 'text-orange-600'
    },
    { 
      id: 'completed', 
      label: 'Completed Jobs', 
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Successfully finished',
      color: 'text-green-600'
    },
    { 
      id: 'all-jobs', 
      label: 'All My Jobs', 
      icon: <Archive className="h-5 w-5" />,
      description: 'Complete job history',
      color: 'text-gray-600'
    },
    { 
      id: 'profile', 
      label: 'My Profile', 
      icon: <User className="h-5 w-5" />,
      description: 'Manage your profile',
      color: 'text-purple-600'
    },
  ];

  return (
    <div className="w-full md:w-48 bg-white shadow-sm border-r border-gray-200">
      <div className="p-3 md:p-4">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-full">
            <LayoutDashboard className="h-4 w-4 text-green-600" />
          </div>
          <div className="ml-2">
            <h2 className="text-sm font-semibold text-gray-900">Worker Portal</h2>
            <p className="text-xs text-gray-500">Manage jobs</p>
          </div>
        </div>

        <nav className="space-y-1 mb-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={`mr-2 ${activeTab === item.id ? 'text-green-600' : item.color}`}>
                {React.cloneElement(item.icon, { className: 'h-4 w-4' })}
              </span>
              <div className="flex-1 text-left">
                <div className="font-medium text-xs">{item.label}</div>
              </div>
              {activeTab === item.id && (
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              )}
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

export default WorkerSidebar;