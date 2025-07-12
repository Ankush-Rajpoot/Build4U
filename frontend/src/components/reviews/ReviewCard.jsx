import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Calendar, User, Award, Clock, Users } from 'lucide-react';

const ReviewCard = ({ review, showWorkerInfo = false, showClientInfo = false, canRespond = false, onRespond }) => {
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating, size = 'h-4 w-4') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !onRespond) return;
    
    setSubmitting(true);
    try {
      await onRespond(review._id, responseText.trim());
      setShowResponse(false);
      setResponseText('');
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {showClientInfo && review.client && (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{review.client.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
              </div>
            </div>
          )}
          
          {showWorkerInfo && review.worker && (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{review.worker.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Worker</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-1">
            {renderStars(review.rating, 'h-5 w-5')}
            <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">{review.rating}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(review.createdAt)}
          </div>
        </div>
      </div>

      {/* Service Request Info */}
      {review.serviceRequest && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">{review.serviceRequest.title}</span>
            <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
              {review.serviceRequest.category}
            </span>
          </div>
        </div>
      )}

      {/* Detailed Ratings */}
      {(review.workQuality || review.communication || review.timeliness || review.professionalism) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {review.workQuality && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Award className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Quality</span>
              </div>
              {renderStars(review.workQuality)}
            </div>
          )}
          {review.communication && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Communication</span>
              </div>
              {renderStars(review.communication)}
            </div>
          )}
          {review.timeliness && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Timeliness</span>
              </div>
              {renderStars(review.timeliness)}
            </div>
          )}
          {review.professionalism && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Professional</span>
              </div>
              {renderStars(review.professionalism)}
            </div>
          )}
        </div>
      )}

      {/* Review Comment */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
      </div>

      {/* Recommendation */}
      {review.wouldRecommend !== undefined && (
        <div className="flex items-center space-x-2 mb-4">
          {review.wouldRecommend ? (
            <>
              <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-400 font-medium">Recommends this worker</span>
            </>
          ) : (
            <>
              <ThumbsDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-400 font-medium">Does not recommend this worker</span>
            </>
          )}
        </div>
      )}

      {/* Worker Response */}
      {review.workerResponse?.comment && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 mt-4">
          <div className="flex items-center mb-2">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="font-medium text-blue-900 dark:text-blue-100">Worker Response</span>
            <span className="text-sm text-blue-600 dark:text-blue-400 ml-auto">
              {formatDate(review.workerResponse.respondedAt)}
            </span>
          </div>
          <p className="text-blue-800 dark:text-blue-200">{review.workerResponse.comment}</p>
        </div>
      )}

      {/* Response Form */}
      {canRespond && !review.workerResponse?.comment && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {!showResponse ? (
            <button
              onClick={() => setShowResponse(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Respond to this review
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write a professional response to this review..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowResponse(false);
                    setResponseText('');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={!responseText.trim() || submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;