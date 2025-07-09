import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Renovation',
      'Repair',
      'Installation',
      'Maintenance',
      'Landscaping',
      'Painting',
      'Cleaning',
      'Electrical',
      'Plumbing',
      'Flooring',
      'Roofing',
      'Carpentry'
    ]
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [1, 'Budget must be at least $1']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  scheduledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  images: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  requiredSkills: [{
    type: String,
    required: true
  }],
  proposals: [{
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker'
    },
    message: String,
    proposedBudget: Number,
    estimatedDuration: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'messages.senderModel'
    },
    senderModel: {
      type: String,
      enum: ['Client', 'Worker']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewedAt: Date,
    // Add all review attributes for direct access
    workQuality: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    wouldRecommend: { type: Boolean }
  }
}, {
  timestamps: true
});

// Index for better query performance
serviceRequestSchema.index({ client: 1, status: 1 });
serviceRequestSchema.index({ worker: 1, status: 1 });
serviceRequestSchema.index({ category: 1, status: 1 });
serviceRequestSchema.index({ createdAt: -1 });

// Middleware to initialize budget tracking when worker is assigned
serviceRequestSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.worker && doc.status === 'accepted') {
    try {
      const { BudgetTracking } = await import('./Payment.js');
      
      // Check if budget tracking already exists
      const existingTracking = await BudgetTracking.findOne({ 
        serviceRequest: doc._id 
      });

      if (!existingTracking) {
        // Create budget tracking entry
        await BudgetTracking.create({
          serviceRequest: doc._id,
          totalBudget: doc.budget,
          remainingBudget: doc.budget
        });
      }
    } catch (error) {
      console.error('Error initializing budget tracking:', error);
    }
  }
});

export default mongoose.model('ServiceRequest', serviceRequestSchema);