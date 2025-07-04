import ServiceRequest from '../models/ServiceRequest.js';
import Client from '../models/Client.js';
import Worker from '../models/Worker.js';
import { validationResult } from 'express-validator';
import NotificationService from '../services/notificationService.js';
import { sendEmail } from '../utils/email.js';
import { jobStatusEmail, reviewReminderEmail } from '../config/emailTemplates.js';

// @desc    Create a new service request
// @route   POST /api/service-requests
// @access  Private (Client only)
export const createServiceRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, category, budget, location, scheduledDate, requirements, images, requiredSkills } = req.body;

    const serviceRequest = await ServiceRequest.create({
      title,
      description,
      category,
      budget,
      client: req.user.id,
      location,
      scheduledDate,
      requirements,
      images,
      requiredSkills: requiredSkills || []
    });

    // Add service request to client's serviceRequests array
    await Client.findByIdAndUpdate(
      req.user.id,
      { $push: { serviceRequests: serviceRequest._id } }
    );

    const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
      .populate('client', 'name email location');

    // Emit new job notification to all workers using NotificationService
    const io = req.app.get('io');
    if (io) {
      const notificationService = new NotificationService(io);
      await notificationService.notifyNewJobAvailable(serviceRequest, req.user);
    }

    // Send email to client (confirmation)
    const client = await Client.findById(req.user.id);
    if (client && client.email) {
      await sendEmail({
        to: client.email,
        subject: 'Your job has been created',
        html: jobStatusEmail({
          recipientName: client.name,
          jobTitle: title,
          status: 'Created',
          details: description,
          link: `${process.env.FRONTEND_URL}/requests/${serviceRequest._id}`,
          eventTime: serviceRequest.createdAt,
          role: 'client'
        })
      });
    }
    // Send email to all workers (new job available)
    const workers = await Worker.find({ isVerified: true });
    for (const worker of workers) {
      if (worker.email) {
        await sendEmail({
          to: worker.email,
          subject: 'New job available',
          html: jobStatusEmail({
            recipientName: worker.name,
            jobTitle: title,
            status: 'Pending',
            details: description,
            link: `${process.env.FRONTEND_URL}/jobs/${serviceRequest._id}`,
            eventTime: serviceRequest.createdAt,
            role: 'worker'
          })
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: { serviceRequest: populatedRequest }
    });
  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all service requests (with filters)
// @route   GET /api/service-requests
// @access  Private
export const getServiceRequests = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      minBudget, 
      maxBudget, 
      clientId, 
      workerId,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (clientId) query.client = clientId;
    if (workerId) query.worker = workerId;
    
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseInt(minBudget);
      if (maxBudget) query.budget.$lte = parseInt(maxBudget);
    }

    const serviceRequests = await ServiceRequest.find(query)
      .populate('client', 'name email phone location profileImage')
      .populate('worker', 'name email phone skills rating profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        serviceRequests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single service request
// @route   GET /api/service-requests/:id
// @access  Private
export const getServiceRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id)
      .populate('client', 'name email phone location profileImage')
      .populate('worker', 'name email phone skills rating profileImage')
      .populate('proposals.worker', 'name email skills rating');

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Debug: Log the review data being returned
    console.log('ServiceRequest found:', req.params.id);
    console.log('Review data in ServiceRequest:', serviceRequest.review);

    res.json({
      success: true,
      data: { serviceRequest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update service request
// @route   PUT /api/service-requests/:id
// @access  Private (Client only - own requests)
export const updateServiceRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check if user is the client who created this request
    if (serviceRequest.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service request'
      });
    }

    // Don't allow updates if request is already accepted or in progress
    if (['accepted', 'in-progress', 'completed'].includes(serviceRequest.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update service request in ${serviceRequest.status} status. Only pending requests can be edited.`
      });
    }

    const { title, description, category, budget, location, scheduledDate, requirements,images } = req.body;

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        budget,
        location,
        scheduledDate,
        requirements,
        images,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('client', 'name email location');

    // Emit update notification to workers who might be interested
    const io = req.app.get('io');
    if (io) {
      const notificationService = new NotificationService(io);
      await notificationService.notifyNewJobAvailable(updatedRequest, req.user);
    }

    // Send email to client (update confirmation)
    const client = await Client.findById(req.user.id);
    if (client && client.email) {
      await sendEmail({
        to: client.email,
        subject: 'Your job has been updated',
        html: jobStatusEmail({
          recipientName: client.name,
          jobTitle: title,
          status: 'Updated',
          details: description,
          link: `${process.env.FRONTEND_URL}/requests/${serviceRequest._id}`,
          eventTime: updatedRequest.updatedAt,
          role: 'client'
        })
      });
    }
    // Send email to worker (if assigned)
    if (updatedRequest.worker) {
      const worker = await Worker.findById(updatedRequest.worker);
      if (worker && worker.email) {
        await sendEmail({
          to: worker.email,
          subject: 'Job details updated',
          html: jobStatusEmail({
            recipientName: worker.name,
            jobTitle: title,
            status: 'Updated',
            details: description,
            link: `${process.env.FRONTEND_URL}/jobs/${serviceRequest._id}`,
            eventTime: updatedRequest.updatedAt,
            role: 'worker'
          })
        });
      }
    }

    res.json({
      success: true,
      message: 'Service request updated successfully',
      data: { serviceRequest: updatedRequest }
    });
  } catch (error) {
    console.error('Update service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Accept service request (Worker)
// @route   PUT /api/service-requests/:id/accept
// @access  Private (Worker only)
export const acceptServiceRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    if (serviceRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Service request is not available for acceptance'
      });
    }

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      {
        worker: req.user.id,
        status: 'accepted'
      },
      { new: true }
    ).populate('client', 'name email phone location')
     .populate('worker', 'name email phone skills');

    // Emit status update notification using NotificationService
    const io = req.app.get('io');
    if (io) {
      const notificationService = new NotificationService(io);
      await notificationService.notifyJobAccepted(updatedRequest, req.user);
    }

    // Send email to client (worker accepted the job)
    const client = await Client.findById(updatedRequest.client);
    if (client && client.email) {
      await sendEmail({
        to: client.email,
        subject: 'Worker accepted your job',
        html: jobStatusEmail({
          recipientName: client.name,
          jobTitle: updatedRequest.title,
          status: 'Accepted',
          details: `The worker has accepted your job request. You can now discuss the details with them.`,
          link: `${process.env.FRONTEND_URL}/requests/${updatedRequest._id}`,
          eventTime: updatedRequest.updatedAt,
          role: 'client'
        })
      });
    }
    // Send email to worker (acceptance confirmation)
    const worker = await Worker.findById(req.user.id);
    if (worker && worker.email) {
      await sendEmail({
        to: worker.email,
        subject: 'You have accepted a job',
        html: jobStatusEmail({
          recipientName: worker.name,
          jobTitle: updatedRequest.title,
          status: 'Accepted',
          details: `You have successfully accepted the job. Please contact the client to discuss further details.`,
          link: `${process.env.FRONTEND_URL}/jobs/${updatedRequest._id}`,
          eventTime: updatedRequest.updatedAt,
          role: 'worker'
        })
      });
    }

    res.json({
      success: true,
      message: 'Service request accepted successfully',
      data: { serviceRequest: updatedRequest }
    });
  } catch (error) {
    console.error('Accept service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Start work on service request
// @route   PUT /api/service-requests/:id/start
// @access  Private (Worker only)
export const startWork = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    if (serviceRequest.worker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start work on this request'
      });
    }

    if (serviceRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Service request must be accepted before starting work'
      });
    }

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'in-progress' },
      { new: true }
    ).populate('client', 'name email phone location')
     .populate('worker', 'name email phone skills');

    // Emit status update notification using NotificationService
    const io = req.app.get('io');
    if (io) {
      const notificationService = new NotificationService(io);
      await notificationService.notifyJobStarted(updatedRequest, req.user);
    }

    // Send email to client (worker started the job)
    const client = await Client.findById(updatedRequest.client);
    if (client && client.email) {
      await sendEmail({
        to: client.email,
        subject: 'Worker started working on your job',
        html: jobStatusEmail({
          recipientName: client.name,
          jobTitle: updatedRequest.title,
          status: 'In Progress',
          details: `The worker has started working on your job. You can contact them for any queries.`,
          link: `${process.env.FRONTEND_URL}/requests/${updatedRequest._id}`
        })
      });
    }
    // Send email to worker (work start confirmation)
    const worker = await Worker.findById(req.user.id);
    if (worker && worker.email) {
      await sendEmail({
        to: worker.email,
        subject: 'You have started a job',
        html: jobStatusEmail({
          recipientName: worker.name,
          jobTitle: updatedRequest.title,
          status: 'In Progress',
          details: `You have successfully started the job. Please keep the client updated about the progress.`,
          link: `${process.env.FRONTEND_URL}/jobs/${updatedRequest._id}`
        })
      });
    }

    res.json({
      success: true,
      message: 'Work started successfully',
      data: { serviceRequest: updatedRequest }
    });
  } catch (error) {
    console.error('Start work error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Complete service request
// @route   PUT /api/service-requests/:id/complete
// @access  Private (Worker only)
export const completeServiceRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    if (serviceRequest.worker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this request'
      });
    }

    if (serviceRequest.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Service request must be in progress to complete'
      });
    }

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        completedDate: new Date()
      },
      { new: true }
    ).populate('client', 'name email phone location')
     .populate('worker', 'name email phone skills');

    // Update worker's completed jobs count
    await Worker.findByIdAndUpdate(
      req.user.id,
      { $inc: { completedJobs: 1 } }
    );

    // Emit status update notification using NotificationService
    const io = req.app.get('io');
    if (io) {
      const notificationService = new NotificationService(io);
      await notificationService.notifyJobCompleted(updatedRequest, req.user);
    }

    // Send email to client (job completed)
    const client = await Client.findById(updatedRequest.client);
    if (client && client.email) {
      await sendEmail({
        to: client.email,
        subject: 'Your job has been completed',
        html: jobStatusEmail({
          recipientName: client.name,
          jobTitle: updatedRequest.title,
          status: 'Completed',
          details: `The worker has completed the job. You can now review the work and make the payment.`,
          link: `${process.env.FRONTEND_URL}/requests/${updatedRequest._id}`,
          eventTime: updatedRequest.completedDate,
          role: 'client'
        })
      });
      // Schedule review reminder email in 24 hours if not reviewed
      setTimeout(async () => {
        const refreshedRequest = await ServiceRequest.findById(updatedRequest._id);
        if (!refreshedRequest.review || !refreshedRequest.review.rating) {
          await sendEmail({
            to: client.email,
            subject: 'Reminder: Please review your worker',
            html: reviewReminderEmail({
              clientName: client.name,
              jobTitle: updatedRequest.title,
              link: `${process.env.FRONTEND_URL}/requests/${updatedRequest._id}`
            })
          });
          console.log('Review reminder email sent to client:', client.email);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours
    }
    // Send email to worker (completion confirmation)
    const worker = await Worker.findById(req.user.id);
    if (worker && worker.email) {
      await sendEmail({
        to: worker.email,
        subject: 'Job completed successfully',
        html: jobStatusEmail({
          recipientName: worker.name,
          jobTitle: updatedRequest.title,
          status: 'Completed',
          details: `You have successfully completed the job. Please await the client's review and payment.`,
          link: `${process.env.FRONTEND_URL}/jobs/${updatedRequest._id}`,
          eventTime: updatedRequest.completedDate,
          role: 'worker'
        })
      });
    }

    res.json({
      success: true,
      message: 'Service request completed successfully',
      data: { serviceRequest: updatedRequest }
    });
  } catch (error) {
    console.error('Complete service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel service request
// @route   PUT /api/service-requests/:id/cancel
// @access  Private (Client only - own requests)
export const cancelServiceRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    if (serviceRequest.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this service request'
      });
    }

    if (['completed', 'cancelled'].includes(serviceRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel service request in current status'
      });
    }

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('client', 'name email location')
     .populate('worker', 'name email skills');

    // Emit status update notification using NotificationService
    const io = req.app.get('io');
    if (io && updatedRequest.worker) {
      const notificationService = new NotificationService(io);
      await notificationService.notifyJobCancelled(updatedRequest, req.user, updatedRequest.worker);
    }

    // Send email to client (cancellation confirmation)
    const client = await Client.findById(req.user.id);
    if (client && client.email) {
      await sendEmail({
        to: client.email,
        subject: 'Your job has been cancelled',
        html: jobStatusEmail({
          recipientName: client.name,
          jobTitle: updatedRequest.title,
          status: 'Cancelled',
          details: `You have cancelled the job. If this was a mistake, you can create a new job request.`,
          link: `${process.env.FRONTEND_URL}/requests/${updatedRequest._id}`
        })
      });
    }
    // Send email to worker (cancellation notification)
    if (updatedRequest.worker) {
      const worker = await Worker.findById(updatedRequest.worker);
      if (worker && worker.email) {
        await sendEmail({
          to: worker.email,
          subject: 'Job has been cancelled',
          html: jobStatusEmail({
            recipientName: worker.name,
            jobTitle: updatedRequest.title,
            status: 'Cancelled',
            details: `The job has been cancelled by the client. You will not be able to access the job details anymore.`,
            link: `${process.env.FRONTEND_URL}/jobs/${updatedRequest._id}`
          })
        });
      }
    }

    res.json({
      success: true,
      message: 'Service request cancelled successfully',
      data: { serviceRequest: updatedRequest }
    });
  } catch (error) {
    console.error('Cancel service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Worker submits a proposal for a service request
// @route   POST /api/service-requests/:id/proposals
// @access  Private (Worker only)
export const submitProposal = async (req, res) => {
  try {
    const { message, proposedBudget, estimatedDuration } = req.body;
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    // Prevent duplicate proposals
    if (serviceRequest.proposals.some(p => p.worker.toString() === req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this job.' });
    }
    serviceRequest.proposals.push({
      worker: req.user.id,
      message,
      proposedBudget,
      estimatedDuration,
      submittedAt: new Date()
    });
    await serviceRequest.save();
    // Notify client (email/socket can be added here)
    res.json({ success: true, message: 'Proposal submitted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Client selects a worker from proposals
// @route   PUT /api/service-requests/:id/select-worker
// @access  Private (Client only)
export const selectWorkerFromProposals = async (req, res) => {
  try {
    const { workerId } = req.body;
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    if (serviceRequest.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const proposal = serviceRequest.proposals.find(p => p.worker.toString() === workerId);
    if (!proposal) {
      return res.status(400).json({ success: false, message: 'Proposal not found for this worker.' });
    }
    serviceRequest.worker = workerId;
    serviceRequest.status = 'accepted';
    await serviceRequest.save();
    // Notify selected worker and client (email/socket can be added here)
    res.json({ success: true, message: 'Worker selected successfully.', serviceRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Worker sends request for a service request (no proposal)
// @route   POST /api/service-requests/:id/send-request
// @access  Private (Worker only)
export const sendRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    // Prevent duplicate requests
    if (serviceRequest.proposals.some(p => p.worker.toString() === req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already sent a request for this job.' });
    }
    serviceRequest.proposals.push({
      worker: req.user.id,
      submittedAt: new Date()
    });
    await serviceRequest.save();
    res.json({ success: true, message: 'Request sent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all workers who sent requests for a service request
// @route   GET /api/service-requests/:id/worker-requests
// @access  Private (Client only)
export const getWorkerRequests = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id).populate('proposals.worker', 'name email rating profileImage');
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    const workers = serviceRequest.proposals.map(p => {
      const w = p.worker;
      return {
        _id: w._id,
        name: w.name,
        email: w.email,
        rating: w.rating?.average || 0,
        profilePicture: w.profileImage || '',
      };
    });
    res.json({ success: true, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get matching workers for a service request based on skills
// @route   GET /api/service-requests/:id/matching-workers
// @access  Private
export const getMatchingWorkers = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service request not found' 
      });
    }

    let searchSkills = [];
    
    // If the request has specific required skills, use those
    if (serviceRequest.requiredSkills && serviceRequest.requiredSkills.length > 0) {
      searchSkills = serviceRequest.requiredSkills;
    } 
    // Otherwise, use category-based matching for older requests
    else if (serviceRequest.category) {
      // Import skill taxonomy (we need to create a backend version)
      const categorySkillMap = {
        'Renovation': ['Bathroom Renovation', 'Kitchen Renovation', 'Home Extensions', 'General Handyman'],
        'Repair': ['Appliance Repair', 'Furniture Repair', 'Door Repair', 'General Handyman'],
        'Installation': ['Fixture Installation', 'Appliance Installation', 'Hardware Installation'],
        'Maintenance': ['Preventive Maintenance', 'HVAC Maintenance', 'General Maintenance'],
        'Landscaping': ['Garden Design', 'Lawn Care', 'Tree Service', 'Landscape Lighting'],
        'Painting': ['Interior Painting', 'Exterior Painting', 'Cabinet Painting'],
        'Cleaning': ['Deep Cleaning', 'Post-Construction Cleaning', 'Window Cleaning'],
        'Electrical': ['Wiring Installation', 'Outlet Installation', 'Electrical Troubleshooting'],
        'Plumbing': ['Pipe Installation', 'Fixture Installation', 'Leak Repair', 'Emergency Plumbing'],
        'Flooring': ['Hardwood Installation', 'Tile Installation', 'Floor Refinishing'],
        'Roofing': ['Roof Repair', 'Roof Installation', 'Gutter Installation'],
        'Carpentry': ['Custom Cabinetry', 'Trim Installation', 'Deck Building', 'Finish Carpentry']
      };
      
      searchSkills = categorySkillMap[serviceRequest.category] || [serviceRequest.category];
    } else {
      return res.status(400).json({
        success: false,
        message: 'No required skills or category specified for this job'
      });
    }

    console.log('=== MATCHING WORKERS DEBUG ===');
    console.log('Service Request ID:', req.params.id);
    console.log('Service Request Category:', serviceRequest.category);
    console.log('Service Request Required Skills:', serviceRequest.requiredSkills);
    console.log('Search Skills to use:', searchSkills);

    // Find workers who have at least one matching skill
    const matchingWorkers = await Worker.find({
      skills: { $in: searchSkills },
      isVerified: true
    }).select('name email skills experience hourlyRate rating profileImage location createdAt availability');

    console.log('Found matching workers count:', matchingWorkers.length);
    console.log('Matching workers:', matchingWorkers.map(w => ({ name: w.name, skills: w.skills })));

    // Calculate match percentage for each worker
    const workersWithMatchScore = matchingWorkers.map(worker => {
      const workerSkills = worker.skills || [];
      const matchingSkills = workerSkills.filter(skill => 
        searchSkills.includes(skill)
      );
      const matchPercentage = Math.round(
        (matchingSkills.length / searchSkills.length) * 100
      );

      return {
        ...worker.toObject(),
        matchingSkills,
        matchPercentage,
        totalRequiredSkills: searchSkills.length,
        hasAllSkills: matchingSkills.length === searchSkills.length,
        searchMethod: serviceRequest.requiredSkills && serviceRequest.requiredSkills.length > 0 ? 'skills' : 'category'
      };
    });

    // Sort by match percentage (highest first), then by rating
    workersWithMatchScore.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      const aRating = a.rating?.average || 0;
      const bRating = b.rating?.average || 0;
      return bRating - aRating;
    });

    res.json({
      success: true,
      data: {
        requiredSkills: searchSkills,
        matchingWorkers: workersWithMatchScore,
        totalMatches: workersWithMatchScore.length,
        perfectMatches: workersWithMatchScore.filter(w => w.hasAllSkills).length,
        searchMethod: serviceRequest.requiredSkills && serviceRequest.requiredSkills.length > 0 ? 'skills' : 'category'
      }
    });

  } catch (error) {
    console.error('Error finding matching workers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Debug endpoint to check all workers and their skills
// @route   GET /api/service-requests/debug/workers
// @access  Private
export const debugWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({}).select('name email skills isVerified');
    console.log('=== ALL WORKERS DEBUG ===');
    workers.forEach(worker => {
      console.log(`Worker: ${worker.name}, Email: ${worker.email}, Verified: ${worker.isVerified}, Skills:`, worker.skills);
    });

    res.json({
      success: true,
      data: {
        totalWorkers: workers.length,
        workers: workers.map(w => ({
          name: w.name,
          email: w.email,
          skills: w.skills,
          isVerified: w.isVerified
        }))
      }
    });
  } catch (error) {
    console.error('Error in debug workers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};