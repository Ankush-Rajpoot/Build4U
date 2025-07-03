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
];