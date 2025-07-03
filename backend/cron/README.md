# Review Reminder Cron Job

This cron job checks every hour for completed service requests that have not been reviewed by the client after 24 hours, and sends a reminder email to the client.

## How to use

1. Make sure your `.env` file contains `MONGODB_URI` and all email config variables.
2. Start the cron job with:

```
node backend/cron/reviewReminderCron.js
```

You can run this as a separate process in production (e.g., with PM2, Docker, or a systemd service).

## Customization
- The schedule is set to run every hour (`0 * * * *`).
- The reminder is sent 24 hours after job completion if no review exists.
- Edit the cron schedule or logic as needed for your business requirements.
