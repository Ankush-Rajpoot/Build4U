import api from './api';

export const messageService = {
  // Get messages for a service request
  getMessages: async (requestId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${requestId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  // Send a message with attachments
  sendMessageWithAttachments: async (messageData, files) => {
    // First upload files if any
    let attachments = [];
    if (files && files.length > 0) {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const uploadResponse = await api.post('/upload/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Transform uploaded URLs to attachment objects
      attachments = uploadResponse.data.urls.map((url, index) => ({
        filename: files[index].name,
        url: url,
        fileType: files[index].type,
        fileSize: files[index].size
      }));
    }

    // Send message with attachments
    const messageWithAttachments = {
      ...messageData,
      attachments
    };

    const response = await api.post('/messages', messageWithAttachments);
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (requestId) => {
    const response = await api.put(`/messages/${requestId}/read`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  }
};