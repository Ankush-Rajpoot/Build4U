import React, { useState, useEffect, Fragment } from 'react';
import { useUser } from '../../context/UserContext';
import { Dialog } from '@headlessui/react';
import { serviceRequestService } from '../../services/serviceRequestService';
import ClientHeader from './ClientHeader';
import ClientSidebar from './ClientSidebar';
import ClientProfilePage from './ClientProfilePage';
import RequestList from '../shared/RequestList';
import RequestDetailsClient from '../shared/RequestDetailsClient';
import NewRequestModal from './NewRequestModal';
import EditRequestModal from './EditRequestModal';
import ReviewModal from '../reviews/ReviewModal';

const ClientDashboard = () => {
  const { userRole } = useUser();
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  const [reviewRequest, setReviewRequest] = useState(null);
  const [viewedRequest, setViewedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      // Simple, clear filtering logic
      if (activeTab === 'pending') {
        filters.status = 'pending';
      } else if (activeTab === 'active') {
        // For active, we'll filter on the frontend after getting all requests
        // This ensures we get both 'accepted' and 'in-progress' statuses
      } else if (activeTab === 'completed') {
        filters.status = 'completed';
      } else if (activeTab === 'cancelled') {
        filters.status = 'cancelled';
      }

      // console.log('Fetching client requests with filters:', filters);
      const response = await serviceRequestService.getClientServiceRequests(filters);
      let fetchedRequests = response.data.serviceRequests || [];
      
      // If active tab, filter for accepted and in-progress on frontend
      if (activeTab === 'active') {
        fetchedRequests = fetchedRequests.filter(request => 
          request.status === 'accepted' || request.status === 'in-progress'
        );
      }
      
      // console.log(`Found ${fetchedRequests.length} requests for ${activeTab} tab`);
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'client') {
      fetchRequests();
    }
  }, [userRole, activeTab]);

  const handleNewRequest = () => {
    setShowNewRequestModal(false);
    fetchRequests(); // Refresh the list
  };

  const handleEditRequest = (request) => {
    setEditRequest(request);
    setShowEditRequestModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditRequestModal(false);
    setEditRequest(null);
    fetchRequests(); // Refresh the list
  };

  const handleViewRequest = (request) => {
    setViewedRequest(request);
  };

  const handleReviewRequest = (request) => {
    setReviewRequest(request);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setReviewRequest(null);
    fetchRequests(); // Refresh the list
  };

  if (userRole !== 'client') {
    return null;
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pending':
        return 'Pending Requests';
      case 'active':
        return 'Active Jobs';
      case 'completed':
        return 'Completed Jobs';
      case 'cancelled':
        return 'Cancelled Requests';
      case 'profile':
        return 'My Profile';
      default:
        return 'All Service Requests';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ClientHeader />
      <div className="flex flex-col md:flex-row flex-1">
        <ClientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-2 sm:p-3 md:p-6 flex flex-col">
          {activeTab === 'profile' ? (
            <ClientProfilePage />
          ) : (
            <>
              <div className="mb-3 md:mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                    {getTabTitle()}
                  </h1>
                  <p className="text-gray-600 mt-0.5 text-sm md:text-base">
                    {activeTab === 'active' && 'Jobs that are accepted or in progress'}
                    {activeTab === 'pending' && 'Requests waiting for workers'}
                    {activeTab === 'completed' && 'Successfully completed jobs'}
                    {activeTab === 'cancelled' && 'Cancelled requests'}
                    {activeTab === 'all' && 'All your service requests'}
                  </p>
                </div>
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full md:w-auto text-sm"
                >
                  <span className="mr-1.5 font-medium">New Request</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              {error && (
                <div className="mb-3 md:mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              {/* Remove section division: just show the request list */}
              <div className="flex-1">
                <RequestList 
                  requests={requests} 
                  userRole="client"
                  loading={loading}
                  onUpdate={fetchRequests}
                  onEdit={handleEditRequest}
                  onView={handleViewRequest}
                  onReview={handleReviewRequest}
                />
              </div>
            </>
          )}
          {/* Modal for details */}
          <Dialog
            as={Fragment}
            open={!!viewedRequest && !showEditRequestModal && !showReviewModal}
            onClose={() => setViewedRequest(null)}
          >
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <Dialog.Panel
                className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-6 w-full max-w-3xl mx-auto relative"
                style={{
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#3b82f6 #e5e7eb'
                }}
              >
                {/* Custom scrollbar for Webkit browsers */}
                <style>
                  {`
                    .client-details-modal::-webkit-scrollbar {
                      width: 6px;
                    }
                    .client-details-modal::-webkit-scrollbar-thumb {
                      background: #3b82f6;
                      border-radius: 6px;
                    }
                    .client-details-modal::-webkit-scrollbar-track {
                      background: #e5e7eb;
                    }
                  `}
                </style>
                <div className="client-details-modal h-full overflow-y-auto">
                  <RequestDetailsClient 
                    request={viewedRequest} 
                    onClose={() => setViewedRequest(null)} 
                  />
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </main>
      </div>

      {/* Modals */}
      <NewRequestModal
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        onSuccess={() => {
          setShowNewRequestModal(false);
          fetchRequests();
        }}
      />

      <EditRequestModal
        isOpen={showEditRequestModal}
        onClose={() => {
          setShowEditRequestModal(false);
          setEditRequest(null);
        }}
        onSuccess={handleEditSuccess}
        request={editRequest}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewRequest(null);
        }}
        onSuccess={handleReviewSuccess}
        serviceRequest={reviewRequest}
      />
    </div>
  );
};

export default ClientDashboard;