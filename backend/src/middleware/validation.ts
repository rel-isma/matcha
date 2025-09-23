import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { validatePassword, validateEmail, validateUsername, validateName } from '../utils/validation';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg
      }))
    });
    return;
  }
  next();
};

export const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      if (!validateEmail(email)) {
        throw new Error('Email format is invalid');
      }
      return true;
    }),
  
  body('username')
    .custom(async (username) => {
      const validation = validateUsername(username);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  body('firstName')
    .custom(async (firstName) => {
      const validation = validateName(firstName, 'First name');
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  body('lastName')
    .custom(async (lastName) => {
      const validation = validateName(lastName, 'Last name');
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  body('password')
    .custom(async (password) => {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  handleValidationErrors
];

export const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  handleValidationErrors
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .custom(async (password) => {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  handleValidationErrors
];
