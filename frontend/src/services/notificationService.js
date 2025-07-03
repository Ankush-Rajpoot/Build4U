import api from './api';

export const notificationService = {
  // Get user notifications
  getNotifications: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark multiple notifications as read
  markMultipleAsRead: async (notificationIds = []) => {
    const response = await api.put('/notifications/mark-read', {
      notificationIds
    });
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Delete multiple notifications
  deleteMultipleNotifications: async (notificationIds = []) => {
    const response = await api.delete('/notifications', {
      data: { notificationIds }
    });
    return response.data;
  },

  // Create notification (admin/system use)
  createNotification: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  }
};