import Worker from '../models/Worker.js';
import ServiceRequest from '../models/ServiceRequest.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import { verificationEmail } from '../config/emailTemplates.js';
import cloudinary from '../config/cloudinary.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, role: 'worker' }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new worker
// @route   POST /api/workers/register
// @access  Public
export const registerWorker = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, location, skills, experience, hourlyRate } = req.body;

    // Check if worker already exists
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: 'Worker already exists with this email'
      });
    }

    // Generate verification token - COMMENTED OUT FOR TESTING
    // const verificationToken = crypto.randomBytes(32).toString('hex');
    // const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create worker with verification disabled for testing
    const worker = await Worker.create({
      name,
      email,
      password,
      phone,
      location,
      skills,
      experience,
      hourlyRate,
      // verificationToken,
      // verificationTokenExpires,
      isVerified: true // Set to true for testing - no email verification required
    });

    // Send verification email - COMMENTED OUT FOR TESTING
    // const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&role=worker`;
    // await sendEmail({
    //   to: worker.email,
    //   subject: 'Verify your email',
    //   html: verificationEmail(worker.name, verifyUrl)
    // });

    res.status(201).json({
      success: true,
      message: 'Worker registered successfully. You can now login directly.', // Updated message
      data: {
        worker: { ...worker.toJSON(), password: undefined },
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Verify worker email
// @route   GET /api/workers/verify
// @access  Public
export const verifyWorkerEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token missing' });
    }
    const worker = await Worker.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } });
    if (!worker) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    worker.isVerified = true;
    worker.verificationToken = undefined;
    worker.verificationTokenExpires = undefined;
    await worker.save();
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Login worker
// @route   POST /api/workers/login
// @access  Public
export const loginWorker = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if worker exists and include password for comparison
    const worker = await Worker.findOne({ email }).select('+password');
    if (!worker) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await worker.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Block login if not verified - COMMENTED OUT FOR TESTING
    // if (!worker.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email before logging in.'
    //   });
    // }

    const token = generateToken(worker._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        worker: {
          _id: worker._id,
          name: worker.name,
          email: worker.email,
          phone: worker.phone,
          location: worker.location,
          skills: worker.skills,
          experience: worker.experience,
          hourlyRate: worker.hourlyRate,
          rating: worker.rating,
          completedJobs: worker.completedJobs,
          availability: worker.availability,
          profileImage: worker.profileImage,
          isVerified: worker.isVerified
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get worker profile
// @route   GET /api/workers/profile
// @access  Private
export const getWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user.id).select('-password');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.json({
      success: true,
      data: { worker }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private
export const updateWorkerProfile = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      location, 
      skills, 
      experience, 
      hourlyRate, 
      availability, 
      profileImage 
    } = req.body;

    const worker = await Worker.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        location,
        skills,
        experience,
        hourlyRate,
        availability,
        profileImage
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { worker }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get available service requests for worker
// @route   GET /api/workers/available-jobs
// @access  Private
export const getAvailableJobs = async (req, res) => {
  try {
    const { category, minBudget, maxBudget, page = 1, limit = 10 } = req.query;
    
    const query = { status: 'pending' };
    
    if (category) {
      query.category = category;
    }
    
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseInt(minBudget);
      if (maxBudget) query.budget.$lte = parseInt(maxBudget);
    }

    // console.log('Available jobs query:', query);

    const serviceRequests = await ServiceRequest.find(query)
      .populate('client', 'name email phone location profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceRequest.countDocuments(query);

    // console.log(`Found ${serviceRequests.length} available jobs`);

    res.json({
      success: true,
      data: {
        serviceRequests,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching available jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get worker's accepted/current jobs
// @route   GET /api/workers/my-jobs
// @access  Private
export const getWorkerJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { worker: req.user.id };
    
    // Simple status filtering - no comma-separated for now
    if (status) {
      query.status = status;
    }
    // If no status specified, get all jobs assigned to this worker

    // console.log('Worker jobs query:', query);

    const serviceRequests = await ServiceRequest.find(query)
      .populate('client', 'name email phone location profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceRequest.countDocuments(query);

    // console.log(`Found ${serviceRequests.length} jobs for worker ${req.user.id}`);

    res.json({
      success: true,
      data: {
        serviceRequests,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching worker jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get worker's completed jobs
// @route   GET /api/workers/completed-jobs
// @access  Private
export const getCompletedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const query = { 
      worker: req.user.id,
      status: 'completed'
    };

    // console.log('Completed jobs query:', query);

    const serviceRequests = await ServiceRequest.find(query)
      .populate('client', 'name email phone location profileImage')
      .sort({ completedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceRequest.countDocuments(query);

    // console.log(`Found ${serviceRequests.length} completed jobs for worker ${req.user.id}`);

    res.json({
      success: true,
      data: {
        serviceRequests,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching completed jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get completed jobs for which the worker has not uploaded a portfolio entry
// @route   GET /api/workers/completed-jobs-without-portfolio
// @access  Private (Worker only)
export const getCompletedJobsWithoutPortfolio = async (req, res) => {
  try {
    const workerId = req.user.id;
    // Get all completed jobs for this worker
    const completedJobs = await ServiceRequest.find({
      worker: workerId,
      status: 'completed'
    }).sort({ completedDate: -1 });

    // Get all portfolio entries for this worker
    const worker = await Worker.findById(workerId).select('portfolio');
    const portfolioTitles = new Set((worker.portfolio || []).map(p => p.title?.trim().toLowerCase()));

    // Filter jobs that do not have a portfolio entry (by title match)
    const jobsWithoutPortfolio = completedJobs.filter(job => {
      const jobTitle = job.title?.trim().toLowerCase();
      return !portfolioTitles.has(jobTitle);
    });

    res.status(200).json({
      success: true,
      data: jobsWithoutPortfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting jobs without portfolio',
      error: error.message
    });
  }
};

// @desc    Get worker statistics
// @route   GET /api/workers/stats
// @access  Private (Worker only)
export const getWorkerStats = async (req, res) => {
  try {
    const workerId = req.user.id;
    
    // Get all service requests for this worker
    const serviceRequests = await ServiceRequest.find({ 
      worker: workerId 
    }).populate('review');
    
    // Calculate statistics
    const totalJobs = serviceRequests.length;
    const completedJobs = serviceRequests.filter(req => req.status === 'completed').length;
    const activeJobs = serviceRequests.filter(req => 
      req.status === 'accepted' || req.status === 'in-progress'
    ).length;
    
    // Calculate total earned from completed jobs
    const totalEarned = serviceRequests
      .filter(req => req.status === 'completed')
      .reduce((total, req) => total + (req.budget || 0), 0);
    
    // Calculate average rating from reviews
    const reviewedJobs = serviceRequests.filter(req => req.review);
    const totalReviews = reviewedJobs.length;
    
    let averageRating = 0;
    if (totalReviews > 0) {
      const totalRating = reviewedJobs.reduce((sum, req) => sum + (req.review.rating || 0), 0);
      averageRating = totalRating / totalReviews;
    }
    
    const stats = {
      totalJobs,
      completedJobs,
      activeJobs,
      totalEarned,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews
    };
    
    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get worker stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching worker statistics'
    });
  }
};

// @desc    Upload portfolio images after job completion
// @route   POST /api/workers/portfolio
// @access  Private (Worker only)
export const uploadPortfolio = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { title, description, completedDate } = req.body;
    let imageUrls = [];

    // If files are uploaded, upload to Cloudinary
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }

    // Add new portfolio entry to worker
    const portfolioEntry = {
      title,
      description,
      images: imageUrls,
      completedDate: completedDate ? new Date(completedDate) : new Date()
    };

    const worker = await Worker.findByIdAndUpdate(
      workerId,
      { $push: { portfolio: portfolioEntry } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Portfolio entry added',
      data: worker.portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during portfolio upload',
      error: error.message
    });
  }
};

// @desc    Get a worker's portfolio
// @route   GET /api/workers/:id/portfolio
// @access  Public
export const getWorkerPortfolio = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).select('portfolio name profileImage');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.status(200).json({
      success: true,
      data: worker.portfolio || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting portfolio',
      error: error.message
    });
  }
};