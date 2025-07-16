import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/database.js';
import clientRoutes from './routes/clientRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
<<<<<<< Updated upstream
=======
import paymentRoutes from './routes/paymentRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import financialAnalyticsRoutes from './routes/financialAnalyticsRoutes.js';
>>>>>>> Stashed changes
import { errorHandler } from './middleware/errorHandler.js';
import Client from './models/Client.js';
import Worker from './models/Worker.js';

dotenv.config();
console.log('--- ENVIRONMENT VARIABLES ---');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('-----------------------------');
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    origin:true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  // origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow all origins
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store connected users
const connectedUsers = new Map();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    let user;
    if (decoded.role === 'client') {
      user = await Client.findById(decoded.id).select('-password');
    } else if (decoded.role === 'worker') {
      user = await Worker.findById(decoded.id).select('-password');
    }

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.userRole}) - ID: ${socket.userId}`);
  
  // Store user connection
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    user: socket.user,
    role: socket.userRole,
    lastSeen: new Date()
  });

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  console.log(`User ${socket.user.name} joined room: user_${socket.userId}`);

  // Always join user room for notifications (redundant, but ensures join)
  socket.join(`user_${socket.userId}`);
  console.log(`User ${socket.user.name} joined room: user_${socket.userId}`);

  // Listen for explicit join_user_room from frontend (for redundancy)
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room: user_${userId}`);
  });

  // Emit online status to relevant users
  socket.broadcast.emit('user_online', {
    userId: socket.userId,
    userRole: socket.userRole,
    userName: socket.user.name
  });

  // Handle joining service request rooms
  socket.on('join_request_room', (requestId) => {
    socket.join(`request_${requestId}`);
    console.log(`${socket.user.name} joined request room: request_${requestId}`);
  });

  // Handle leaving service request rooms
  socket.on('leave_request_room', (requestId) => {
    socket.leave(`request_${requestId}`);
    console.log(`${socket.user.name} left request room: request_${requestId}`);
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { requestId, message, recipientId } = data;
      
      const messageData = {
        requestId,
        senderId: socket.userId,
        senderRole: socket.userRole,
        senderName: socket.user.name,
        message,
        timestamp: new Date()
      };

      // Emit to request room
      io.to(`request_${requestId}`).emit('new_message', messageData);
      
      // Emit to recipient's personal room for notifications
      if (recipientId) {
        io.to(`user_${recipientId}`).emit('message_notification', {
          ...messageData,
          type: 'message',
          serviceRequestId: requestId
        });
        console.log(`Message notification sent to user_${recipientId}`);
      }

      console.log(`Message sent in request ${requestId} by ${socket.user.name}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`request_${data.requestId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.name,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`request_${data.requestId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.name,
      isTyping: false
    });
  });

  // Handle service request status updates
  socket.on('request_status_update', (data) => {
    const { requestId, status, clientId, workerId } = data;
    
    console.log('Status update received:', { requestId, status, clientId, workerId });
    
    // Emit to request room
    io.to(`request_${requestId}`).emit('status_updated', {
      requestId,
      status,
      updatedBy: socket.userId,
      updatedByName: socket.user.name,
      timestamp: new Date()
    });

    // Send notifications to relevant users
    const notificationData = {
      type: 'status_update',
      requestId,
      status,
      message: `Service request status updated to: ${status}`,
      timestamp: new Date()
    };

    if (clientId && clientId !== socket.userId) {
      io.to(`user_${clientId}`).emit('notification', notificationData);
      console.log(`[SOCKET DEBUG] Emitted notification to user_${clientId}:`, notificationData);
    }
    
    if (workerId && workerId !== socket.userId) {
      io.to(`user_${workerId}`).emit('notification', notificationData);
      console.log(`[SOCKET DEBUG] Emitted notification to user_${workerId}:`, notificationData);
    }
  });

  // Handle new service request notifications
  socket.on('new_service_request', (data) => {
    console.log('New service request notification:', data);
    
    // Notify all workers about new service request
    socket.broadcast.emit('new_job_available', {
      type: 'new_job',
      requestId: data.requestId,
      title: data.title,
      category: data.category,
      budget: data.budget,
      clientName: socket.user.name,
      timestamp: new Date()
    });
    
    console.log('New job notification broadcasted to all workers');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name}`);
    
    // Update last seen and remove from connected users
    if (connectedUsers.has(socket.userId)) {
      connectedUsers.delete(socket.userId);
    }

    // Emit offline status
    socket.broadcast.emit('user_offline', {
      userId: socket.userId,
      userRole: socket.userRole,
      userName: socket.user.name,
      lastSeen: new Date()
    });
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for user ${socket.user.name}:`, error);
  });

  // Debug: Log all events received by this socket
  socket.onAny((event, ...args) => {
    if (!['user_typing', 'typing_start', 'typing_stop'].includes(event)) {
      console.log(`[SOCKET DEBUG] Event received: ${event}`, args);
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', financialAnalyticsRoutes);



// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running successfully!',
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is ready for connections`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;