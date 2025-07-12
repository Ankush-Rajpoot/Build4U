import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Smile, Minimize2, Maximize2, MessageCircle, Download, Image, FileText } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';
import { messageService } from '../../services/messageService';

const MessageCenter = ({ serviceRequest, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewingImage, setViewingImage] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [fullServiceRequest, setFullServiceRequest] = useState(serviceRequest);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevServiceRequestRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
  
  // Color scheme based on user role
  const colorScheme = currentUserRole === 'client' 
    ? {
        primary: 'blue',
        headerBg: 'from-blue-500 to-blue-600',
        messageBg: 'bg-blue-500',
        messageText: 'text-blue-100',
        focusRing: 'focus:ring-blue-500',
        sendButton: 'bg-blue-500 hover:bg-blue-600',
        spinnerBorder: 'border-blue-500'
      }
    : {
        primary: 'green',
        headerBg: 'from-green-500 to-green-600', 
        messageBg: 'bg-green-500',
        messageText: 'text-green-100',
        focusRing: 'focus:ring-green-500',
        sendButton: 'bg-green-500 hover:bg-green-600',
        spinnerBorder: 'border-green-500'
      };
  
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
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending || !recipientId) {
      return;
    }

    try {
      setSending(true);
      setUploadProgress(0);
      
      const messageData = {
        serviceRequestId: serviceRequest._id,
        message: newMessage.trim(),
        recipientId
      };

      if (selectedFiles.length > 0) {
        // Send message with attachments
        await messageService.sendMessageWithAttachments(messageData, selectedFiles);
      } else {
        // Send text-only message
        await messageService.sendMessage(messageData);
      }
      
      setNewMessage('');
      setSelectedFiles([]);
      setUploadProgress(0);
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
      // Focus input when maximizing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 150);
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
      <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-6 rounded shadow text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
        Unable to open chat: Service request ID is missing.
      </div>
    );
  }

  // Focus management - keep input focused when chat is active
  useEffect(() => {
    if (!isMinimized && isVisible && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMinimized, isVisible, loading]);

  // Keep focus on input when messages change
  useEffect(() => {
    if (!isMinimized && !loading && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isMinimized, loading]);

  // File handling functions
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const isImageFile = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };

  const isPdfFile = (fileType) => {
    return fileType && fileType.includes('pdf');
  };

  const renderAttachment = (attachment, isOwn) => {
    if (isImageFile(attachment.fileType)) {
      return (
        <div className="mt-2">
          <img 
            src={attachment.url} 
            alt={attachment.filename}
            className="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setViewingImage(attachment)}
            loading="lazy"
          />
          <p className={`text-xs mt-1 ${isOwn ? 'text-white text-opacity-75' : 'text-gray-500'}`}>
            {attachment.filename}
          </p>
        </div>
      );
    } else if (isPdfFile(attachment.fileType)) {
      return (
        <div className="mt-2">
          <div 
            className="border border-opacity-20 rounded-lg p-3 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors"
            onClick={() => window.open(attachment.url, '_blank')}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {attachment.filename}
                </p>
                <p className={`text-xs ${isOwn ? 'text-white text-opacity-75' : 'text-gray-500'}`}>
                  PDF • {formatFileSize(attachment.fileSize)}
                </p>
              </div>
              <div className="text-xs font-medium">
                View
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-2">
          <div 
            className="border border-opacity-20 rounded-lg p-3 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors"
            onClick={() => {
              const link = document.createElement('a');
              link.href = attachment.url;
              link.download = attachment.filename;
              link.click();
            }}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {attachment.filename}
                </p>
                <p className={`text-xs ${isOwn ? 'text-white text-opacity-75' : 'text-gray-500'}`}>
                  {attachment.fileType?.split('/')[1]?.toUpperCase() || 'FILE'} • {formatFileSize(attachment.fileSize)}
                </p>
              </div>
              <Download className="h-4 w-4" />
            </div>
          </div>
        </div>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      <div className={`bg-white dark:bg-dark-surface rounded-lg shadow-2xl border border-gray-200 dark:border-dark-border transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 sm:w-96 h-[500px]'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-3 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r ${colorScheme.headerBg} text-white rounded-t-lg`}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">
                {isMinimized ? 'Chat' : serviceRequest.title}
              </h3>
              {!isMinimized && (
                <p className={`text-xs ${colorScheme.primary === 'blue' ? 'text-blue-100' : 'text-green-100'} truncate`}>
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
                  <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${colorScheme.spinnerBorder}`}></div>
                </div>
              ) : (
                <>
                  {Object.entries(messageGroups).map(([date, dateMessages]) => (
                    <div key={date}>
                      <div className="flex justify-center mb-2">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
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
                              className={`max-w-sm px-3 py-2 rounded-2xl text-sm ${
                                isOwn
                                  ? `${colorScheme.messageBg} text-white rounded-br-md`
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                              }`}
                            >
                              {message.message && <p className="break-words">{message.message}</p>}
                              
                              {/* Render attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className={`${message.message ? 'mt-2' : ''}`}>
                                  {message.attachments.map((attachment, attIndex) => (
                                    <div key={attIndex}>
                                      {renderAttachment(attachment, isOwn)}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? colorScheme.messageText : 'text-gray-500 dark:text-gray-400'
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
                      <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-2xl rounded-bl-md">
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
            <div className="border-t border-gray-200 dark:border-dark-border p-2">
              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-2 max-h-32 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 flex items-center space-x-2">
                        {isImageFile(file.type) ? (
                          <div className="relative">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded"
                              onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate dark:text-gray-200">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex items-center space-x-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
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
                    className={`w-full px-2.5 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 ${colorScheme.focusRing} focus:border-transparent text-sm caret-${colorScheme.primary}-600`}
                    disabled={sending}
                    ref={inputRef}
                    autoFocus
                    onBlur={(e) => {
                      // Re-focus if chat is not minimized and no other element is being focused
                      if (!isMinimized && document.activeElement !== e.target) {
                        setTimeout(() => {
                          if (inputRef.current && !isMinimized) {
                            inputRef.current.focus();
                          }
                        }, 100);
                      }
                    }}
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
                  disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || !recipientId}
                  className={`p-1.5 ${colorScheme.sendButton} text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {sending ? (
                    <div className={`animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white`}></div>
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </form>
              
              {/* Upload progress */}
              {sending && selectedFiles.length > 0 && (
                <div className="mt-1 text-xs text-gray-500 text-center">
                  Uploading files...
                </div>
              )}
              
              {!recipientId && (
                <div className="mt-1 text-xs text-red-500 text-center">
                  Unable to send messages - recipient not found
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={viewingImage.url} 
              alt={viewingImage.filename}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-sm bg-black bg-opacity-50 rounded px-3 py-1 inline-block">
                {viewingImage.filename}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;