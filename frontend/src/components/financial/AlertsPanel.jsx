import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const AlertsPanel = ({ alerts = [] }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity) => {
    if (severity >= 8) return 'bg-red-500';
    if (severity >= 6) return 'bg-yellow-500';
    if (severity >= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffInMinutes = Math.floor((now - alertDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <p className="text-gray-500">All systems running smoothly!</p>
          <p className="text-sm text-gray-400 mt-2">
            No financial alerts at the moment.
          </p>
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
  const warningAlerts = alerts.filter(alert => alert.type === 'warning');
  const infoAlerts = alerts.filter(alert => alert.type === 'info');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Financial Alerts</h3>
        </div>
        <div className="flex items-center space-x-2">
          {criticalAlerts.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {criticalAlerts.length} Critical
            </span>
          )}
          {warningAlerts.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              {warningAlerts.length} Warning
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert, index) => {
          const IconComponent = getAlertIcon(alert.type);
          
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`p-1 rounded mr-3 ${getIconColor(alert.type)}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-semibold capitalize">
                        {alert.category?.replace('_', ' ') || 'General'}
                      </p>
                      {alert.severity && (
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`}
                            title={`Severity: ${alert.severity}/10`}
                          />
                          <span className="text-xs text-gray-500 ml-1">
                            {alert.severity}/10
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(alert.createdAt)}
                      </div>
                      
                      {alert.actionRequired && (
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-gray-600 ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all {alerts.length} alerts
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-red-600">{criticalAlerts.length}</p>
            <p className="text-xs text-gray-500">Critical</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-600">{warningAlerts.length}</p>
            <p className="text-xs text-gray-500">Warning</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">{infoAlerts.length}</p>
            <p className="text-xs text-gray-500">Info</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;
