import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true,
    unique: true // One review per service request
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  workQuality: {
    type: Number,
    min: 1,
    max: 5
  },
  communication: {
    type: Number,
    min: 1,
    max: 5
  },
  timeliness: {
    type: Number,
    min: 1,
    max: 5
  },
  professionalism: {
    type: Number,
    min: 1,
    max: 5
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  workerResponse: {
    comment: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
reviewSchema.index({ worker: 1, createdAt: -1 });
reviewSchema.index({ client: 1, createdAt: -1 });
reviewSchema.index({ serviceRequest: 1 });
reviewSchema.index({ rating: 1 });

export default mongoose.model('Review', reviewSchema);