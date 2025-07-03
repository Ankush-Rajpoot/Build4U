import api from './api';

export const portfolioService = {
  // Upload portfolio entry (images + metadata)
  uploadPortfolio: async (formData) => {
    const response = await api.post('/workers/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get portfolio for a worker
  getPortfolio: async (workerId) => {
    const response = await api.get(`/workers/${workerId}/portfolio`);
    return response.data;
  }
};
