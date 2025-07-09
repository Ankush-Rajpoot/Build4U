import api from './api';

export const serviceRequestService = {
  // Create new service request (Client only)
  createServiceRequest: async (requestData) => {
    const response = await api.post('/service-requests', requestData);
    return response.data;
  },

  // Get all service requests with filters
  getServiceRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/service-requests?${params.toString()}`);
    return response.data;
  },

  // Get single service request
  getServiceRequest: async (id) => {
    const response = await api.get(`/service-requests/${id}`);
    return response.data;
  },

  // Update service request (Client only)
  updateServiceRequest: async (id, requestData) => {
    const response = await api.put(`/service-requests/${id}`, requestData);
    return response.data;
  },

  // Accept service request (Worker only)
  acceptServiceRequest: async (id) => {
    const response = await api.put(`/service-requests/${id}/accept`);
    return response.data;
  },

  // Start work (Worker only)
  startWork: async (id) => {
    const response = await api.put(`/service-requests/${id}/start`);
    return response.data;
  },

  // Complete service request (Worker only)
  completeServiceRequest: async (id) => {
    const response = await api.put(`/service-requests/${id}/complete`);
    return response.data;
  },

  // Cancel service request (Client only)
  cancelServiceRequest: async (id) => {
    const response = await api.put(`/service-requests/${id}/cancel`);
    return response.data;
  },

  // Get client's service requests
  getClientServiceRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/clients/service-requests?${params.toString()}`);
    return response.data;
  },

  // Get available jobs for workers
  getAvailableJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/workers/available-jobs?${params.toString()}`);
    return response.data;
  },

  // Get worker's current jobs
  getWorkerJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/workers/my-jobs?${params.toString()}`);
    return response.data;
  },

  // Get worker's completed jobs
  getCompletedJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/workers/completed-jobs?${params.toString()}`);
    return response.data;
  },

  // uploadFiles: async (files) => {
  //   const formData = new FormData();
  //   files.forEach(file => {
  //     formData.append('files', file); // `files` is the name expected in multer upload.array('files')
  //   });

  //   const response = await api.post('/upload', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   });

  //   return response.data;
  // },

 
  uploadFiles: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file); // 'files' matches multer upload.array('files')
    });
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Submit proposal (Worker only)
  submitProposal: async (id, proposalData) => {
    const response = await api.post(`/service-requests/${id}/proposals`, proposalData);
    return response.data;
  },

  // Select worker for a request (Client only)
  selectWorker: async (id, workerId) => {
    const response = await api.put(`/service-requests/${id}/select-worker`, { workerId });
    return response.data;
  },

  // Send request (Worker only)
  sendRequest: async (id) => {
    const response = await api.post(`/service-requests/${id}/send-request`);
    return response.data;
  },

  // Get all workers who sent requests for a service request
  getWorkerRequests: async (id) => {
    const response = await api.get(`/service-requests/${id}/worker-requests`);
    return response.data;
  },

  // Get matching workers for a service request
  getMatchingWorkers: async (id) => {
    const response = await api.get(`/service-requests/${id}/matching-workers`);
    return response.data;
  },

  // Assign worker to service request (FOR TESTING ONLY)
  assignWorkerForTesting: async (id) => {
    const response = await api.put(`/service-requests/${id}/assign-worker`);
    return response.data;
  },
};


