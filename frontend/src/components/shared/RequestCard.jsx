import React, { useState } from 'react';
import { DollarSign, Calendar, MapPin, User, Edit, Eye, Star, Users } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import MessageButton from '../messaging/MessageButton';
import ProposalModal from '../worker/ProposalModal';
import ProposalsModal from '../client/ProposalsModal';
import MatchingWorkers from './MatchingWorkers';
import { useUser } from '../../context/UserContext';

const RequestCard = ({ request, userRole, onUpdate, onEdit, onView, onReview }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showProposalsModal, setShowProposalsModal] = useState(false);
  const [showMatchingWorkers, setShowMatchingWorkers] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalError, setProposalError] = useState('');
  const { openChat } = useChat();
  const { emitStatusUpdate } = useSocket();

  // Format date to be more readable
  const formattedDate = new Date(request.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Define status color based on status
  const getStatusColor = () => {
    switch (request.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAction = async (action) => {
    setLoading(true);
    setError('');

    try {
      let response;
      switch (action) {
        case 'accept':
          response = await serviceRequestService.acceptServiceRequest(request._id);
          break;
        case 'start':
          response = await serviceRequestService.startWork(request._id);
          break;
        case 'complete':
          response = await serviceRequestService.completeServiceRequest(request._id);
          break;
        case 'cancel':
          response = await serviceRequestService.cancelServiceRequest(request._id);
          break;
        default:
          break;
      }
      
      // Emit real-time status update
      if (response?.data?.serviceRequest) {
        const updatedRequest = response.data.serviceRequest;
        emitStatusUpdate(
          updatedRequest._id,
          updatedRequest.status,
          updatedRequest.client._id || updatedRequest.client,
          updatedRequest.worker?._id || updatedRequest.worker
        );
      }
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSubmit = async () => {
    setProposalLoading(true);
    setProposalError('');
    try {
      await serviceRequestService.sendRequest(request._id);
      setShowProposalModal(false);
      setShowConfirmDialog(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setProposalError(err?.response?.data?.message || 'Failed to send request');
    } finally {
      setProposalLoading(false);
    }
  };

  const handleProposalClick = () => {
    setShowConfirmDialog(true);
  };

  const canShowMessageCenter = () => {
    return (request.status === 'accepted' || request.status === 'in-progress') &&
           request.client && request.worker;
  };

  const handleOpenChat = async (req) => {
    await openChat(req);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(request);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(request);
    }
  };

  const handleReview = () => {
    if (onReview) {
      onReview(request);
    }
  };

  // Check if review already exists
  const hasReview = request.review && request.review.rating;

  // Helper to get proposals with populated worker details
  const proposalsWithWorkers = (request.proposals || []).map(p => ({
    ...p,
    worker: p.worker && typeof p.worker === 'object' ? p.worker : (request.workersMap?.[p.worker] || {})
  }));

  const cardRef = React.useRef(null);

  return (
    <>
      <div ref={cardRef} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 min-w-0 relative">
      <div className="p-3 sm:p-4 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-1 break-words">
              {request.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 sm:space-x-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}
              </span>
              <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                {request.category}
              </span>
              {hasReview && (
                <div className="flex items-center space-x-0.5">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-medium text-gray-600">{request.review.rating}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Menu */}
          <div className="flex items-center space-x-1">
            {userRole === 'client' && request.status === 'pending' && (
              <button
                onClick={handleEdit}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Request"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={handleView}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-2.5 text-xs line-clamp-2 break-words">
          {request.description}
        </p>
        
        {/* Required Skills */}
        {request.requiredSkills && request.requiredSkills.length > 0 && (
          <div className="mb-2.5">
            <h4 className="text-xs font-medium text-gray-700 mb-1.5">Required Skills</h4>
            <div className="flex flex-wrap gap-1">
              {request.requiredSkills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {request.requiredSkills.length > 3 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{request.requiredSkills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-1 mb-2.5">
          <div className="flex items-center text-xs text-gray-500">
            <DollarSign className="h-3.5 w-3.5 mr-1.5 text-green-600" />
            <span className="font-medium">Budget: ${request.budget?.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            <span>Posted: {formattedDate}</span>
          </div>
          
          {request.client && (
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
              <span>Client: {request.client.name}</span>
            </div>
          )}

          {request.worker && (
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3.5 w-3.5 mr-1.5 text-orange-600" />
              <span>Worker: {request.worker.name}</span>
            </div>
          )}
          
          {(request.location?.city || request.location?.address) && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-red-600" />
              <span className="truncate">{request.location.address || `${request.location.city}, ${request.location.state}`}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}
        
        <div className="mt-auto">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {userRole === 'client' ? (
              <ClientActions 
                request={request} 
                onAction={handleAction} 
                loading={loading}
                onMessage={handleOpenChat}
                canMessage={canShowMessageCenter()}
                onEdit={handleEdit}
                onReview={handleReview}
                hasReview={hasReview}
                onView={handleView}
                onSeeProposals={() => setShowProposalsModal(true)}
                onViewMatchingWorkers={() => setShowMatchingWorkers(true)}
              />
            ) : (
              <WorkerActions 
                request={request} 
                onAction={handleAction} 
                loading={loading}
                onMessage={handleOpenChat}
                canMessage={canShowMessageCenter()}
                onView={handleView}
                onProposal={handleProposalClick}
              />
            )}
          </div>
        </div>
      </div>

      <ProposalModal 
        open={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        onSubmit={handleProposalSubmit}
        loading={proposalLoading}
        error={proposalError}
      />
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm Request Submission</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to send a request for this service? This will notify the client about your interest.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleProposalSubmit}
                disabled={proposalLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
              >
                {proposalLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Contractor List Modal - Positioned outside card */}
      {userRole === 'client' && showProposalsModal && (
        <ProposalsModal
          open={showProposalsModal}
          requestId={request._id}
          onClose={() => setShowProposalsModal(false)}
          onSelectWorker={async (worker) => {
            await serviceRequestService.selectWorker(request._id, worker._id);
            setShowProposalsModal(false);
            if (onUpdate) onUpdate();
          }}
          anchorRef={cardRef}
        />
      )}

      {showMatchingWorkers && (
        <MatchingWorkers
          serviceRequestId={request._id}
          onClose={() => setShowMatchingWorkers(false)}
        />
      )}
    </>
  );
};

const ClientActions = ({ request, onAction, loading, onMessage, canMessage, onEdit, onReview, hasReview, onView, onSeeProposals, onViewMatchingWorkers }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {request.status === 'pending' && (
        <>
          <div className="flex flex-wrap gap-2 w-full mb-1">
            <button 
              onClick={onEdit}
              className="flex-1 min-w-[100px] px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button 
              onClick={() => onAction('cancel')}
              disabled={loading}
              className="flex-1 min-w-[100px] px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {loading ? 'Cancelling...' : 'Cancel'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 w-full mt-1">
            <button
              className="flex-1 min-w-[100px] px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center"
              onClick={onSeeProposals}
            >
              See Proposals ({request.proposals?.length || 0})
            </button>
            {/* Show matching workers only for pending jobs that need workers */}
            {((request.requiredSkills && request.requiredSkills.length > 0) || request.category) && (
              <button
                className="flex-1 min-w-[100px] px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors flex items-center justify-center"
                onClick={onViewMatchingWorkers}
              >
                View Matching Workers
              </button>
            )}
          </div>
        </>
      )}
      {(request.status === 'accepted' || request.status === 'in-progress') && canMessage && (
        <MessageButton
          onClick={() => onMessage(request)}
          serviceRequestId={request._id}
          className="flex-1 min-w-[100px] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          Message
        </MessageButton>
      )}
      {request.status === 'completed' && !hasReview && (
        <button 
          onClick={onReview}
          className="flex-1 min-w-[180px] px-5 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center"
        >
          <Star className="h-4 w-4 mr-1" />
          Leave Review
        </button>
      )}
      {/* Always show View Details button */}
      <button 
        onClick={() => onView(request)}
        className="flex-1 min-w-[120px] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        <Eye className="h-4 w-4 mr-1" />
        View Details
      </button>
    </div>
  );
};

const WorkerActions = ({ request, onAction, loading, onMessage, canMessage, onView, onProposal }) => {
  const { user } = useUser();
  const hasSubmittedRequest = (request.proposals || []).some(p => {
    return (p.worker && (p.worker._id === user?._id || p.worker === user?._id));
  });
  return (
    <div className="flex flex-wrap gap-2">
      {request.status === 'pending' && !hasSubmittedRequest && (
        <button 
          onClick={onProposal}
          disabled={loading}
          className="flex-1 min-w-[120px] px-3 py-2 bg-green-500 rounded-lg text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      )}
      {request.status === 'pending' && hasSubmittedRequest && (
        <span className="flex-1 min-w-[120px] px-3 py-2 bg-gray-200 rounded-lg text-sm font-medium text-gray-600 flex items-center justify-center cursor-default select-none">Submitted</span>
      )}
      {(request.status === 'accepted' || request.status === 'in-progress') && canMessage && (
        <MessageButton
          onClick={() => onMessage(request)}
          serviceRequestId={request._id}
          className="flex-1 min-w-[100px] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          Message
        </MessageButton>
      )}
      {request.status === 'accepted' && (
        <button 
          onClick={() => onAction('start')}
          disabled={loading}
          className="flex-1 min-w-[100px] px-3 py-2 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Starting...' : 'Start Work'}
        </button>
      )}
      {request.status === 'in-progress' && (
        <button 
          onClick={() => onAction('complete')}
          disabled={loading}
          className="flex-1 min-w-[120px] px-3 py-2 bg-green-500 rounded-lg text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Completing...' : 'Mark Complete'}
        </button>
      )}
      {/* Always show a single View Details button for worker */}
      <button 
        onClick={() => onView(request)}
        className="flex-1 min-w-[120px] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        <Eye className="h-4 w-4 mr-1" />
        View Details
      </button>
    </div>
  );
};

export default RequestCard;

// const getInitials = (name) => {
//   if (!name) return 'U';
//   const nameParts = name.trim().split(' ');
//   if (nameParts.length === 1) {
//     return nameParts[0].charAt(0).toUpperCase();
//   }
//   return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
// };

// // Function to get consistent background color based on name
// const getAvatarColor = (name) => {
//   const colors = [
//     'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
//     'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
//     'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'
//   ];
  
//   if (!name) return 'bg-gray-500';
  
//   // Generate consistent color based on name
//   let hash = 0;
//   for (let i = 0; i < name.length; i++) {
//     hash = name.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   return colors[Math.abs(hash) % colors.length];
// };

// Avatar component
// const Avatar = ({ person, size = 'sm' }) => {
//   if (!person) return null;
  
//   const sizeClasses = size === 'sm' ? 'w-5 h-5 text-xs' : 'w-8 h-8 text-sm';
  
//   if (person.profileImage || person.profilePicture) {
//     return (
//       <img
//         src={person.profileImage || person.profilePicture}
//         alt={person.name || 'User'}
//         className={`${sizeClasses} rounded-full object-cover border border-gray-200 flex-shrink-0`}
//       />
//     );
//   }
  
//   const initials = getInitials(person.name);
//   const colorClass = getAvatarColor(person.name);
  
//   return (
//     <div className={`${sizeClasses} rounded-full ${colorClass} flex items-center justify-center border border-gray-200 flex-shrink-0`}>
//       <span className="text-white font-semibold">{initials}</span>
//     </div>
//   );
// };