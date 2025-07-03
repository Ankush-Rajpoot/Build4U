const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const baseStyle = `font-family: 'Segoe UI', Arial, sans-serif; border-radius: 8px; box-shadow: 0 2px 8px #e0e7ef; max-width: 480px; margin: 32px auto; padding: 32px 24px; background: #fff;`;
const blueHeader = `background: #2563eb; color: #fff; padding: 16px 0; border-radius: 8px 8px 0 0; text-align: center; font-size: 1.5rem; font-weight: bold; letter-spacing: 1px;`;
const greenHeader = `background: #22c55e; color: #fff; padding: 16px 0; border-radius: 8px 8px 0 0; text-align: center; font-size: 1.5rem; font-weight: bold; letter-spacing: 1px;`;
const buttonStyle = (color) => `display: inline-block; margin: 24px 0 0 0; padding: 12px 32px; background: ${color}; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 1rem;`;

export const verificationEmail = (name, url) => `
  <div style="${baseStyle}">
    <div style="${blueHeader}">Email Verification</div>
    <div style="padding: 24px 0;">
      <p style="font-size: 1.1rem; color: #222;">Hello <b>${name}</b>,</p>
      <p style="color: #444;">Thank you for signing up. Please verify your email by clicking the button below:</p>
      <a href="${url}" style="${buttonStyle('#2563eb')}">Verify Email</a>
      <p style="color: #888; margin-top: 24px; font-size: 0.95rem;">If you did not sign up, please ignore this email.</p>
    </div>
  </div>
`;

export const jobStatusEmail = ({
  recipientName,
  jobTitle,
  status,
  details,
  link,
  eventTime,
  role
}) => {
  const isClient = role === 'client';
  const header = isClient ? blueHeader : greenHeader;
  const btnColor = isClient ? '#2563eb' : '#22c55e';
  return `
    <div style="${baseStyle}">
      <div style="${header}">Job Status Update: ${status}</div>
      <div style="padding: 24px 0;">
        <p style="font-size: 1.1rem; color: #222;">Hello <b>${recipientName}</b>,</p>
        <p style="color: #444;">Your job <b>${jobTitle}</b> is now <b>${status}</b>.</p>
        <p style="color: #444;">Details: ${details}</p>
        ${eventTime ? `<p style='color:#888; font-size:0.98rem;'>Time: <b>${formatDate(eventTime)}</b></p>` : ''}
        <a href="${link}" style="${buttonStyle(btnColor)}">View Job</a>
      </div>
    </div>
  `;
};

export const reviewReminderEmail = ({
  clientName,
  jobTitle,
  link
}) => `
  <div style="${baseStyle}">
    <div style="${blueHeader}">Review Your Worker</div>
    <div style="padding: 24px 0;">
      <p style="font-size: 1.1rem; color: #222;">Hello <b>${clientName}</b>,</p>
      <p style="color: #444;">Your job <b>${jobTitle}</b> has been completed. Please take a moment to review your worker's performance.</p>
      <a href="${link}" style="${buttonStyle('#2563eb')}">Leave a Review</a>
    </div>
  </div>
`;

export const reviewNotificationEmail = ({
  workerName,
  jobTitle,
  rating,
  comment,
  link
}) => `
  <div style="${baseStyle}">
    <div style="${greenHeader}">New Review Received</div>
    <div style="padding: 24px 0;">
      <p style="font-size: 1.1rem; color: #222;">Hello <b>${workerName}</b>,</p>
      <p style="color: #444;">You have received a new review for the job <b>${jobTitle}</b>.</p>
      <p style="color: #444;"><b>Rating:</b> <span style='color:#22c55e; font-weight:600;'>${rating} stars</span></p>
      <p style="color: #444;"><b>Comment:</b> ${comment}</p>
      <a href="${link}" style="${buttonStyle('#22c55e')}">View Review</a>
    </div>
  </div>
`;
