import { body, query, param } from 'express-validator';

// Common English words that should not be accepted as passwords
const COMMON_PASSWORDS = [
  'password', '123456', 'password123', 'admin', 'qwerty', 'letmein', 
  'welcome', 'monkey', 'dragon', 'master', 'hello', 'freedom',
  'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley', 'robert',
  'matthew', 'daniel', 'andrew', 'andrea', 'joshua', 'shadow',
  'mustang', 'michael', 'jessica', 'love', 'superman', 'asshole',
  'fuckyou', 'hunter', 'buster', 'soccer', 'hockey', 'killer',
  'george', 'sexy', 'andrew', 'charlie', 'superman', 'dallas',
  'tiger', 'steelers', 'yankees', 'eagles', 'wolverine', 'thunder',
  'cowboy', 'maverick', 'rainbow', 'junior', 'senior', 'genesis',
  'startrek', 'fishing', 'trouble', 'internet', 'service', 'guitar',
  'summer', 'winter', 'spring', 'autumn', 'princess', 'orange',
  'purple', 'yellow', 'green', 'blue', 'red', 'black', 'white'
];

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check maximum length
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for at least one digit
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check against common passwords
  const lowercasePassword = password.toLowerCase();
  if (COMMON_PASSWORDS.some(common => lowercasePassword.includes(common))) {
    errors.push('Password contains common words and is not secure enough');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be less than 20 characters long');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, hyphens, and underscores');
  }
  
  if (/^[0-9]/.test(username)) {
    errors.push('Username cannot start with a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string, fieldName: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push(`${fieldName} is required`);
  } else if (name.trim().length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  } else if (name.trim().length > 50) {
    errors.push(`${fieldName} must be less than 50 characters long`);
  } else if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// User validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters long and contain only letters, numbers, and underscores'),
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name is required and must be less than 50 characters'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
];

export const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
];

// Profile validation rules
export const createProfileValidation = [
  body('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'other'])
    .withMessage('Gender must be one of: male, female, non-binary, other'),
  body('sexualPreference')
    .optional()
    .isIn(['male', 'female', 'both'])
    .withMessage('Sexual preference must be one of: male, female, both'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Bio must be less than 500 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid coordinate between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid coordinate between -180 and 180'),
  body('locationSource')
    .optional()
    .isIn(['gps', 'ip', 'manual'])
    .withMessage('Location source must be one of: gps, ip, manual'),
  body('neighborhood')
    .optional()
    .isLength({ max: 128 })
    .trim()
    .withMessage('Neighborhood must be less than 128 characters'),
];

export const updateProfileValidation = [
  body('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'other'])
    .withMessage('Gender must be one of: male, female, non-binary, other'),
  body('sexualPreference')
    .optional()
    .isIn(['male', 'female', 'both'])
    .withMessage('Sexual preference must be one of: male, female, both'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Bio must be less than 500 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid coordinate between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid coordinate between -180 and 180'),
  body('locationSource')
    .optional()
    .isIn(['gps', 'ip', 'manual'])
    .withMessage('Location source must be one of: gps, ip, manual'),
  body('neighborhood')
    .optional()
    .isLength({ max: 128 })
    .trim()
    .withMessage('Neighborhood must be less than 128 characters'),
];

export const addInterestsValidation = [
  body('interests')
    .isArray({ min: 1, max: 10 })
    .withMessage('Interests must be an array of 1-10 items'),
  body('interests.*')
    .isString()
    .isLength({ min: 2, max: 30 })
    .trim()
    .matches(/^[a-zA-Z0-9\s-_]+$/)
    .withMessage('Each interest must be 2-30 characters and contain only letters, numbers, spaces, hyphens, and underscores'),
];

export const browseValidation = [
  query('minAge')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Minimum age must be between 18 and 100'),
  query('maxAge')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Maximum age must be between 18 and 100'),
  query('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'other'])
    .withMessage('Gender must be one of: male, female, non-binary, other'),
  query('fameRating')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Fame rating must be between 0 and 100'),
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid coordinate'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid coordinate'),
  query('radiusKm')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Radius must be between 1 and 1000 km'),
  query('sortBy')
    .optional()
    .isIn(['age', 'fame', 'distance', 'common_interests'])
    .withMessage('Sort by must be one of: age, fame, distance, common_interests'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

export const reportUserValidation = [
  param('targetUserId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Reason must be less than 500 characters'),
];

export const userIdParamValidation = [
  param('targetUserId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

export const usernameParamValidation = [
  param('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be valid'),
];

export const pictureIdParamValidation = [
  param('pictureId')
    .isUUID()
    .withMessage('Picture ID must be a valid UUID'),
];

export const interestIdParamValidation = [
  param('interestId')
    .isInt({ min: 1 })
    .withMessage('Interest ID must be a positive integer'),
];
