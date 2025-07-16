import React from 'react';
import { 
  Plus, 
  FileText, 
  Receipt, 
  Download, 
  Calculator,
  Send,
  Eye,
  ArrowRight
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      id: 'create-invoice',
      title: 'Create Invoice',
      description: 'Generate a new invoice for completed work',
      icon: FileText,
      color: 'blue',
      action: () => {
        // Navigate to invoice creation
        console.log('Navigate to invoice creation');
      }
    },
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Record a new business expense',
      icon: Receipt,
      color: 'green',
      action: () => {
        // Navigate to expense creation
        console.log('Navigate to expense creation');
      }
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Access detailed financial reports',
      icon: Eye,
      color: 'purple',
      action: () => {
        // Navigate to reports
        console.log('Navigate to reports');
      }
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download financial data as CSV/PDF',
      icon: Download,
      color: 'gray',
      action: () => {
        // Trigger export
        console.log('Trigger export');
      }
    },
    {
      id: 'tax-calculator',
      title: 'Tax Calculator',
      description: 'Calculate taxes and estimates',
      icon: Calculator,
      color: 'yellow',
      action: () => {
        // Open tax calculator
        console.log('Open tax calculator');
      }
    },
    {
      id: 'send-reminder',
      title: 'Send Reminders',
      description: 'Send payment reminders to clients',
      icon: Send,
      color: 'red',
      action: () => {
        // Navigate to reminders
        console.log('Navigate to reminders');
      }
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50 hover:bg-blue-100',
        icon: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50 hover:bg-green-100',
        icon: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        icon: 'text-purple-600',
        border: 'border-purple-200'
      },
      gray: {
        bg: 'bg-gray-50 hover:bg-gray-100',
        icon: 'text-gray-600',
        border: 'border-gray-200'
      },
      yellow: {
        bg: 'bg-yellow-50 hover:bg-yellow-100',
        icon: 'text-yellow-600',
        border: 'border-yellow-200'
      },
      red: {
        bg: 'bg-red-50 hover:bg-red-100',
        icon: 'text-red-600',
        border: 'border-red-200'
      }
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Customize
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          const colors = getColorClasses(action.color);
          
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`group p-4 rounded-lg border transition-all duration-200 text-left ${colors.bg} ${colors.border} hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.icon} bg-white`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <ArrowRight className={`h-4 w-4 ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h4>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Additional Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-600">Pending Invoices</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">5</p>
            <p className="text-sm text-gray-600">Expenses to Review</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₹45,280</p>
            <p className="text-sm text-gray-600">This Month's Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">₹8,650</p>
            <p className="text-sm text-gray-600">Outstanding Payments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
