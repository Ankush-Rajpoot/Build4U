import React, { useState, useEffect } from 'react';
import { User, Star, MapPin, Clock, Badge, CheckCircle, AlertCircle, Users, Eye } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import WorkerPortfolioModal from '../worker/WorkerPortfolioModal';
import { WorkerCardSkeleton } from './skeletons';

const MatchingWorkers = ({ serviceRequestId, onClose }) => {
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portfolioModal, setPortfolioModal] = useState({ isOpen: false, worker: null });

  useEffect(() => {
    fetchMatchingWorkers();
  }, [serviceRequestId]);

  const fetchMatchingWorkers = async () => {
    try {
      setLoading(true);
      const response = await serviceRequestService.getMatchingWorkers(serviceRequestId);
      setMatchingData(response.data);
    } catch (error) {
      console.error('Error fetching matching workers:', error);
      setError(error.response?.data?.message || 'Failed to fetch matching workers');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getWorkerInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    // Get first letter of first word and first letter of last word
    const firstInitial = words[0].charAt(0).toUpperCase();
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  };

  // Function to get consistent background color based on name (same as ProposalsModal)
  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'
    ];
    
    if (!name) return 'bg-gray-500';
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatLocation = (location) => {
    if (typeof location === 'string') return location;
    if (location?.city && location?.state) return `${location.city}, ${location.state}`;
    if (location?.address) return location.address;
    return 'Location not specified';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full mx-2 shadow-md">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <WorkerCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 max-w-xs w-full mx-2 shadow-md">
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Error</h3>
            <p className="text-gray-600 text-xs mb-2">{error}</p>
            <button
              onClick={onClose}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Matching Workers</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {matchingData?.searchMethod === 'skills' ? 'Workers matching required skills' : `Workers with skills for ${matchingData?.category || 'Category'}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Job Requirements Summary */}
        <div className="px-4 py-2 bg-white border-b border-gray-100 flex items-center gap-3 text-xs">
          <div className="flex-1">
            <span className="font-semibold text-blue-900">
              {matchingData?.searchMethod === 'skills' ? 'Required Skills:' : `Category Skills:`}
            </span>
            <span className="ml-1.5 flex flex-wrap gap-1">
              {matchingData?.requiredSkills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </span>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="text-gray-500">Matches: <span className="font-semibold text-gray-700">{matchingData?.totalMatches || 0}</span></span>
            <span className="text-green-600">Perfect: <span className="font-semibold">{matchingData?.perfectMatches || 0}</span></span>
            <span className="text-blue-600">Skills: <span className="font-semibold">{matchingData?.requiredSkills?.length || 0}</span></span>
          </div>
        </div>

        {/* Workers List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 bg-gray-50 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200 hover:scrollbar-thumb-blue-500">
          <style jsx>{`
            /* Custom scrollbar styles for webkit browsers */
            .flex-1::-webkit-scrollbar {
              width: 6px;
            }
            .flex-1::-webkit-scrollbar-track {
              background: #f3f4f6;
              border-radius: 3px;
            }
            .flex-1::-webkit-scrollbar-thumb {
              background: #60a5fa;
              border-radius: 3px;
            }
            .flex-1::-webkit-scrollbar-thumb:hover {
              background: #3b82f6;
            }
          `}</style>
          {matchingData?.matchingWorkers?.length === 0 ? (
            <div className="text-center py-6">
              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No Matching Workers</h3>
              <p className="text-gray-500 text-xs">
                No workers currently match the required skills for this job.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {matchingData?.matchingWorkers?.map((worker) => (
                <div key={worker._id} className="border border-gray-100 rounded-lg p-2.5 bg-white flex gap-2.5 items-start hover:shadow-sm transition-shadow">
                  {/* Worker Info */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {worker.profileImage ? (
                      <img
                        src={worker.profileImage}
                        alt={worker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${getAvatarColor(worker.name)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-semibold text-xs">
                          {getWorkerInitials(worker.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{worker.name}</h3>
                      {worker.hasAllSkills && (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" title="Has all required skills" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                      <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-yellow-400" />{worker.rating?.average?.toFixed(1) || 'New'} <span className="ml-0.5">({worker.rating?.count || 0})</span></span>
                      <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{formatLocation(worker.location)}</span>
                      <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{worker.experience}y exp.</span>
                    </div>
                    {/* All Worker Skills */}
                    <div className="mb-0.5">
                      <div className="flex flex-wrap gap-0.5">
                        {worker.skills?.map((skill, index) => {
                          const isMatching = worker.matchingSkills?.includes(skill);
                          return (
                            <span
                              key={index}
                              className={`px-1 py-0.5 text-[10px] rounded-full border ${isMatching ? 'bg-green-50 text-green-700 border-green-200 font-semibold' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                            >
                              {skill}{isMatching && ' ✓'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Rate:</span> ${worker.hourlyRate}/hr
                    </div>
                  </div>
                  {/* Match Score and Actions */}
                  <div className="flex flex-col items-end gap-1.5 min-w-[80px]">
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${getMatchColor(worker.matchPercentage)} border border-gray-200 mb-0.5`}>
                      <Badge className="h-2.5 w-2.5 mr-0.5" />
                      {worker.matchPercentage}%
                    </div>
                    <div className="text-[10px] text-gray-400 mb-0.5">
                      {worker.matchingSkills?.length}/{worker.totalRequiredSkills} skills
                    </div>
                    <button
                      onClick={() => setPortfolioModal({ isOpen: true, worker })}
                      className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-0.5 shadow-sm"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      Portfolio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-1.5 border-t border-gray-100 bg-white flex justify-between items-center text-xs">
          <span className="text-gray-500">
            {matchingData?.searchMethod === 'skills'
              ? 'Sorted by skill match % and rating'
              : 'Sorted by category skills and rating'}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
          >
            Close
          </button>
        </div>

        {/* Portfolio Modal */}
        <WorkerPortfolioModal
          isOpen={portfolioModal.isOpen}
          onClose={() => setPortfolioModal({ isOpen: false, worker: null })}
          worker={portfolioModal.worker}
        />
      </div>
    </div>
  );
};

export default MatchingWorkers;
