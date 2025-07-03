import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      isRead, 
      type 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    if (category) options.category = category;
    if (isRead !== undefined) options.isRead = isRead === 'true';
    if (type) options.type = type;

    const result = await Notification.getUserNotifications(req.user.id, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    const unreadByCategory = await Notification.aggregate([
      {
        $match: {
          recipient: req.user._id,
          isRead: false
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryCounts = {};
    unreadByCategory.forEach(item => {
      categoryCounts[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        total: unreadCount,
        byCategory: categoryCounts
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark multiple notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
export const markMultipleAsRead = async (req, res) => {
  try {
    const { notificationIds = [] } = req.body;

    const result = await Notification.markMultipleAsRead(req.user.id, notificationIds);

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Mark multiple as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete multiple notifications
// @route   DELETE /api/notifications
// @access  Private
export const deleteMultipleNotifications = async (req, res) => {
  try {
    const { notificationIds = [] } = req.body;

    let query = { recipient: req.user.id };
    
    if (notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }

    const result = await Notification.deleteMany(query);

    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Delete multiple notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create notification (Admin/System use)
// @route   POST /api/notifications
// @access  Private (Admin only)
export const createNotification = async (req, res) => {
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
      recipientId,
      recipientModel,
      type,
      title,
      message,
      serviceRequestId,
      priority = 'normal',
      category = 'system',
      data = {}
    } = req.body;

    const notificationData = {
      recipient: recipientId,
      recipientModel,
      sender: req.user.id,
      senderModel: req.userRole === 'client' ? 'Client' : 'Worker',
      type,
      title,
      message,
      priority,
      category,
      data
    };

    if (serviceRequestId) {
      notificationData.serviceRequest = serviceRequestId;
    }

    const notification = await Notification.createNotification(notificationData);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        category: notification.category,
        priority: notification.priority,
        serviceRequestId: notification.serviceRequest?._id,
        sender: notification.sender,
        timestamp: notification.createdAt,
        data: notification.data
      });
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};