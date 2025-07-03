import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Client', 'Worker']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    enum: ['Client', 'Worker']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'message',
      'status_update',
      'new_job',
      'job_accepted',
      'job_started',
      'job_completed',
      'job_cancelled',
      'payment_received',
      'review_received',
      'system_announcement'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  category: {
    type: String,
    enum: ['job', 'message', 'system', 'payment', 'review'],
    default: 'job'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ serviceRequest: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ recipient: 1, category: 1, isRead: 1 });

// Virtual for checking if notification is recent (within 24 hours)
notificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.deliveredAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    
    // Populate sender and recipient for real-time emission
    await notification.populate([
      { path: 'sender', select: 'name email profileImage' },
      { path: 'recipient', select: 'name email' },
      { path: 'serviceRequest', select: 'title status' }
    ]);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    category,
    isRead,
    type
  } = options;

  const query = { recipient: userId };
  
  if (category) query.category = category;
  if (typeof isRead === 'boolean') query.isRead = isRead;
  if (type) query.type = type;

  const notifications = await this.find(query)
    .populate('sender', 'name profileImage')
    .populate('serviceRequest', 'title status')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await this.countDocuments(query);
  const unreadCount = await this.countDocuments({ 
    recipient: userId, 
    isRead: false 
  });

  return {
    notifications,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      unreadCount
    }
  };
};

// Static method to mark multiple notifications as read
notificationSchema.statics.markMultipleAsRead = async function(userId, notificationIds = []) {
  const query = { recipient: userId, isRead: false };
  
  if (notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }

  const result = await this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  });

  return result;
};

export default mongoose.model('Notification', notificationSchema);