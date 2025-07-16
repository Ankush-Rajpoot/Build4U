import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user, userRole } = useUser();

  useEffect(() => {
    if (user && userRole) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found for socket connection');
        return;
      }

      // console.log('Connecting to socket with user:', user.name, 'role:', userRole);
      
      // const newSocket = io('https://serviceconnectalpha.onrender.com', {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        // console.log('Connected to server with socket ID:', newSocket.id);
        setIsConnected(true);
        localStorage.setItem('userId', user._id);
        // Join user room for notifications
        newSocket.emit('join_user_room', user._id);
        // console.log('Emitted join_user_room for notifications:', user._id);
      });

      newSocket.on('disconnect', (reason) => {
        // console.log('Disconnected from server. Reason:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        setIsConnected(false);
      });

      // Handle user online/offline status
      newSocket.on('user_online', (data) => {
        // console.log('User came online:', data.userName);
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });

      newSocket.on('user_offline', (data) => {
        // console.log('User went offline:', data.userName);
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          return updated;
        });
      });

      setSocket(newSocket);

      return () => {
        // console.log('Cleaning up socket connection');
        newSocket.close();
      };
    } else {
      // User logged out, clean up socket and state
      if (socket) {
        // console.log('User logged out, closing socket');
        socket.close();
        setSocket(null);
      }
      setIsConnected(false);
      setOnlineUsers(new Set());
    }
  }, [user, userRole]);

  // Listen for logout events to clean up socket state
  useEffect(() => {
    const handleLogout = () => {
      // console.log('Logout event received, cleaning up socket');
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setIsConnected(false);
      setOnlineUsers(new Set());
    };

    window.addEventListener('userLogout', handleLogout);

    return () => {
      window.removeEventListener('userLogout', handleLogout);
    };
  }, [socket]);

  const getStatusUpdateTitle = (status) => {
    switch (status) {
      case 'accepted': return 'Job Accepted';
      case 'in-progress': return 'Work Started';
      case 'completed': return 'Job Completed';
      case 'cancelled': return 'Job Cancelled';
      default: return 'Status Updated';
    }
  };

  const joinRequestRoom = (requestId) => {
    if (socket && isConnected) {
      socket.emit('join_request_room', requestId);
      // console.log('Joined request room:', requestId);
    }
  };

  const leaveRequestRoom = (requestId) => {
    if (socket && isConnected) {
      socket.emit('leave_request_room', requestId);
      // console.log('Left request room:', requestId);
    }
  };

  const sendMessage = (requestId, message, recipientId) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        requestId,
        message,
        recipientId
      });
      // console.log('Sent message via socket:', { requestId, message: message.substring(0, 20) + '...' });
    }
  };

  const emitTyping = (requestId, isTyping) => {
    if (socket && isConnected) {
      if (isTyping) {
        socket.emit('typing_start', { requestId });
      } else {
        socket.emit('typing_stop', { requestId });
      }
    }
  };

  const emitStatusUpdate = (requestId, status, clientId, workerId) => {
    if (socket && isConnected) {
      socket.emit('request_status_update', {
        requestId,
        status,
        clientId,
        workerId
      });
      // console.log('Emitted status update:', { requestId, status });
    }
  };

  const emitNewServiceRequest = (requestData) => {
    if (socket && isConnected) {
      socket.emit('new_service_request', requestData);
      // console.log('Emitted new service request:', requestData);
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinRequestRoom,
    leaveRequestRoom,
    sendMessage,
    emitTyping,
    emitStatusUpdate,
    emitNewServiceRequest
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};