import api from './api';

export const authService = {
  // Client authentication
  registerClient: async (userData) => {
    const response = await api.post('/clients/register', userData);
    return response.data;
  },

  loginClient: async (credentials) => {
    const response = await api.post('/clients/login', credentials);
    return response.data;
  },

  // Worker authentication
  registerWorker: async (userData) => {
    const response = await api.post('/workers/register', userData);
    return response.data;
  },

  loginWorker: async (credentials) => {
    const response = await api.post('/workers/login', credentials);
    return response.data;
  },

  // Profile management
  getClientProfile: async () => {
    const response = await api.get('/clients/profile');
    return response.data;
  },

  getWorkerProfile: async () => {
    const response = await api.get('/workers/profile');
    return response.data;
  },

  updateClientProfile: async (profileData) => {
    const response = await api.put('/clients/profile', profileData);
    return response.data;
  },

  updateWorkerProfile: async (profileData) => {
    const response = await api.put('/workers/profile', profileData);
    return response.data;
  },

  // Statistics
  getClientStats: async () => {
    const response = await api.get('/clients/stats');
    return response.data;
  },

  getWorkerStats: async () => {
    const response = await api.get('/workers/stats');
    return response.data;
  },
};