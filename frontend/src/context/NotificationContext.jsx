import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';
import { useChat } from './ChatContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  const { socket, isConnected } = useSocket();
  const { user, userRole } = useUser();
  const { activeChat } = useChat ? useChat() : { activeChat: null };

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedNotifications = localStorage.getItem(`notifications_${user._id}`);
      const savedMessageNotifications = localStorage.getItem(`messageNotifications_${user._id}`);
      
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(parsed);
          setUnreadCount(parsed.filter(n => !n.isRead).length);
        } catch (error) {
          console.error('Error parsing saved notifications:', error);
        }
      }
      
      if (savedMessageNotifications) {
        try {
          const parsed = JSON.parse(savedMessageNotifications);
          setMessageNotifications(parsed);
          setUnreadMessageCount(parsed.filter(n => !n.isRead).length);
        } catch (error) {
          console.error('Error parsing saved message notifications:', error);
        }
      }
    }
  }, [user]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user && notifications.length >= 0) {
      localStorage.setItem(`notifications_${user._id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  useEffect(() => {
    if (user && messageNotifications.length >= 0) {
      localStorage.setItem(`messageNotifications_${user._id}`, JSON.stringify(messageNotifications));
    }
  }, [messageNotifications, user]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        // console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (socket && isConnected && user) {
      // console.log('Setting up notification listeners for user:', user.name);

      // Debug: Listen for all events
      const debugHandler = (event, ...args) => {
        if (!['user_typing', 'typing_start', 'typing_stop'].includes(event)) {
          // console.log(`[SOCKET DEBUG] Event received: ${event}`, args);
        }
      };
      socket.onAny(debugHandler);

      // General notifications (job status changes, etc.)
      const handleNotification = (notification) => {
        // console.log('NotificationContext received notification:', notification); // <-- DEBUG LOG
        
        const newNotification = {
          ...notification,
          id: Date.now() + Math.random(),
          isRead: false,
          timestamp: notification.timestamp || new Date()
        };
        
        setNotifications(prev => {
          const updated = [newNotification, ...prev].slice(0, 100);
          // console.log('Updated notifications count:', updated.length);
          return updated;
        });
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification
        showBrowserNotification(newNotification.title, newNotification.message);
        
        // Play notification sound
        playNotificationSound();
      };

      // Message notifications
      const handleMessageNotification = (data) => {
        // console.log('NotificationContext received message notification:', data); // <-- DEBUG LOG
        
        const messageNotification = {
          id: Date.now() + Math.random(),
          type: 'message',
          title: `New message from ${data.senderName}`,
          message: data.message,
          timestamp: data.timestamp || new Date(),
          serviceRequestId: data.serviceRequestId,
          senderId: data.senderId,
          senderName: data.senderName,
          isRead: false
        };
        
        setMessageNotifications(prev => {
          const updated = [messageNotification, ...prev].slice(0, 50);
          // console.log('Updated message notifications count:', updated.length);
          return updated;
        });
        setUnreadMessageCount(prev => prev + 1);
        
        // Show browser notification
        showBrowserNotification(messageNotification.title, messageNotification.message);
        
        // Play message sound
        playMessageSound();
      };

      // New job notifications for workers
      const handleNewJobAvailable = (data) => {
        // Fallback: get userRole from context or localStorage
        const role = userRole || localStorage.getItem('userRole');
        // console.log('NotificationContext handleNewJobAvailable, userRole:', role, 'data:', data);

        if (role === 'worker') {
          const jobNotification = {
            id: Date.now() + Math.random(),
            type: 'new_job',
            title: 'New Job Available',
            message: `${data.title} - Budget: ₹${data.budget}`,
            timestamp: data.timestamp || new Date(),
            serviceRequestId: data.requestId,
            isRead: false
          };

          setNotifications(prev => {
            const updated = [jobNotification, ...prev].slice(0, 100);
            // console.log('Updated notifications with new job:', updated.length);
            return updated;
          });
          setUnreadCount(prev => prev + 1);

          showBrowserNotification(jobNotification.title, jobNotification.message);
          playNotificationSound();
        } else {
          // console.log('Not a worker, ignoring new_job_available event');
        }
      };

      // Status update notifications
      const handleStatusUpdate = (data) => {
        // console.log('NotificationContext received status update:', data);
        
        const statusNotification = {
          id: Date.now() + Math.random(),
          type: 'status_update',
          title: getStatusUpdateTitle(data.status),
          message: `Job "${data.requestTitle || 'Unknown'}" status updated to: ${data.status}`,
          timestamp: data.timestamp || new Date(),
          serviceRequestId: data.requestId,
          isRead: false
        };
        
        setNotifications(prev => {
          const updated = [statusNotification, ...prev].slice(0, 100);
          // console.log('Updated notifications with status update:', updated.length);
          return updated;
        });
        setUnreadCount(prev => prev + 1);
        
        showBrowserNotification(statusNotification.title, statusNotification.message);
        playNotificationSound();
      };

      socket.on('notification', handleNotification);
      socket.on('message_notification', handleMessageNotification);
      socket.on('new_job_available', handleNewJobAvailable);
      socket.on('status_updated', handleStatusUpdate);

      return () => {
        // console.log('Cleaning up notification listeners');
        socket.off('notification', handleNotification);
        socket.off('message_notification', handleMessageNotification);
        socket.off('new_job_available', handleNewJobAvailable);
        socket.off('status_updated', handleStatusUpdate);
        socket.offAny(debugHandler);
      };
    }
  }, [socket, isConnected, user, userRole]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (activeChat && messageNotifications.length > 0) {
      const unreadIds = messageNotifications
        .filter(n => !n.isRead && n.serviceRequestId === activeChat._id)
        .map(n => n.id);
      if (unreadIds.length > 0) {
        unreadIds.forEach(id => markMessageNotificationAsRead(id));
      }
    }
  }, [activeChat, messageNotifications]);

  // Clear notifications on logout
  useEffect(() => {
    const handleLogout = () => {
      // console.log('Clearing notifications on logout');
      setNotifications([]);
      setUnreadCount(0);
      setMessageNotifications([]);
      setUnreadMessageCount(0);
      
      // Clear from localStorage
      if (user) {
        localStorage.removeItem(`notifications_${user._id}`);
        localStorage.removeItem(`messageNotifications_${user._id}`);
      }
    };

    window.addEventListener('userLogout', handleLogout);
    return () => window.removeEventListener('userLogout', handleLogout);
  }, [user]);

  const getStatusUpdateTitle = (status) => {
    switch (status) {
      case 'accepted': return 'Job Accepted';
      case 'in-progress': return 'Work Started';
      case 'completed': return 'Job Completed';
      case 'cancelled': return 'Job Cancelled';
      default: return 'Status Updated';
    }
  };

  const showBrowserNotification = (title, message) => {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
    }
  };

  const playNotificationSound = () => {
    try {
      // Create a subtle notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const playMessageSound = () => {
    try {
      // Create a different sound for messages
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.error('Error playing message sound:', error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markMessageNotificationAsRead = (notificationId) => {
    setMessageNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadMessageCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setUnreadCount(0);
  };

  const markAllMessageNotificationsAsRead = () => {
    setMessageNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setUnreadMessageCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    if (user) {
      localStorage.removeItem(`notifications_${user._id}`);
    }
  };

  const clearAllMessageNotifications = () => {
    setMessageNotifications([]);
    setUnreadMessageCount(0);
    if (user) {
      localStorage.removeItem(`messageNotifications_${user._id}`);
    }
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter(notif => notif.id !== notificationId);
      const wasUnread = prev.find(notif => notif.id === notificationId && !notif.isRead);
      if (wasUnread) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return updated;
    });
  };

  const removeMessageNotification = (notificationId) => {
    setMessageNotifications(prev => {
      const updated = prev.filter(notif => notif.id !== notificationId);
      const wasUnread = prev.find(notif => notif.id === notificationId && !notif.isRead);
      if (wasUnread) {
        setUnreadMessageCount(count => Math.max(0, count - 1));
      }
      return updated;
    });
  };

  const value = {
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
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};