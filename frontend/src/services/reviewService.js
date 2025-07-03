import api from './api';

export const reviewService = {
  // Create a review for a completed service request
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for a specific worker
  getWorkerReviews: async (workerId, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/reviews/worker/${workerId}?${params.toString()}`);
    return response.data;
  },

  // Get reviews for the current logged-in worker
  getMyWorkerReviews: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/reviews/worker?${params.toString()}`);
    return response.data;
  },

  // Get reviews written by the current client
  getClientReviews: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/reviews/client?${params.toString()}`);
    return response.data;
  },

  // Update an existing review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Worker response to a review
  respondToReview: async (reviewId, responseData) => {
    const response = await api.put(`/reviews/${reviewId}/response`, responseData);
    return response.data;
  },

  // Get a review by serviceRequestId
  getReviewByServiceRequestId: async (serviceRequestId) => {
    const response = await api.get(`/reviews/by-service-request/${serviceRequestId}`);
    return response.data;
  }
};