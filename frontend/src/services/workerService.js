import api from './api';

export const workerService = {
  getCompletedJobsWithoutPortfolio: async () => {
    const response = await api.get('/workers/completed-jobs-without-portfolio');
    return response.data;
  },
};
