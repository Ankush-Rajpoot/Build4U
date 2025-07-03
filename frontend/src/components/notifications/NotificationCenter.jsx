import React, { useState } from 'react';
import { Bell, X, MessageSquare, Briefcase, CheckCircle, AlertCircle, Clock, XCircle, Play, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'messages'
  
  const { 
    notifications, 
    unreadCount, 
    messageNotifications,
    unreadMessageCount,
    markNotificationAsRead, 
    markMessageNotificationAsRead,
    markAllNotificationsAsRead,
    markAllMessageNotificationsAsRead,
    clearAllNotifications,
    clearAllMessageNotifications,
    removeNotification,
    removeMessageNotification
  } = useNotifications();

  const totalUnreadCount = unreadCount + unreadMessageCount;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'new_job':
        return <Briefcase className="h-5 w-5 text-green-500" />;
      case 'job_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'job_started':
        return <Play className="h-5 w-5 text-blue-500" />;
      case 'job_completed':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      case 'job_cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'status_update':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification, isMessage = false) => {
    if (!notification.isRead) {
      if (isMessage) {
        markMessageNotificationAsRead(notification.id);
      } else {
        markNotificationAsRead(notification.id);
      }
    }
    // Handle navigation based on notification type
    // This could be expanded to navigate to specific pages
  };

  const handleMarkAllAsRead = () => {
    if (activeTab === 'messages') {
      markAllMessageNotificationsAsRead();
    } else {
      markAllNotificationsAsRead();
      markAllMessageNotificationsAsRead();
    }
  };

  const handleClearAll = () => {
    if (activeTab === 'messages') {
      clearAllMessageNotifications();
    } else {
      clearAllNotifications();
      clearAllMessageNotifications();
    }
  };

  const handleRemoveNotification = (e, notificationId, isMessage = false) => {
    e.stopPropagation();
    if (isMessage) {
      removeMessageNotification(notificationId);
    } else {
      removeNotification(notificationId);
    }
  };

  const displayNotifications = activeTab === 'messages' ? messageNotifications : notifications;
  const displayUnreadCount = activeTab === 'messages' ? unreadMessageCount : unreadCount;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium animate-pulse">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'messages'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Messages ({unreadMessageCount})
                </button>
              </div>
              
              {/* Actions */}
              {displayNotifications.length > 0 && (
                <div className="flex space-x-2 mt-2">
                  {displayUnreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {displayNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium text-sm">No notifications yet</p>
                  <p className="text-xs mt-1">
                    {activeTab === 'messages' 
                      ? "You'll see message notifications here" 
                      : "You'll see job updates and notifications here"
                    }
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    If you expect notifications but see none, check browser console for [SOCKET DEBUG] logs.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification, activeTab === 'messages')}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-400">
                                  {formatTime(notification.timestamp)}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleRemoveNotification(e, notification.id, activeTab === 'messages')}
                              className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-all"
                            >
                              <Trash2 className="h-3 w-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;