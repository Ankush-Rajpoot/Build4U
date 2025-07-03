// import ServiceRequest from '../models/ServiceRequest.js';
// import Client from '../models/Client.js';
// import Worker from '../models/Worker.js';
// import { validationResult } from 'express-validator';
// import NotificationService from '../services/notificationService.js';

// // @desc    Create a new service request
// // @route   POST /api/service-requests
// // @access  Private (Client only)
// export const createServiceRequest = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       });
//     }

//     const { title, description, category, budget, location, scheduledDate, requirements } = req.body;

//     const serviceRequest = await ServiceRequest.create({
//       title,
//       description,
//       category,
//       budget,
//       client: req.user.id,
//       location,
//       scheduledDate,
//       requirements
//     });

//     // Add service request to client's serviceRequests array
//     await Client.findByIdAndUpdate(
//       req.user.id,
//       { $push: { serviceRequests: serviceRequest._id } }
//     );

//     const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
//       .populate('client', 'name email location');

//     // Emit new job notification to all workers using NotificationService
//     const io = req.app.get('io');
//     if (io) {
//       const notificationService = new NotificationService(io);
//       await notificationService.notifyNewJobAvailable(serviceRequest, req.user);
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Service request created successfully',
//       data: { serviceRequest: populatedRequest }
//     });
//   } catch (error) {
//     console.error('Create service request error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Get all service requests (with filters)
// // @route   GET /api/service-requests
// // @access  Private
// export const getServiceRequests = async (req, res) => {
//   try {
//     const { 
//       status, 
//       category, 
//       minBudget, 
//       maxBudget, 
//       clientId, 
//       workerId,
//       page = 1, 
//       limit = 10 
//     } = req.query;
    
//     const query = {};
    
//     if (status) query.status = status;
//     if (category) query.category = category;
//     if (clientId) query.client = clientId;
//     if (workerId) query.worker = workerId;
    
//     if (minBudget || maxBudget) {
//       query.budget = {};
//       if (minBudget) query.budget.$gte = parseInt(minBudget);
//       if (maxBudget) query.budget.$lte = parseInt(maxBudget);
//     }

//     const serviceRequests = await ServiceRequest.find(query)
//       .populate('client', 'name email location')
//       .populate('worker', 'name email skills rating')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await ServiceRequest.countDocuments(query);

//     res.json({
//       success: true,
//       data: {
//         serviceRequests,
//         pagination: {
//           current: parseInt(page),
//           pages: Math.ceil(total / limit),
//           total
//         }
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Get single service request
// // @route   GET /api/service-requests/:id
// // @access  Private
// export const getServiceRequest = async (req, res) => {
//   try {
//     const serviceRequest = await ServiceRequest.findById(req.params.id)
//       .populate('client', 'name email phone location profileImage')
//       .populate('worker', 'name email phone skills rating profileImage')
//       .populate('proposals.worker', 'name email skills rating');

//     if (!serviceRequest) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service request not found'
//       });
//     }

//     // Debug: Log the review data being returned
//     console.log('ServiceRequest found:', req.params.id);
//     console.log('Review data in ServiceRequest:', serviceRequest.review);

//     res.json({
//       success: true,
//       data: { serviceRequest }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Update service request
// // @route   PUT /api/service-requests/:id
// // @access  Private (Client only - own requests)
// export const updateServiceRequest = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       });
//     }

//     const serviceRequest = await ServiceRequest.findById(req.params.id);

//     if (!serviceRequest) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service request not found'
//       });
//     }

//     // Check if user is the client who created this request
//     if (serviceRequest.client.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to update this service request'
//       });
//     }

//     // Don't allow updates if request is already accepted or in progress
//     if (['accepted', 'in-progress', 'completed'].includes(serviceRequest.status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot update service request in ${serviceRequest.status} status. Only pending requests can be edited.`
//       });
//     }

//     const { title, description, category, budget, location, scheduledDate, requirements } = req.body;

//     const updatedRequest = await ServiceRequest.findByIdAndUpdate(
//       req.params.id,
//       {
//         title,
//         description,
//         category,
//         budget,
//         location,
//         scheduledDate,
//         requirements,
//         updatedAt: new Date()
//       },
//       {
//         new: true,
//         runValidators: true
//       }
//     ).populate('client', 'name email location');

//     // Emit update notification to workers who might be interested
//     const io = req.app.get('io');
//     if (io) {
//       const notificationService = new NotificationService(io);
//       await notificationService.notifyNewJobAvailable(updatedRequest, req.user);
//     }

//     res.json({
//       success: true,
//       message: 'Service request updated successfully',
//       data: { serviceRequest: updatedRequest }
//     });
//   } catch (error) {
//     console.error('Update service request error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Accept service request (Worker)
// // @route   PUT /api/service-requests/:id/accept
// // @access  Private (Worker only)
// export const acceptServiceRequest = async (req, res) => {
//   try {
//     const serviceRequest = await ServiceRequest.findById(req.params.id);

//     if (!serviceRequest) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service request not found'
//       });
//     }

//     if (serviceRequest.status !== 'pending') {
//       return res.status(400).json({
//         success: false,
//         message: 'Service request is not available for acceptance'
//       });
//     }

//     const updatedRequest = await ServiceRequest.findByIdAndUpdate(
//       req.params.id,
//       {
//         worker: req.user.id,
//         status: 'accepted'
//       },
//       { new: true }
//     ).populate('client', 'name email phone location')
//      .populate('worker', 'name email phone skills');

//     // Emit status update notification using NotificationService
//     const io = req.app.get('io');
//     if (io) {
//       const notificationService = new NotificationService(io);
//       await notificationService.notifyJobAccepted(updatedRequest, req.user);
//     }

//     res.json({
//       success: true,
//       message: 'Service request accepted successfully',
//       data: { serviceRequest: updatedRequest }
//     });
//   } catch (error) {
//     console.error('Accept service request error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Start work on service request
// // @route   PUT /api/service-requests/:id/start
// // @access  Private (Worker only)
// export const startWork = async (req, res) => {
//   try {
//     const serviceRequest = await ServiceRequest.findById(req.params.id);

//     if (!serviceRequest) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service request not found'
//       });
//     }

//     if (serviceRequest.worker.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to start work on this request'
//       });
//     }

//     if (serviceRequest.status !== 'accepted') {
//       return res.status(400).json({
//         success: false,
//         message: 'Service request must be accepted before starting work'
//       });
//     }

//     const updatedRequest = await ServiceRequest.findByIdAndUpdate(
//       req.params.id,
//       { status: 'in-progress' },
//       { new: true }
//     ).populate('client', 'name email phone location')
//      .populate('worker', 'name email phone skills');

//     // Emit status update notification using NotificationService
//     const io = req.app.get('io');
//     if (io) {
//       const notificationService = new NotificationService(io);
//       await notificationService.notifyJobStarted(updatedRequest, req.user);
//     }

//     res.json({
//       success: true,
//       message: 'Work started successfully',
//       data: { serviceRequest: updatedRequest }
//     });
//   } catch (error) {
//     console.error('Start work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Complete service request
// // @route   PUT /api/service-requests/:id/complete
// // @access  Private (Worker only)
// export const completeServiceRequest = async (req, res) => {
//   try {
//     const serviceRequest = await ServiceRequest.findById(req.params.id);

//     if (!serviceRequest) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service request not found'
//       });
//     }

//     if (serviceRequest.worker.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to complete this request'
//       });
//     }

//     if (serviceRequest.status !== 'in-progress') {
//       return res.status(400).json({
//         success: false,
//         message: 'Service request must be in progress to complete'
//       });
//     }

//     const updatedRequest = await ServiceRequest.findByIdAndUpdate(
//       req.params.id,
//       { 
//         status: 'completed',
//         completedDate: new Date()
//       },
//       { new: true }
//     ).populate('client', 'name email phone location')
//      .populate('worker', 'name email phone skills');

//     // Update worker's completed jobs count
//     await Worker.findByIdAndUpdate(
//       req.user.id,
//       { $inc: { completedJobs: 1 } }
//     );

//     // Emit status update notification using NotificationService
//     const io = req.app.get('io');
//     if (io) {
//       const notificationService = new NotificationService(io);
//       await notificationService.notifyJobCompleted(updatedRequest, req.user);
//     }

//     res.json({
//       success: true,
//       message: 'Service request completed successfully',
//       data: { serviceRequest: updatedRequest }
//     });
//   } catch (error) {
//     console.error('Complete service request error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Cancel service request
// // @route   PUT /api/service-requests/:id/cancel
// // @access  Private (Client only - own requests)
// export const cancelServiceRequest = async (req, res) => {
//   try {
//     const serviceRequest = await ServiceRequest.findById(req.params.id);

//     if (!serviceRequest) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service request not found'
//       });
//     }

//     if (serviceRequest.client.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to cancel this service request'
//       });
//     }

//     if (['completed', 'cancelled'].includes(serviceRequest.status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot cancel service request in current status'
//       });
//     }

//     const updatedRequest = await ServiceRequest.findByIdAndUpdate(
//       req.params.id,
//       { status: 'cancelled' },
//       { new: true }
//     ).populate('client', 'name email location')
//      .populate('worker', 'name email skills');

//     // Emit status update notification using NotificationService
//     const io = req.app.get('io');
//     if (io && updatedRequest.worker) {
//       const notificationService = new NotificationService(io);
//       await notificationService.notifyJobCancelled(updatedRequest, req.user, updatedRequest.worker);
//     }

//     res.json({
//       success: true,
//       message: 'Service request cancelled successfully',
//       data: { serviceRequest: updatedRequest }
//     });
//   } catch (error) {
//     console.error('Cancel service request error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // Socket event handlers
// export const socketHandlers = (io) => {
//   io.on('connection', (socket) => {
//     console.log('New socket connection:', socket.id);

//     socket.on('join_user_room', (userId) => {
//       socket.join(`user_${userId}`);
//       console.log(`Socket ${socket.id} joined user room: user_${userId}`);
//     });

//     socket.on('disconnect', () => {
//       console.log('Socket disconnected:', socket.id);
//     });
//   });
// };