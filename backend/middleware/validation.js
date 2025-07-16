import { body } from 'express-validator';

export const validateClientRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

export const validateWorkerRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('hourlyRate')
    .optional()
    .isNumeric()
    .withMessage('Hourly rate must be a number'),
  body('experience')
    .optional()
    .isNumeric()
    .withMessage('Experience must be a number')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateServiceRequest = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn([
      'Renovation',
      'Repair',
      'Installation',
      'Maintenance',
      'Landscaping',
      'Painting',
      'Cleaning',
      'Electrical',
      'Plumbing',
      'Flooring',
      'Roofing',
      'Carpentry'
    ])
    .withMessage('Please select a valid category'),
  body('budget')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Budget must be at least $1')
<<<<<<< Updated upstream
=======
];

export const validatePaymentRequest = [
  body('serviceRequestId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid service request ID is required'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least ₹1'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Description must be between 5 and 200 characters')
];

export const validatePaymentResponse = [
  body('action')
    .isIn(['approve', 'decline'])
    .withMessage('Action must be either approve or decline'),
  body('declineReason')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Decline reason cannot exceed 300 characters')
];

// Financial validation middleware
export const validateInvoiceCreation = [
  body('paymentRequestId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid payment request ID is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

export const validateInvoicePayment = [
  body('paymentAmount')
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'upi', 'bank_transfer', 'card', 'cheque', 'other'])
    .withMessage('Invalid payment method'),
  body('transactionReference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction reference cannot exceed 100 characters')
];

export const validateExpenseCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('category')
    .isIn([
      'materials',
      'equipment',
      'transportation',
      'accommodation',
      'meals',
      'communication',
      'documentation',
      'permits',
      'insurance',
      'utilities',
      'maintenance',
      'professional_services',
      'office_supplies',
      'marketing',
      'training',
      'other'
    ])
    .withMessage('Please select a valid expense category'),
  body('serviceRequestId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid service request ID is required'),
  body('paymentMethod')
    .isIn(['cash', 'upi', 'bank_transfer', 'card', 'cheque', 'other'])
    .withMessage('Please select a valid payment method'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

export const validateExpenseApproval = [
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Reason must be between 5 and 300 characters when provided'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
>>>>>>> Stashed changes
];