import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const MessageButton = ({ onClick, className = '', children, serviceRequestId }) => {
  const { messageNotifications } = useNotifications();
  
  // Count unread messages for this specific service request
  const unreadForThisRequest = serviceRequestId 
    ? messageNotifications.filter(notif => 
        !notif.isRead && notif.serviceRequestId === serviceRequestId
      ).length
    : 0;

  return (
    <button
      onClick={onClick}
      className={`relative ${className}`}
    >
      <div className="flex items-center">
        <MessageSquare className="h-4 w-4 mr-1" />
        {children}
      </div>
      {unreadForThisRequest > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
          {unreadForThisRequest > 99 ? '99+' : unreadForThisRequest}
        </span>
      )}
    </button>
  );
};

export default MessageButton;