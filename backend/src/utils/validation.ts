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
