import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Smile, Minimize2, Maximize2, MessageCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';
import { messageService } from '../../services/messageService';

const MessageCenter = ({ serviceRequest, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [fullServiceRequest, setFullServiceRequest] = useState(serviceRequest);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevServiceRequestRef = useRef(null);
  
  const { 
    socket, 
    joinRequestRoom, 
    leaveRequestRoom, 
    emitTyping 
  } = useSocket();

  const { isMinimized, minimizeChat, maximizeChat } = useChat();
  const { user, userRole } = useUser();

  const currentUserId = localStorage.getItem('userId');
  const currentUserRole = localStorage.getItem('userRole');
  
  // Determine recipient based on current user role
  const recipientId = currentUserRole === 'client' 
    ? fullServiceRequest.worker?._id 
    : fullServiceRequest.client?._id;

  const recipientName = currentUserRole === 'client'
    ? fullServiceRequest.worker?.name
    : fullServiceRequest.client?.name;

  // Close chat if user logs out
  useEffect(() => {
    if (!user || !userRole) {
      onClose();
    }
  }, [user, userRole, onClose]);

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle service request changes (switching chats)
  useEffect(() => {
    const currentRequestId = serviceRequest._id;
    const prevRequestId = prevServiceRequestRef.current;

    // If switching to a different chat
    if (prevRequestId && prevRequestId !== currentRequestId) {
      // Leave previous room
      leaveRequestRoom(prevRequestId);
      // Clear previous messages and state
      setMessages([]);
      setNewMessage('');
      setTypingUsers(new Set());
      setLoading(true);
    }

    // Join new room and fetch messages
    if (currentRequestId) {
      joinRequestRoom(currentRequestId);
      fetchMessages();
    }

    // Update ref for next comparison
    prevServiceRequestRef.current = currentRequestId;

    return () => {
      if (currentRequestId) {
        leaveRequestRoom(currentRequestId);
      }
    };
  }, [serviceRequest._id]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (messageData) => {
        if (messageData.serviceRequest === serviceRequest._id) {
          setMessages(prev => {
            const exists = prev.some(msg => msg._id === messageData._id);
            if (!exists) {
              return [...prev, messageData];
            }
            return prev;
          });
        }
      };

      const handleTyping = (data) => {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          if (data.isTyping && data.userId !== currentUserId) {
            updated.add(data.userName);
          } else {
            updated.delete(data.userName);
          }
          return updated;
        });

        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = new Set(prev);
            updated.delete(data.userName);
            return updated;
          });
        }, 3000);
      };

      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleTyping);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleTyping);
      };
    }
  }, [socket, currentUserId, serviceRequest._id]);

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [messages, isMinimized]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(serviceRequest._id);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !recipientId) {
      return;
    }

    try {
      setSending(true);
      
      const messageData = {
        serviceRequestId: serviceRequest._id,
        message: newMessage.trim(),
        recipientId
      };

      await messageService.sendMessage(messageData);
      
      setNewMessage('');
      emitTyping(serviceRequest._id, false);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTypingChange = (value) => {
    setNewMessage(value);
    
    emitTyping(serviceRequest._id, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(serviceRequest._id, false);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleMinimize = () => {
    if (isMinimized) {
      maximizeChat();
    } else {
      minimizeChat();
    }
  };

  // Fetch full service request if client/worker is missing
  useEffect(() => {
    const fetchFullRequest = async () => {
      if (!serviceRequest._id) {
        console.error('No serviceRequest._id provided to MessageCenter.');
        return;
      }
      if (!serviceRequest.client || !serviceRequest.worker) {
        try {
          const response = await import('../../services/serviceRequestService');
          const data = await response.serviceRequestService.getServiceRequest(serviceRequest._id);
          if (data && data.data) {
            setFullServiceRequest(data.data);
          }
        } catch (err) {
          console.error('Failed to fetch full service request:', err);
        }
      } else {
        setFullServiceRequest(serviceRequest);
      }
    };
    fetchFullRequest();
  }, [serviceRequest]);

  // Show user-friendly error if no serviceRequest._id
  if (!serviceRequest._id) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white p-6 rounded shadow text-red-600">
        Unable to open chat: Service request ID is missing.
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 sm:w-96 h-[500px]'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">
                {isMinimized ? 'Chat' : serviceRequest.title}
              </h3>
              {!isMinimized && (
                <p className="text-xs text-blue-100 truncate">
                  {recipientName || 'Unknown'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {Object.entries(messageGroups).map(([date, dateMessages]) => (
                    <div key={date}>
                      <div className="flex justify-center mb-2">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {date}
                        </span>
                      </div>
                      {dateMessages.map((message) => {
                        const isOwn = message.sender._id === currentUserId;
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                                isOwn
                                  ? 'bg-blue-500 text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              <p>{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-2xl rounded-bl-md">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs ml-2">
                            {Array.from(typingUsers)[0]} is typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-2">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-1.5">
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTypingChange(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={sending}
                  />
                  <button
                    type="button"
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Smile className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending || !recipientId}
                  className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              
              {!recipientId && (
                <div className="mt-1 text-xs text-red-500 text-center">
                  Unable to send messages - recipient not found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageCenter;