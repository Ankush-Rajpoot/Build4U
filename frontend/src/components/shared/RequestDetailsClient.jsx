import React, { useEffect, useState } from 'react';
import { X, DollarSign, Calendar, MapPin, User, Star, Image as ImageIcon, ClipboardList, ThumbsUp, ThumbsDown, Award, MessageSquare, Clock, Users } from 'lucide-react';
import { reviewService } from '../../services/reviewService';

// Function to get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

// Function to get consistent background color based on name
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

// Avatar component
const Avatar = ({ person, size = 'lg' }) => {
  if (!person) return null;
  
  const sizeClasses = size === 'lg' ? 'w-16 h-16 text-lg' : 'w-5 h-5 text-xs';
  
  if (person.profileImage || person.profilePicture) {
    return (
      <img
        src={person.profileImage || person.profilePicture}
        alt={person.name || 'User'}
        className={`${sizeClasses} rounded-full object-cover border border-gray-200 flex-shrink-0`}
      />
    );
  }
  
  const initials = getInitials(person.name);
  const colorClass = getAvatarColor(person.name);
  
  return (
    <div className={`${sizeClasses} rounded-full ${colorClass} flex items-center justify-center border border-gray-200 flex-shrink-0`}>
      <span className="text-white font-semibold">{initials}</span>
    </div>
  );
};

const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const renderStars = (value) => (
  <span className="flex items-center space-x-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= value ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
      />
    ))}
    {typeof value === 'number' && value > 0 && (
      <span className="ml-1 text-xs text-gray-700">{value}/5</span>
    )}
  </span>
);

const RequestDetailsClient = ({ request, onClose }) => {
  const [review, setReview] = useState(null);
  const [reviewNotFound, setReviewNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (request && request._id) {
      reviewService.getReviewByServiceRequestId(request._id)
        .then(res => {
          if (isMounted && res?.review) {
            setReview(res.review);
            setReviewNotFound(false);
          } else {
            setReview(null);
            setReviewNotFound(true);
          }
        })
        .catch(err => {
          if (err?.response?.status === 404) {
            setReview(null);
            setReviewNotFound(true);
          } else {
            setReview(null);
            setReviewNotFound(false);
          }
        });
    } else {
      setReview(null);
      setReviewNotFound(false);
    }
    return () => { isMounted = false; };
  }, [request && request._id]);

  if (!request) return null;

  // Timeline for client
  const renderTimeline = () => (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className={`flex-1 text-center ${request.createdAt ? 'font-bold text-blue-700' : ''}`}>
          Requested<br/>{formatDateTime(request.createdAt)}
        </div>
        <div className="flex-1 text-center">
          {request.status === 'accepted' || request.status === 'in-progress' || request.status === 'completed'
            ? <>Accepted<br/>{formatDateTime(request.updatedAt)}</>
            : <span className="opacity-50">Accepted</span>}
        </div>
        <div className="flex-1 text-center">
          {request.status === 'in-progress' || request.status === 'completed'
            ? <>In Progress</>
            : <span className="opacity-50">In Progress</span>}
        </div>
        <div className="flex-1 text-center">
          {request.status === 'completed'
            ? <>Completed<br/>{formatDateTime(request.completedDate)}</>
            : <span className="opacity-50">Completed</span>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="flex-1 h-1 bg-blue-300 rounded-l" />
        <div className={`flex-1 h-1 ${request.status !== 'pending' ? 'bg-blue-500' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1 ${request.status === 'in-progress' || request.status === 'completed' ? 'bg-blue-500' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1 ${request.status === 'completed' ? 'bg-blue-500' : 'bg-gray-200'} rounded-r`} />
      </div>
    </div>
  );

  // Worker info for client
  const renderWorkerInfo = () => {
    if (!request.worker) return null;
    return (
      <div className="mb-4 bg-blue-50 rounded-lg p-4 flex items-center gap-4">
        <Avatar person={request.worker} size="lg" />
        <div>
          <div className="font-bold text-blue-900">{request.worker.name}</div>
          {request.worker.skills && (
            <div className="text-xs text-blue-700 mb-1">
              Skills: {Array.isArray(request.worker.skills) ? request.worker.skills.join(', ') : request.worker.skills}
            </div>
          )}
          {request.worker.rating?.average && (
            <div className="flex items-center text-xs text-yellow-600">
              <Star className="h-4 w-4 mr-1" />
              {request.worker.rating.average} ({request.worker.rating.count} reviews)
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative p-3 sm:p-4 md:p-6 max-h-[80vh] overflow-y-auto">
      <button
        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 text-gray-500"
        onClick={onClose}
        title="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <h2 className="text-xl sm:text-2xl font-bold mb-2 break-words">{request.title}</h2>
      {renderTimeline()}
      {renderWorkerInfo()}
      <div className="flex items-center space-x-2 mb-3">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
          {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
        </span>
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
          {request.category}
        </span>
        {request.review?.rating && (
          <span className="flex items-center space-x-1 ml-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-600">{request.review.rating}</span>
          </span>
        )}
      </div>
      <p className="text-gray-700 mb-4">{request.description}</p>
      <div className="space-y-2 mb-4 text-xs sm:text-sm">
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
          <span className="font-medium">Budget: ${request.budget?.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
          <span>Posted: {formatDateTime(request.createdAt)}</span>
        </div>
        {request.scheduledDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
            <span>Scheduled Start: {formatDateTime(request.scheduledDate)}</span>
          </div>
        )}
        {request.status === 'accepted' && request.updatedAt && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
            <span>Accepted At: {formatDateTime(request.updatedAt)}</span>
          </div>
        )}
        {request.completedDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-green-600" />
            <span>Completed At: {formatDateTime(request.completedDate)}</span>
          </div>
        )}
        {(request.location?.city || request.location?.address) && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-red-600" />
            <span>
              {request.location.address || `${request.location.city}, ${request.location.state} ${request.location.zipCode || ''}`}
            </span>
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <Avatar person={request.client} size="sm" />
          <span className="ml-2">Client: {request.client?.name || '-'}</span>
        </div>
      </div>
      {request.images && request.images.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <ImageIcon className="h-5 w-5 mr-2 text-blue-400" />
            <span className="font-medium text-gray-700">Images:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {request.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`request-img-${idx}`}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}
      {request.requirements && request.requirements.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <ClipboardList className="h-5 w-5 mr-2 text-gray-500" />
            <span className="font-medium text-gray-700">Requirements:</span>
          </div>
          <ul className="list-disc list-inside text-gray-600 text-sm">
            {request.requirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>
      )}
      {review && review.rating ? (
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <Star className="h-5 w-5 mr-2 text-yellow-400" />
            <span className="font-medium text-gray-700">Client Review</span>
          </div>
          {/* Overall Rating */}
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Overall Rating:</span>
              <div className="flex items-center space-x-2">
                {renderStars(review.rating)}
              </div>
            </div>
          </div>
          {/* Detailed Review Attributes */}
          {(typeof review.workQuality === 'number' && review.workQuality >= 1) ||
           (typeof review.communication === 'number' && review.communication >= 1) ||
           (typeof review.timeliness === 'number' && review.timeliness >= 1) ||
           (typeof review.professionalism === 'number' && review.professionalism >= 1) ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Ratings</h4>
              <div className="grid grid-cols-2 gap-3">
                {typeof review.workQuality === 'number' && review.workQuality >= 1 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-xs font-medium text-gray-700">Work Quality:</span>
                    </div>
                    {renderStars(review.workQuality)}
                  </div>
                )}
                {typeof review.communication === 'number' && review.communication >= 1 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-xs font-medium text-gray-700">Communication:</span>
                    </div>
                    {renderStars(review.communication)}
                  </div>
                )}
                {typeof review.timeliness === 'number' && review.timeliness >= 1 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="text-xs font-medium text-gray-700">Timeliness:</span>
                    </div>
                    {renderStars(review.timeliness)}
                  </div>
                )}
                {typeof review.professionalism === 'number' && review.professionalism >= 1 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="text-xs font-medium text-gray-700">Professionalism:</span>
                    </div>
                    {renderStars(review.professionalism)}
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {/* Written Review */}
          {review.comment && (
            <div className="mb-3">
              <span className="text-sm font-semibold text-gray-700">Review Comment:</span>
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded-lg italic">
                "{review.comment}"
              </p>
            </div>
          )}
          {/* Recommendation */}
          {typeof review.wouldRecommend === 'boolean' && (
            <div className="mb-3">
              <div className="flex items-center space-x-2">
                {review.wouldRecommend ? (
                  <>
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Client recommends this worker</span>
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Client does not recommend this worker</span>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Review Date */}
          {(review.reviewedAt || review.createdAt) && (
            <div className="text-xs text-gray-500 border-t pt-2">
              Reviewed on: {formatDateTime(review.reviewedAt || review.createdAt)}
            </div>
          )}
        </div>
      ) : reviewNotFound ? (
        <div className="mb-4 text-gray-400 italic">No review for this job yet.</div>
      ) : (
        <div className="mb-4 text-gray-400 italic">Loading review...</div>
      )}
    </div>
  );
};

export default RequestDetailsClient;
