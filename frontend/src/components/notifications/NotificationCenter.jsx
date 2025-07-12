import React, { useState } from 'react';
import { Bell, X, MessageSquare, Briefcase, CheckCircle, AlertCircle, Clock, XCircle, Play, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationSkeleton } from '../shared/skeletons';

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
    removeMessageNotification,
    loading
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
        className="relative p-1.5 sm:p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-primary transition-colors"
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium animate-pulse">
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
          <div className="absolute left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-0 sm:transform-none mt-2 w-72 xs:w-80 sm:w-80 md:w-96 bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-dark-border z-20 max-h-[70vh] sm:max-h-[500px] flex flex-col min-w-0 max-w-[calc(100vw-2rem)] mx-4 sm:mx-0">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-dark-text">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  All ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'messages'
                      ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  Messages ({unreadMessageCount})
                </button>
              </div>
              
              {/* Actions */}
              {displayNotifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {displayUnreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="p-3 space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <NotificationSkeleton key={index} />
                  ))}
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="font-medium text-sm">No notifications yet</p>
                  <p className="text-xs mt-1 px-2">
                    {activeTab === 'messages' 
                      ? "You'll see message notifications here" 
                      : "You'll see job updates and notifications here"
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {displayNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification, activeTab === 'messages')}
                      className={`p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className={`text-sm font-medium break-words ${
                                !notification.isRead ? 'text-gray-900 dark:text-dark-text' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 break-words">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatTime(notification.timestamp)}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleRemoveNotification(e, notification.id, activeTab === 'messages')}
                              className="ml-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all flex-shrink-0"
                            >
                              <Trash2 className="h-3 w-3 text-gray-400 dark:text-gray-500" />
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