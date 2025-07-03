import Review from '../models/Review.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Worker from '../models/Worker.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/email.js';
import { reviewNotificationEmail } from '../config/emailTemplates.js';

// @desc    Create a review for a completed service request
// @route   POST /api/reviews
// @access  Private (Client only)
export const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      serviceRequestId, 
      rating, 
      comment, 
      workQuality, 
      communication, 
      timeliness, 
      professionalism,
      wouldRecommend 
    } = req.body;

    // Verify service request exists and is completed
    const serviceRequest = await ServiceRequest.findById(serviceRequestId)
      .populate('client', 'name')
      .populate('worker', 'name');

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check if user is the client for this request
    if (serviceRequest.client._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this service request'
      });
    }

    // Check if service request is completed
    if (serviceRequest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed service requests'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ serviceRequest: serviceRequestId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this service request'
      });
    }

    // Create review
    const review = await Review.create({
      serviceRequest: serviceRequestId,
      client: req.user.id,
      worker: serviceRequest.worker._id,
      rating,
      comment,
      workQuality,
      communication,
      timeliness,
      professionalism,
      wouldRecommend,
      isPublic: true
    });

    // Always sync all review attributes to ServiceRequest.review
    await syncReviewToServiceRequest(serviceRequestId);

    // Update worker's rating
    await updateWorkerRating(serviceRequest.worker._id);

    const populatedReview = await Review.findById(review._id)
      .populate('client', 'name profileImage')
      .populate('worker', 'name profileImage')
      .populate('serviceRequest', 'title category');

    // Emit real-time notification to worker
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${serviceRequest.worker._id}`).emit('notification', {
        type: 'review_received',
        title: 'New Review Received',
        message: `${req.user.name} left a ${rating}-star review for "${serviceRequest.title}"`,
        serviceRequestId: serviceRequestId,
        reviewId: review._id,
        timestamp: new Date()
      });
      // console.log(`Emitted review notification to worker ${serviceRequest.worker._id}`);
    }
    // Send email to worker about the new review
    const worker = await Worker.findById(serviceRequest.worker._id);
    if (worker && worker.email) {
      await sendEmail({
        to: worker.email,
        subject: 'You received a new review',
        html: reviewNotificationEmail({
          workerName: worker.name,
          jobTitle: serviceRequest.title,
          rating,
          comment,
          link: `${process.env.FRONTEND_URL}/jobs/${serviceRequest._id}`
        })
      });
      // console.log('Review notification email sent to worker:', worker.email);
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review: populatedReview }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
export const getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    // If workerId is not provided (worker getting their own reviews), use the logged-in user's ID
    const targetWorkerId = workerId || req.user.id;

    const query = { worker: targetWorkerId, isPublic: true };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate('client', 'name profileImage')
      .populate('serviceRequest', 'title category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { worker: new mongoose.Types.ObjectId(targetWorkerId), isPublic: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          averageWorkQuality: { $avg: '$workQuality' },
          averageCommunication: { $avg: '$communication' },
          averageTimeliness: { $avg: '$timeliness' },
          averageProfessionalism: { $avg: '$professionalism' },
          recommendationRate: { $avg: { $cond: ['$wouldRecommend', 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        statistics: ratingStats[0] || {
          averageRating: 0,
          totalReviews: 0,
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
          averageWorkQuality: 0,
          averageCommunication: 0,
          averageTimeliness: 0,
          averageProfessionalism: 0,
          recommendationRate: 0
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get worker reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get reviews by client
// @route   GET /api/reviews/client
// @access  Private (Client only)
export const getClientReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ client: req.user.id })
      .populate('worker', 'name profileImage skills')
      .populate('serviceRequest', 'title category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ client: req.user.id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get client reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Client only - own reviews)
export const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the client who wrote this review
    if (review.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { 
      rating, 
      comment, 
      workQuality, 
      communication, 
      timeliness, 
      professionalism,
      wouldRecommend 
    } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        rating,
        comment,
        workQuality,
        communication,
        timeliness,
        professionalism,
        wouldRecommend
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('client', 'name profileImage')
     .populate('worker', 'name profileImage')
     .populate('serviceRequest', 'title category');

    // Always sync all review attributes to ServiceRequest.review
    await syncReviewToServiceRequest(review.serviceRequest);

    // Update worker's rating
    await updateWorkerRating(review.worker);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Client only - own reviews)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the client who wrote this review
    if (review.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Remove review from service request
    await ServiceRequest.findByIdAndUpdate(review.serviceRequest, {
      $unset: { review: 1 }
    });

    // Update worker's rating
    await updateWorkerRating(review.worker);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Worker response to a review
// @route   PUT /api/reviews/:id/response
// @access  Private (Worker only)
export const respondToReview = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response comment is required'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the worker for this review
    if (review.worker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        'workerResponse.comment': comment.trim(),
        'workerResponse.respondedAt': new Date()
      },
      { new: true }
    ).populate('client', 'name profileImage')
     .populate('worker', 'name profileImage')
     .populate('serviceRequest', 'title category');

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get review for a specific service request
// @route   GET /api/reviews/by-service-request/:serviceRequestId
// @access  Private (Client or Worker)
export const getReviewByServiceRequestId = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    // console.log('--- [getReviewByServiceRequestId] Route hit ---');
    // console.log('serviceRequestId param:', serviceRequestId);

    // Ensure ObjectId type for query
    const srId = mongoose.Types.ObjectId.isValid(serviceRequestId)
      ? new mongoose.Types.ObjectId(serviceRequestId)
      : serviceRequestId;

    // Log the query being made
    // console.log('Querying Review.findOne with:', { serviceRequest: srId });

    const review = await Review.findOne({ serviceRequest: srId })
      .populate('client', 'name profileImage')
      .populate('worker', 'name profileImage')
      .populate('serviceRequest', 'title category');

    if (!review) {
      // console.log(`[getReviewByServiceRequestId] No review found for serviceRequestId: ${serviceRequestId}`);
      return res.status(404).json({
        success: false,
        message: 'Review not found for this service request'
      });
    }

    // Log all review attributes for debugging
    // console.log(`[getReviewByServiceRequestId] Review found for serviceRequestId: ${serviceRequestId}`);
    // console.log('- _id:', review._id);
    // console.log('- serviceRequest:', review.serviceRequest?._id || review.serviceRequest);
    // console.log('- client:', review.client?._id || review.client);
    // console.log('- worker:', review.worker?._id || review.worker);
    // console.log('- rating:', review.rating);
    // console.log('- comment:', review.comment);
    // console.log('- workQuality:', review.workQuality);
    // console.log('- communication:', review.communication);
    // console.log('- timeliness:', review.timeliness);
    // console.log('- professionalism:', review.professionalism);
    // console.log('- wouldRecommend:', review.wouldRecommend);
    // console.log('- reviewedAt:', review.reviewedAt || review.createdAt);

    res.json({ success: true, review });
  } catch (error) {
    console.error('Error in getReviewByServiceRequestId:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Utility: Manually recalculate and update all workers' ratings (for admin/maintenance use)
export const recalculateAllWorkerRatings = async (req, res) => {
  try {
    const workers = await Worker.find({});
    for (const worker of workers) {
      await updateWorkerRating(worker._id);
    }
    res.json({ success: true, message: 'All worker ratings recalculated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to update worker's overall rating
const updateWorkerRating = async (workerId) => {
  try {
    // Only count public reviews
    const reviews = await Review.find({ worker: workerId, isPublic: true });

    let totalScore = 0;
    let count = 0;

    reviews.forEach((review) => {
      // Always use main rating (required)
      let sum = 0;
      let n = 0;
      
      if (typeof review.rating === 'number' && review.rating > 0) {
        sum += review.rating;
        n++;
      }
      if (typeof review.workQuality === 'number' && review.workQuality > 0) {
        sum += review.workQuality;
        n++;
      }
      if (typeof review.communication === 'number' && review.communication > 0) {
        sum += review.communication;
        n++;
      }
      if (typeof review.timeliness === 'number' && review.timeliness > 0) {
        sum += review.timeliness;
        n++;
      }
      if (typeof review.professionalism === 'number' && review.professionalism > 0) {
        sum += review.professionalism;
        n++;
      }
      
      // If we have any ratings, calculate average for this review
      if (n > 0) {
        totalScore += sum / n;
        count++;
      }
    });

    const averageRating = count > 0 ? Math.round((totalScore / count) * 10) / 10 : 0;

    // Force update the worker's rating field
    await Worker.findByIdAndUpdate(workerId, {
      $set: {
        'rating.average': averageRating,
        'rating.count': count
      }
    });

    console.log(`Updated worker ${workerId} rating: ${averageRating} (${count} reviews)`);
  } catch (error) {
    console.error('Error updating worker rating:', error);
  }
};

// Utility to sync all review attributes from Review to ServiceRequest.review
const syncReviewToServiceRequest = async (serviceRequestId) => {
  const review = await Review.findOne({ serviceRequest: serviceRequestId });
  if (!review) return;
  const updateData = {
    'review.rating': typeof review.rating === 'number' ? review.rating : null,
    'review.comment': typeof review.comment === 'string' ? review.comment : null,
    'review.reviewedAt': review.createdAt || new Date(),
    'review.workQuality': typeof review.workQuality === 'number' ? review.workQuality : null,
    'review.communication': typeof review.communication === 'number' ? review.communication : null,
    'review.timeliness': typeof review.timeliness === 'number' ? review.timeliness : null,
    'review.professionalism': typeof review.professionalism === 'number' ? review.professionalism : null,
    'review.wouldRecommend': typeof review.wouldRecommend === 'boolean' ? review.wouldRecommend : null
  };
  await ServiceRequest.findByIdAndUpdate(serviceRequestId, updateData);
};