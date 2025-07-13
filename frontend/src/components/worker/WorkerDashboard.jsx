import React, { useState, useEffect, Fragment } from 'react';
import { useUser } from '../../context/UserContext';
import { Dialog } from '@headlessui/react';
import { serviceRequestService } from '../../services/serviceRequestService';
import WorkerHeader from './WorkerHeader';
import WorkerSidebar from './WorkerSidebar';
import WorkerProfilePage from './WorkerProfilePage';
import WorkerStats from './WorkerStats';
import RequestList from '../shared/RequestList';
import RequestDetailsWorker from '../shared/RequestDetailsWorker';
import { DashboardSkeleton } from '../shared/skeletons';

const WorkerDashboard = () => {
  const { userRole } = useUser();
  const [activeTab, setActiveTab] = useState('available');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let response;

      // console.log('Fetching requests for tab:', activeTab);

      if (activeTab === 'available') {
        // Get jobs that are pending (available for workers to accept)
        response = await serviceRequestService.getAvailableJobs();
        setRequests(response.data.serviceRequests || []);
        
      } else if (activeTab === 'active') {
        // Get only ACTIVE jobs (accepted + in-progress)
        response = await serviceRequestService.getWorkerJobs();
        let allJobs = response.data.serviceRequests || [];
        const activeJobs = allJobs.filter(job => 
          job.status === 'accepted' || job.status === 'in-progress'
        );
        // console.log(`Active Jobs: ${activeJobs.length} from ${allJobs.length} total`);
        setRequests(activeJobs);
        
      } else if (activeTab === 'completed') {
        // Get only completed jobs
        response = await serviceRequestService.getCompletedJobs();
        setRequests(response.data.serviceRequests || []);
        
      } else if (activeTab === 'all-jobs') {
        // Get ALL jobs assigned to this worker (accepted, in-progress, completed, cancelled)
        response = await serviceRequestService.getWorkerJobs();
        let allJobs = response.data.serviceRequests || [];
        
        // Also get completed jobs and merge them
        const completedResponse = await serviceRequestService.getCompletedJobs();
        const completedJobs = completedResponse.data.serviceRequests || [];
        
        // Combine and remove duplicates
        const allJobsMap = new Map();
        [...allJobs, ...completedJobs].forEach(job => {
          allJobsMap.set(job._id, job);
        });
        
        const combinedJobs = Array.from(allJobsMap.values());
        // console.log(`All My Jobs: ${combinedJobs.length} total jobs`);
        setRequests(combinedJobs);
      }

      // Debug: Log fetched requests to check review data
      console.log('Fetched requests:', response?.data?.serviceRequests);
      
      // Check each request for review data
      // if (response?.data?.serviceRequests) {
      //   response.data.serviceRequests.forEach((req, index) => {
      //     console.log(`Request ${index + 1} (${req._id}):`, {
      //       title: req.title,
      //       status: req.status,
      //       hasReview: !!req.review,
      //       reviewData: req.review
      //     });
          
      //     if (req.review) {
      //       console.log(`Request ${index + 1} review details:`, {
      //         rating: req.review.rating,
      //         workQuality: req.review.workQuality,
      //         communication: req.review.communication,
      //         timeliness: req.review.timeliness,
      //         professionalism: req.review.professionalism,
      //         wouldRecommend: req.review.wouldRecommend,
      //         comment: req.review.comment
      //       });
      //     }
      //   });
      // }

    } catch (error) {
      // console.error('Error fetching requests:', error);
      setError(error.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'worker') {
      fetchRequests();
    }
  }, [userRole, activeTab]);

  if (userRole !== 'worker') {
    return null;
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'available':
        return 'Available Jobs';
      case 'active':
        return 'Active Jobs';
      case 'completed':
        return 'Completed Jobs';
      case 'all-jobs':
        return 'All My Jobs';
      case 'profile':
        return 'My Profile';
      default:
        return 'Jobs';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'available':
        return 'New jobs you can accept and start working on';
      case 'active':
        return 'Jobs you are currently working on (accepted & in-progress)';
      case 'completed':
        return 'Jobs you have successfully completed';
      case 'all-jobs':
        return 'Complete history of all your jobs (active, completed, cancelled)';
      default:
        return '';
    }
  };

  const getJobCounts = () => {
    const counts = {
      available: 0,
      active: 0,
      completed: 0,
      total: 0
    };

    if (activeTab === 'all-jobs') {
      counts.active = requests.filter(r => r.status === 'accepted' || r.status === 'in-progress').length;
      counts.completed = requests.filter(r => r.status === 'completed').length;
      counts.total = requests.length;
    }

    return counts;
  };

  const jobCounts = getJobCounts();

  return (
    <div className="h-screen bg-gray-50 dark:bg-dark-background flex flex-col">
      <WorkerHeader 
        onMenuToggle={toggleMobileMenu} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />
      <div className="flex flex-1 overflow-hidden">
        <WorkerSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          onMenuClose={closeMobileMenu}
        />
        <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-surface">
          {activeTab === 'profile' ? (
            <div className="p-1.5 sm:p-2 md:p-3 flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-background">
              <WorkerProfilePage />
            </div>
          ) : (
            <>
              {/* Stats section - compact on mobile */}
              <div className="p-1.5 sm:p-2 md:p-3 pb-0 flex-shrink-0 bg-gray-50 dark:bg-dark-background">
                <WorkerStats />
              </div>
              
              {/* Header section - compact on mobile */}
              <div className="px-1.5 sm:px-2 md:px-3 py-1.5 flex-shrink-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-gray-800 dark:text-dark-text-primary">
                      {getTabTitle()}
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-dark-text-secondary">
                        ({requests.length})
                      </span>
                    </h1>
                    {/* Commented out job descriptions for cleaner UI */}
                    {/* <p className="text-gray-600 mt-0.5 text-sm">
                      {getTabDescription()}
                    </p> */}
                  </div>
                  {activeTab === 'all-jobs' && jobCounts.total > 0 && (
                    <div className="hidden sm:block bg-white dark:bg-dark-surface-secondary p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border w-auto">
                      <h3 className="text-xs font-medium text-gray-700 dark:text-dark-text mb-1.5">Job Breakdown</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-dark-text-secondary">Active:</span>
                          <span className="font-medium text-blue-600 dark:text-dark-primary">{jobCounts.active}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-dark-text-secondary">Completed:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{jobCounts.completed}</span>
                        </div>
                        <div className="flex justify-between border-t dark:border-dark-border pt-1">
                          <span className="text-gray-700 dark:text-dark-text font-medium">Total:</span>
                          <span className="font-semibold dark:text-dark-text-primary">{jobCounts.total}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {error && (
                  <div className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-2.5 py-1.5 rounded-md text-xs">
                    {error}
                  </div>
                )}
              </div>
              
              {/* Scrollable request list - takes remaining height */}
              <div className="flex-1 overflow-y-auto px-1.5 sm:px-2 md:px-3 pb-1.5 sm:pb-2 md:pb-3 bg-gray-50 dark:bg-dark-background">
                <RequestList 
                  requests={requests} 
                  userRole="worker"
                  loading={loading}
                  onUpdate={fetchRequests}
                  onView={setSelectedRequest}
                />
              </div>
            </>
          )}
          {/* Modal for details with enhanced mobile design */}
          <Dialog
            as={Fragment}
            open={!!selectedRequest}
            onClose={() => setSelectedRequest(null)}
          >
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 dark:bg-black/80 p-2 sm:p-4">
              <Dialog.Panel
                className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-2xl border border-gray-200 dark:border-[#404040] p-3 sm:p-4 md:p-6 w-full max-w-3xl mx-auto relative overflow-hidden"
                style={{
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#22c55e #e5e7eb'
                }}
              >
                {/* Custom scrollbar for Webkit browsers */}
                <style>
                  {`
                    .worker-details-modal::-webkit-scrollbar {
                      width: 6px;
                    }
                    .worker-details-modal::-webkit-scrollbar-thumb {
                      background: #22c55e;
                      border-radius: 6px;
                    }
                    .worker-details-modal::-webkit-scrollbar-track {
                      background: #e5e7eb;
                    }
                    .dark .worker-details-modal::-webkit-scrollbar-thumb {
                      background: #34d399;
                    }
                    .dark .worker-details-modal::-webkit-scrollbar-track {
                      background: #171717;
                    }
                  `}
                </style>
                <div className="worker-details-modal h-full overflow-y-auto">
                  <RequestDetailsWorker 
                    request={selectedRequest} 
                    onClose={() => setSelectedRequest(null)} 
                  />
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default WorkerDashboard;