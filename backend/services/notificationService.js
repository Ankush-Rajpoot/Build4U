import Notification from '../models/Notification.js';

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Create and emit notification
  async createAndEmitNotification(notificationData) {
    try {
      // Create notification in database
      const notification = await Notification.createNotification(notificationData);
      
      // Emit real-time notification
      if (this.io) {
        const socketData = {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          category: notification.category,
          priority: notification.priority,
          serviceRequestId: notification.serviceRequest?._id,
          sender: notification.sender,
          timestamp: notification.createdAt,
          data: notification.data,
          isRead: false
        };

        this.io.to(`user_${notification.recipient}`).emit('notification', socketData);
        // console.log(`Notification emitted to user_${notification.recipient}:`, notification.type);
      }

      return notification;
    } catch (error) {
      console.error('Error creating and emitting notification:', error);
      throw error;
    }
  }

  // Job accepted notification
  async notifyJobAccepted(serviceRequest, worker) {
    return this.createAndEmitNotification({
      recipient: serviceRequest.client._id || serviceRequest.client,
      recipientModel: 'Client',
      sender: worker._id,
      senderModel: 'Worker',
      type: 'job_accepted',
      title: 'Job Accepted',
      message: `${worker.name} has accepted your job: ${serviceRequest.title}`,
      serviceRequest: serviceRequest._id,
      category: 'job',
      priority: 'high',
      data: {
        workerId: worker._id,
        workerName: worker.name,
        jobTitle: serviceRequest.title,
        budget: serviceRequest.budget
      }
    });
  }

  // Job started notification
  async notifyJobStarted(serviceRequest, worker) {
    return this.createAndEmitNotification({
      recipient: serviceRequest.client._id || serviceRequest.client,
      recipientModel: 'Client',
      sender: worker._id,
      senderModel: 'Worker',
      type: 'job_started',
      title: 'Work Started',
      message: `${worker.name} has started working on: ${serviceRequest.title}`,
      serviceRequest: serviceRequest._id,
      category: 'job',
      priority: 'high',
      data: {
        workerId: worker._id,
        workerName: worker.name,
        jobTitle: serviceRequest.title,
        startedAt: new Date()
      }
    });
  }

  // Job completed notification
  async notifyJobCompleted(serviceRequest, worker) {
    return this.createAndEmitNotification({
      recipient: serviceRequest.client._id || serviceRequest.client,
      recipientModel: 'Client',
      sender: worker._id,
      senderModel: 'Worker',
      type: 'job_completed',
      title: 'Job Completed',
      message: `${worker.name} has completed: ${serviceRequest.title}`,
      serviceRequest: serviceRequest._id,
      category: 'job',
      priority: 'high',
      data: {
        workerId: worker._id,
        workerName: worker.name,
        jobTitle: serviceRequest.title,
        completedAt: new Date()
      }
    });
  }

  // Job cancelled notification
  async notifyJobCancelled(serviceRequest, client, worker = null) {
    if (worker) {
      return this.createAndEmitNotification({
        recipient: worker._id,
        recipientModel: 'Worker',
        sender: client._id,
        senderModel: 'Client',
        type: 'job_cancelled',
        title: 'Job Cancelled',
        message: `The job "${serviceRequest.title}" has been cancelled by ${client.name}`,
        serviceRequest: serviceRequest._id,
        category: 'job',
        priority: 'high',
        data: {
          clientId: client._id,
          clientName: client.name,
          jobTitle: serviceRequest.title,
          cancelledAt: new Date()
        }
      });
    }
  }

  // New job available notification (for all workers)
  async notifyNewJobAvailable(serviceRequest, client) {
    // This will be handled differently as it's a broadcast to all workers
    if (this.io) {
      this.io.emit('new_job_available', {
        type: 'new_job',
        requestId: serviceRequest._id,
        title: serviceRequest.title,
        category: serviceRequest.category,
        budget: serviceRequest.budget,
        clientName: client.name,
        location: serviceRequest.location,
        timestamp: new Date()
      });
      // console.log('New job notification broadcasted to all workers');
    }
  }

  // Message notification
  async notifyNewMessage(serviceRequest, sender, recipient, messageContent) {
    return this.createAndEmitNotification({
      recipient: recipient._id,
      recipientModel: recipient.constructor.modelName,
      sender: sender._id,
      senderModel: sender.constructor.modelName,
      type: 'message',
      title: `New message from ${sender.name}`,
      message: messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
      serviceRequest: serviceRequest._id,
      category: 'message',
      priority: 'normal',
      data: {
        senderId: sender._id,
        senderName: sender.name,
        messagePreview: messageContent.substring(0, 50),
        jobTitle: serviceRequest.title
      }
    });
  }

  // System announcement
  async notifySystemAnnouncement(recipientId, recipientModel, title, message, priority = 'normal') {
    return this.createAndEmitNotification({
      recipient: recipientId,
      recipientModel,
      type: 'system_announcement',
      title,
      message,
      category: 'system',
      priority,
      data: {
        isSystemMessage: true
      }
    });
  }

  // Mark notification as delivered
  async markAsDelivered(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (notification) {
        await notification.markAsDelivered();
      }
    } catch (error) {
      console.error('Error marking notification as delivered:', error);
    }
  }

  // Cleanup old notifications (can be run as a cron job)
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      });
      // console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

export default NotificationService;