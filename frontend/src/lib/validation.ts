// Form validation schemas and utilities
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  age: string;
  gender: string;
  sexualPreferences: string;
  biography: string;
  interests: string[];
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Common English words that should not be used as passwords
const COMMON_WORDS = [
  'password', 'qwerty', 'welcome', 'admin', 'login', 'user', 'guest', 'hello', 
  'world', 'computer', 'internet', 'email', 'phone', 'money', 'love', 'happy',
  'beautiful', 'amazing', 'awesome', 'wonderful', 'great', 'good', 'nice', 'cool',
  'hot', 'cold', 'big', 'small', 'house', 'car', 'dog', 'cat', 'music', 'movie',
  'book', 'game', 'food', 'water', 'fire', 'light', 'dark', 'red', 'blue', 'green',
  'black', 'white', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey'
];

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  // Check for common English words
  const lowerPassword = password.toLowerCase();
  for (const word of COMMON_WORDS) {
    if (lowerPassword.includes(word)) {
      return { isValid: false, message: 'Password cannot contain common English words' };
    }
  }
  
  return { isValid: true };
};

export const validateAge = (age: string | number): boolean => {
  const numAge = typeof age === 'string' ? parseInt(age) : age;
  return !isNaN(numAge) && numAge >= 18 && numAge <= 100;
};

export const validateUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateName = (name: string): boolean => {
  // 2-50 characters, letters, spaces, hyphens, and apostrophes only
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  return nameRegex.test(name);
};

export const validateBiography = (bio: string): boolean => {
  return bio.length >= 10 && bio.length <= 500;
};

// Login form validation
export const validateLoginForm = (data: LoginFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.username) {
    errors.username = 'Username is required';
  } else if (!validateUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Registration form validation
export const validateRegisterForm = (data: RegisterFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // First Name
  if (!data.firstName) {
    errors.firstName = 'First name is required';
  } else if (!validateName(data.firstName)) {
    errors.firstName = 'First name must be 2-50 characters and contain only letters';
  }
  
  // Last Name
  if (!data.lastName) {
    errors.lastName = 'Last name is required';
  } else if (!validateName(data.lastName)) {
    errors.lastName = 'Last name must be 2-50 characters and contain only letters';
  }
  
  // Username
  if (!data.username) {
    errors.username = 'Username is required';
  } else if (!validateUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  }
  
  // Email
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Password
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message || 'Invalid password';
    }
  }
  
  // Confirm Password
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Profile form validation
export const validateProfileForm = (data: ProfileFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // First Name
  if (!data.firstName) {
    errors.firstName = 'First name is required';
  } else if (!validateName(data.firstName)) {
    errors.firstName = 'First name must be 2-50 characters and contain only letters';
  }
  
  // Last Name
  if (!data.lastName) {
    errors.lastName = 'Last name is required';
  } else if (!validateName(data.lastName)) {
    errors.lastName = 'Last name must be 2-50 characters and contain only letters';
  }
  
  // Username
  if (!data.username) {
    errors.username = 'Username is required';
  } else if (!validateUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  }
  
  // Email
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Age
  if (!data.age) {
    errors.age = 'Age is required';
  } else if (!validateAge(data.age)) {
    errors.age = 'Age must be between 18 and 100';
  }
  
  // Gender
  if (!data.gender) {
    errors.gender = 'Gender is required';
  }
  
  // Sexual Preferences
  if (!data.sexualPreferences) {
    errors.sexualPreferences = 'Sexual preference is required';
  }
  
  // Biography
  if (data.biography && !validateBiography(data.biography)) {
    errors.biography = 'Biography must be between 10 and 500 characters';
  }
  
  // Interests
  if (data.interests && data.interests.length > 10) {
    errors.interests = 'Maximum of 10 interests allowed';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Search form validation (filter shape used by search UI)
interface SearchFiltersInput {
  ageMin?: number;
  ageMax?: number;
  fameMin?: number;
  fameMax?: number;
  distance?: number;
}

export const validateSearchFilters = (filters: SearchFiltersInput): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (filters.ageMin != null && filters.ageMax != null && filters.ageMin > filters.ageMax) {
    errors.age = 'Minimum age cannot be greater than maximum age';
  }
  
  if (filters.fameMin != null && filters.fameMax != null && filters.fameMin > filters.fameMax) {
    errors.fame = 'Minimum fame cannot be greater than maximum fame';
  }
  
  if (filters.distance != null && (filters.distance < 1 || filters.distance > 500)) {
    errors.distance = 'Distance must be between 1 and 500 km';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
