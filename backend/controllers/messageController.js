import Message from '../models/Message.js';
import ServiceRequest from '../models/ServiceRequest.js';
import { validationResult } from 'express-validator';
import NotificationService from '../services/notificationService.js';

// @desc    Get messages for a service request
// @route   GET /api/messages/:requestId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this service request
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check if user is either the client or worker for this request
    const isAuthorized = serviceRequest.client.toString() === req.user.id || 
                        (serviceRequest.worker && serviceRequest.worker.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these messages'
      });
    }

    const messages = await Message.find({ serviceRequest: requestId })
      .populate('sender', 'name profileImage')
      .populate('recipient', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ serviceRequest: requestId });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { serviceRequestId, message, recipientId, attachments } = req.body;

    // console.log('Send message request:', {
    //   serviceRequestId,
    //   message: message?.substring(0, 50) + '...',
    //   recipientId,
    //   senderId: req.user.id,
    //   senderRole: req.userRole,
    //   hasAttachments: attachments && attachments.length > 0
    // });

    // Verify service request exists and user has access
    const serviceRequest = await ServiceRequest.findById(serviceRequestId)
      .populate('client', 'name')
      .populate('worker', 'name');

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check authorization
    const isAuthorized = serviceRequest.client._id.toString() === req.user.id || 
                        (serviceRequest.worker && serviceRequest.worker._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages for this request'
      });
    }

    // Determine recipient model
    let recipientModel;
    if (req.userRole === 'client') {
      recipientModel = 'Worker';
    } else {
      recipientModel = 'Client';
    }

    // Determine message type and validate
    let messageType = 'text';
    if (attachments && attachments.length > 0) {
      messageType = attachments.some(att => att.fileType && att.fileType.startsWith('image/')) ? 'image' : 'file';
    }

    // Validate that we have either message text or attachments
    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain either text or attachments'
      });
    }

    const newMessage = await Message.create({
      serviceRequest: serviceRequestId,
      sender: req.user.id,
      senderModel: req.userRole === 'client' ? 'Client' : 'Worker',
      recipient: recipientId,
      recipientModel,
      message: message || '', // Allow empty message if there are attachments
      messageType,
      attachments: attachments || []
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name profileImage')
      .populate('recipient', 'name profileImage');

    // Emit real-time message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to request room
      const messageData = {
        _id: populatedMessage._id,
        message: populatedMessage.message,
        messageType: populatedMessage.messageType,
        attachments: populatedMessage.attachments,
        sender: populatedMessage.sender,
        recipient: populatedMessage.recipient,
        createdAt: populatedMessage.createdAt,
        serviceRequest: serviceRequestId
      };

      io.to(`request_${serviceRequestId}`).emit('new_message', messageData);

      // Emit message_notification to recipient's user room
      io.to(`user_${recipientId}`).emit('message_notification', {
        type: 'message',
        serviceRequestId,
        senderId: req.user.id,
        senderName: req.user.name,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        timestamp: new Date()
      });

      // Use NotificationService for persistent notification (optional)
      const notificationService = new NotificationService(io);
      await notificationService.notifyNewMessage(
        serviceRequest,
        req.user,
        { _id: recipientId, name: populatedMessage.recipient?.name, constructor: { modelName: recipientModel } },
        message
      );
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: populatedMessage }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:requestId/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { requestId } = req.params;

    await Message.updateMany(
      {
        serviceRequest: requestId,
        recipient: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};