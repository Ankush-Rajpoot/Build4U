import React, { useState } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, MessageSquare, Clock, Award, Users } from 'lucide-react';
import { reviewService } from '../../services/reviewService';

const ReviewModal = ({ isOpen, onClose, onSuccess, serviceRequest }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    workQuality: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0,
    wouldRecommend: true
  });

  const handleRatingChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.rating === 0) {
        setError('Please provide an overall rating');
        setLoading(false);
        return;
      }

      if (formData.comment.trim().length < 10) {
        setError('Please provide a detailed review (at least 10 characters)');
        setLoading(false);
        return;
      }

      const reviewData = {
        serviceRequestId: serviceRequest._id,
        rating: formData.rating,
        comment: formData.comment.trim(),
        ...(formData.workQuality >= 1 && formData.workQuality <= 5 ? { workQuality: formData.workQuality } : {}),
        ...(formData.communication >= 1 && formData.communication <= 5 ? { communication: formData.communication } : {}),
        ...(formData.timeliness >= 1 && formData.timeliness <= 5 ? { timeliness: formData.timeliness } : {}),
        ...(formData.professionalism >= 1 && formData.professionalism <= 5 ? { professionalism: formData.professionalism } : {}),
        wouldRecommend: formData.wouldRecommend
      };

      await reviewService.createReview(reviewData);
      
      // Reset form
      setFormData({
        rating: 0,
        comment: '',
        workQuality: 0,
        communication: 0,
        timeliness: 0,
        professionalism: 0,
        wouldRecommend: true
      });
      
      onSuccess();
    } catch (error) {
      console.error('Create review error:', error);
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setFormData({
      rating: 0,
      comment: '',
      workQuality: 0,
      communication: 0,
      timeliness: 0,
      professionalism: 0,
      wouldRecommend: true
    });
    onClose();
  };

  if (!isOpen || !serviceRequest) return null;

  const StarRating = ({ value, onChange, label, icon: Icon }) => (
    <div className="space-y-1">
      <div className="flex items-center space-x-1.5">
        {Icon && <Icon className="h-3 w-3 text-gray-500 dark:text-gray-400" />}
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
      </div>
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-0.5 rounded transition-colors ${
              star <= value
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'
            }`}
          >
            <Star className="h-4 w-4 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  // Compact modal styles
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl mx-2">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 px-3 py-2.5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                <Star className="h-3 w-3 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Leave a Review</h2>
                <p className="text-green-100 text-xs">
                  Share your experience with {serviceRequest.worker?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-0.5 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="p-3">
          {/* Service Request Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-0.5">{serviceRequest.title}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">{serviceRequest.category}</span>
              <span>Worker: {serviceRequest.worker?.name}</span>
              <span>Budget: ₹{serviceRequest.budget?.toLocaleString()}</span>
            </div>
          </div>
          {error && (
            <div className="mb-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-2 py-1.5 rounded flex items-center text-xs">
              <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mr-2"></div>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Overall Rating */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Overall Rating *</h3>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange('rating', star)}
                      className={`p-0.5 rounded ${
                        star <= formData.rating
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
                {formData.rating > 0 && (
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formData.rating}/5</span>
                )}
              </div>
            </div>
            {/* Detailed Ratings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Detailed Ratings</h3>
              <div className="grid grid-cols-2 gap-2">
                <StarRating
                  value={formData.workQuality}
                  onChange={(value) => handleRatingChange('workQuality', value)}
                  label="Quality"
                  icon={Award}
                />
                <StarRating
                  value={formData.communication}
                  onChange={(value) => handleRatingChange('communication', value)}
                  label="Comm."
                  icon={MessageSquare}
                />
                <StarRating
                  value={formData.timeliness}
                  onChange={(value) => handleRatingChange('timeliness', value)}
                  label="Timeliness"
                  icon={Clock}
                />
                <StarRating
                  value={formData.professionalism}
                  onChange={(value) => handleRatingChange('professionalism', value)}
                  label="Professional"
                  icon={Users}
                />
              </div>
            </div>
            {/* Written Review */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Written Review *</h3>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={3}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-green-500 text-sm resize-none"
                placeholder="Share your experience..."
                required
                maxLength={1000}
              />
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>Min 10 chars</span>
                <span>{formData.comment.length}/1000</span>
              </div>
            </div>
            {/* Recommendation */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Recommend?</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                  className={`flex items-center space-x-1 px-2 py-1 rounded border text-xs ${
                    formData.wouldRecommend
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Yes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                  className={`flex items-center space-x-1 px-2 py-1 rounded border text-xs ${
                    !formData.wouldRecommend
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>No</span>
                </button>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.rating === 0}
                className="px-4 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded text-xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1 inline-block"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;