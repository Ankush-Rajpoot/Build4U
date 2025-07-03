import dotenv from 'dotenv';
dotenv.config();
import cron from 'node-cron';
import mongoose from 'mongoose';
import ServiceRequest from '../models/ServiceRequest.js';
import Client from '../models/Client.js';
import { sendEmail } from '../utils/email.js';
import { reviewReminderEmail } from '../config/emailTemplates.js';

// Connect to DB if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

// Run every hour
cron.schedule('0 * * * *', async () => {
  // console.log('[CRON] Checking for completed jobs without reviews...');
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const jobs = await ServiceRequest.find({
    status: 'completed',
    completedDate: { $lte: oneDayAgo },
    $or: [
      { 'review.rating': { $exists: false } },
      { 'review.rating': null }
    ]
  }).populate('client', 'name email');

  for (const job of jobs) {
    if (job.client && job.client.email) {
      await sendEmail({
        to: job.client.email,
        subject: 'Reminder: Please review your worker',
        html: reviewReminderEmail({
          clientName: job.client.name,
          jobTitle: job.title,
          link: `${process.env.FRONTEND_URL}/requests/${job._id}`
        })
      });
      // console.log(`[CRON] Review reminder sent to ${job.client.email} for job ${job._id}`);
    }
  }
});
