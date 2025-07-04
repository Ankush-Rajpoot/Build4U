import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

console.log('EMAIL CONFIG:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  user: process.env.EMAIL_USER,
  from: process.env.EMAIL_FROM
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  };
  try {
    console.log(`[EMAIL] Sending to: ${to} | Subject: ${subject}`);
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Successfully sent to: ${to} | Subject: ${subject}`);
  } catch (err) {
    console.error(`[EMAIL] FAILED to send to: ${to} | Subject: ${subject}`);
    console.error('[EMAIL] Error:', err);
    throw err;
  }
};
