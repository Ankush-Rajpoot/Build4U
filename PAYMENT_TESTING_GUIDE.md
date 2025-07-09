# Payment System Test Guide

## Overview
The payment system is currently configured for **TESTING MODE ONLY**. No real money will be transferred.

## Testing Configuration

### Backend (.env)
```
CASHFREE_ENVIRONMENT=sandbox
CASHFREE_CLIENT_ID=TEST_CLIENT_ID_REPLACE_WITH_ACTUAL
CASHFREE_CLIENT_SECRET=TEST_CLIENT_SECRET_REPLACE_WITH_ACTUAL
PLATFORM_FEE_PERCENTAGE=5
```

### Test Mode Features
- All payments are simulated
- No real bank accounts required
- Mock bank details are used if worker hasn't set up bank details
- Visual indicators show "TEST MODE" in the UI
- Console logs show payment simulation details

## How to Test

### 1. Create a Service Request (Client)
- Login as a client
- Create a new service request with a budget
- Post the request

### 2. Accept Request (Worker)
- Login as a worker
- Find the service request
- Send a proposal
- Wait for client to accept

### 3. Start Work (Worker)
- Once accepted, start the work
- Status changes to "in-progress"

### 4. Request Payment (Worker)
- Click "Request Payment" button on the job card
- Enter amount and description
- Submit payment request

### 5. Approve Payment (Client)
- Login as client
- View pending payment requests
- Approve or decline the request

### 6. View Payment History
- Both client and worker can view:
  - Budget overview
  - Payment requests
  - Transaction history
  - Remaining budget

## Test Data
In test mode, the system uses these mock bank details:
```
Account Number: 1234567890
IFSC Code: TEST0000001
Bank Name: Test Bank
```

## Console Logs
Watch the backend console for test payment logs:
```
[Payment] Cashfree Service initialized in TEST mode
[Payment Test] Simulating payout: ₹1000 to John Doe
[Payment Test] Checking status for transfer: TXN_1234567890_abc123
```

## Moving to Production
To enable real payments:
1. Get actual Cashfree credentials
2. Set `CASHFREE_ENVIRONMENT=production` in .env
3. Set `NODE_ENV=production`
4. Workers must add real bank details
5. Test with small amounts first

## API Endpoints
- `POST /api/payments/request` - Create payment request
- `GET /api/payments/requests/:serviceRequestId` - Get payment requests
- `POST /api/payments/respond/:requestId` - Approve/decline payment
- `GET /api/payments/history/:serviceRequestId` - Get payment history
- `GET /api/payments/stats` - Get user payment statistics
- `POST /api/payments/webhook/cashfree` - Cashfree webhook

## Payment Flow
1. Worker requests payment
2. Client receives notification
3. Client approves payment
4. System processes payout (simulated in test mode)
5. Both parties receive confirmation
6. Budget tracking is updated
7. Transaction is recorded
