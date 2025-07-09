import axios from 'axios';
import crypto from 'crypto';

class CashfreeService {
  constructor() {
    this.clientId = process.env.CASHFREE_CLIENT_ID || 'TEST_CLIENT_ID';
    this.clientSecret = process.env.CASHFREE_CLIENT_SECRET || 'TEST_CLIENT_SECRET';
    // Always use sandbox for testing
    this.baseURL = process.env.CASHFREE_ENVIRONMENT === 'production' 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com';
    this.version = '2023-08-01';
    this.isTestMode = process.env.NODE_ENV !== 'production' || process.env.CASHFREE_ENVIRONMENT !== 'production';
    
    // console.log(`[Payment] Cashfree Service initialized in ${this.isTestMode ? 'TEST' : 'PRODUCTION'} mode`);
    // console.log(`[Payment] Base URL: ${this.baseURL}`);
  }

  // Generate authentication headers
  generateHeaders(body = '') {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `POST\n/pg/orders\n\n${timestamp}\n${this.version}`;
    
    const signature = crypto
      .createHmac('sha256', this.clientSecret)
      .update(stringToSign)
      .digest('base64');

    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-version': this.version,
      'x-client-id': this.clientId,
      'x-client-signature': signature,
      'x-client-timestamp': timestamp.toString()
    };
  }

  // Create payment order
  async createOrder({
    orderId,
    orderAmount,
    orderCurrency = 'INR',
    customerDetails,
    orderMeta
  }) {
    try {
      const orderData = {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: orderCurrency,
        customer_details: customerDetails,
        order_meta: orderMeta,
        order_note: `Payment for service request: ${orderMeta.serviceRequestId}`
      };

      const response = await axios.post(
        `${this.baseURL}/pg/orders`,
        orderData,
        { headers: this.generateHeaders(JSON.stringify(orderData)) }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // console.error('Cashfree order creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Verify payment
  async verifyPayment(orderId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/pg/orders/${orderId}`,
        { headers: this.generateHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // console.error('Cashfree payment verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Create payout to worker
  async createPayout({
    transferId,
    amount,
    workerBankDetails,
    purpose = 'service_payment'
  }) {
    try {
      // In test mode, simulate successful payout
      if (this.isTestMode) {
        // console.log(`[Payment Test] Simulating payout: ₹${amount} to ${workerBankDetails.name}`);
        
        // Return mock successful response
        return {
          success: true,
          data: {
            transfer_id: transferId,
            transfer_amount: amount,
            transfer_status: 'SUCCESS',
            transfer_message: 'Test payout successful',
            transfer_mode: 'TEST',
            beneficiary: {
              name: workerBankDetails.name,
              account_number: workerBankDetails.accountNumber,
              ifsc: workerBankDetails.ifsc
            },
            created_at: new Date().toISOString(),
            processed_at: new Date().toISOString()
          }
        };
      }

      const payoutData = {
        transfer_id: transferId,
        transfer_amount: amount,
        transfer_purpose: purpose,
        beneficiary: {
          bene_id: workerBankDetails.beneId,
          name: workerBankDetails.name,
          email: workerBankDetails.email,
          phone: workerBankDetails.phone,
          address1: workerBankDetails.address,
          bank_account: workerBankDetails.accountNumber,
          ifsc: workerBankDetails.ifsc
        }
      };

      const response = await axios.post(
        `${this.baseURL}/payout/v1/directTransfer`,
        payoutData,
        { headers: this.generateHeaders(JSON.stringify(payoutData)) }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // console.error('Cashfree payout error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Check payout status
  async getPayoutStatus(transferId) {
    try {
      // In test mode, return mock status
      if (this.isTestMode) {
        // console.log(`[Payment Test] Checking status for transfer: ${transferId}`);
        
        return {
          success: true,
          data: {
            transfer_id: transferId,
            transfer_status: 'SUCCESS',
            transfer_message: 'Test transfer completed successfully',
            created_at: new Date().toISOString(),
            processed_at: new Date().toISOString()
          }
        };
      }

      const response = await axios.get(
        `${this.baseURL}/payout/v1/transfers/${transferId}`,
        { headers: this.generateHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // console.error('Cashfree payout status error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Calculate platform fee (5% of transaction amount)
  calculatePlatformFee(amount) {
    const feePercentage = process.env.PLATFORM_FEE_PERCENTAGE || 5;
    return Math.round((amount * feePercentage) / 100);
  }

  // Generate unique order ID
  generateOrderId(prefix = 'ORD') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Generate unique transfer ID
  generateTransferId(prefix = 'TXN') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Webhook signature verification
  verifyWebhookSignature(rawBody, signature, timestamp) {
    const expectedSignature = crypto
      .createHmac('sha256', this.clientSecret)
      .update(timestamp + rawBody)
      .digest('base64');
    
    return expectedSignature === signature;
  }
}

export default new CashfreeService();
