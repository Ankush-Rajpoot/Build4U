import Client from '../models/Client.js';
import ServiceRequest from '../models/ServiceRequest.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import { verificationEmail } from '../config/emailTemplates.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, role: 'client' }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new client
// @route   POST /api/clients/register
// @access  Public
export const registerClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, location } = req.body;

    // Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client already exists with this email'
      });
    }

    // Generate verification token - COMMENTED OUT FOR TESTING
    // const verificationToken = crypto.randomBytes(32).toString('hex');
    // const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create client with verification disabled for testing
    const client = await Client.create({
      name,
      email,
      password,
      phone,
      location,
      // verificationToken,
      // verificationTokenExpires,
      isVerified: true // Set to true for testing - no email verification required
    });

    // Send verification email - COMMENTED OUT FOR TESTING
    // const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&role=client`;
    // await sendEmail({
    //   to: client.email,
    //   subject: 'Verify your email',
    //   html: verificationEmail(client.name, verifyUrl)
    // });

    res.status(201).json({
      success: true,
      message: 'Client registered successfully. You can now login directly.', // Updated message
      data: {
        client: { ...client.toJSON(), password: undefined },
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

// @desc    Verify client email
// @route   GET /api/clients/verify
// @access  Public
export const verifyClientEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token missing' });
    }
    const client = await Client.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } });
    if (!client) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    client.isVerified = true;
    client.verificationToken = undefined;
    client.verificationTokenExpires = undefined;
    await client.save();
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Login client
// @route   POST /api/clients/login
// @access  Public
export const loginClient = async (req, res) => {
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

    // Check if client exists and include password for comparison
    const client = await Client.findOne({ email }).select('+password');
    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await client.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Block login if not verified - COMMENTED OUT FOR TESTING
    // if (!client.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email before logging in.'
    //   });
    // }

    const token = generateToken(client._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        client: {
          _id: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          location: client.location,
          profileImage: client.profileImage,
          isVerified: client.isVerified
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

// @desc    Get client profile
// @route   GET /api/clients/profile
// @access  Private
export const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id)
      .populate('serviceRequests')
      .select('-password');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: { client }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update client profile
// @route   PUT /api/clients/profile
// @access  Private
export const updateClientProfile = async (req, res) => {
  try {
    const { name, phone, location, profileImage } = req.body;

    const client = await Client.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        location,
        profileImage
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { client }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get client's service requests
// @route   GET /api/clients/service-requests
// @access  Private
export const getClientServiceRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { client: req.user.id };
    
    // Simple status filtering - no comma-separated values for now
    if (status) {
      query.status = status;
    }

    // console.log('Client service requests query:', query);

    const serviceRequests = await ServiceRequest.find(query)
      .populate('worker', 'name email rating skills')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceRequest.countDocuments(query);

    // console.log(`Found ${serviceRequests.length} requests for client ${req.user.id} with status: ${status || 'all'}`);

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
    console.error('Error fetching client service requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private (Client only)
export const getClientStats = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    // Get all service requests for this client
    const serviceRequests = await ServiceRequest.find({ 
      client: clientId 
    }).populate('review');
    
    // Calculate statistics
    const totalRequests = serviceRequests.length;
    const completedJobs = serviceRequests.filter(req => req.status === 'completed').length;
    const activeJobs = serviceRequests.filter(req => 
      req.status === 'accepted' || req.status === 'in-progress'
    ).length;
    
    // Calculate total spent on completed jobs
    const totalSpent = serviceRequests
      .filter(req => req.status === 'completed')
      .reduce((total, req) => total + (req.budget || 0), 0);
    
    // Calculate average rating given (if client rates workers)
    const reviewedJobs = serviceRequests.filter(req => req.review);
    let averageRating = 0;
    if (reviewedJobs.length > 0) {
      const totalRating = reviewedJobs.reduce((sum, req) => sum + (req.review.rating || 0), 0);
      averageRating = totalRating / reviewedJobs.length;
    }
    
    const stats = {
      totalRequests,
      completedJobs,
      activeJobs,
      totalSpent,
      averageRating: parseFloat(averageRating.toFixed(1))
    };
    
    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client statistics'
    });
  }
};