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