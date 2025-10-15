// App constants
export const APP_NAME = 'Matcha';
export const APP_VERSION = '1.0.0';

// Dynamic API URL detection based on current host
const getApiBaseUrl = () => {
  // If we have an explicit environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For client-side, detect the current host
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    // If accessing via private IP, use private IP for backend
    if (currentHost === '10.30.246.128') {
      return 'http://10.30.246.128:5000/api';
    }
    
    // Default to localhost
    return 'http://localhost:5000/api';
  }
  
  // Server-side fallback
  return 'http://localhost:5000/api';
};

// Dynamic Static Files URL detection (for uploads, profile pictures, etc.)
const getStaticBaseUrl = () => {
  // If we have an explicit environment variable, use it
  if (process.env.NEXT_PUBLIC_STATIC_URL) {
    return process.env.NEXT_PUBLIC_STATIC_URL;
  }
  
  // For client-side, detect the current host
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // If accessing via private IP, use private IP for backend
    if (currentHost === '10.30.246.128') {
      return 'http://10.30.246.128:5000';
    }
    
    // Default to localhost
    return 'http://localhost:5000';
  }
  
  // Server-side fallback
  return 'http://localhost:5000';
};

// Dynamic Socket URL detection based on current host
const getSocketUrl = () => {
  // If we have an explicit environment variable, use it
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  
  // For client-side, detect the current host
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // If accessing via private IP, use private IP for backend
    if (currentHost === '10.30.246.128') {
      return 'http://10.30.246.128:5000';
    }
    
    // Default to localhost
    return 'http://localhost:5000';
  }
  
  // Server-side fallback
  return 'http://localhost:5000';
};

// API endpoints (for future backend integration)
export const API_BASE_URL = getApiBaseUrl();
export const STATIC_BASE_URL = getStaticBaseUrl();
export const SOCKET_URL = getSocketUrl();

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    RESEND_VERIFICATION: '/auth/resend-verification',
    ME: '/auth/me',
  },
  PROFILE: {
    ME: '/profile/me',
    LOCATION: '/profile/location',
    PICTURES: '/profile/me/pictures',
    PICTURE_DELETE: (id: string) => `/profile/me/pictures/${id}`,
    INTERESTS: '/profile/me/interests',
    INTEREST_DELETE: (id: string) => `/profile/me/interests/${id}`,
    USER: (username: string) => `/profile/user/${username}`,
    BROWSE: '/profile/browse',
    SEARCH: '/profile/search',
    VIEWS: '/profile/views',
    LIKES_RECEIVED: '/profile/likes/received',
    LIKE: (userId: string) => `/profile/like/${userId}`,
    UNLIKE: (userId: string) => `/profile/like/${userId}`,
    BLOCK: (userId: string) => `/profile/block/${userId}`,
    BLOCKED: '/profile/blocked',
    UNBLOCK: (userId: string) => `/profile/unblock/${userId}`,
    REPORT: (userId: string) => `/profile/report/${userId}`,
  },
} as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
] as const;

// Sexual preference options
export const SEXUAL_PREFERENCE_OPTIONS = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'both', label: 'Everyone' },
] as const;

// Interest options
export const INTEREST_OPTIONS = [
  { value: 'photography', label: 'Photography' },
  { value: 'travel', label: 'Travel' },
  { value: 'music', label: 'Music' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'reading', label: 'Reading' },
  { value: 'art', label: 'Art' },
  { value: 'movies', label: 'Movies' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'dancing', label: 'Dancing' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'nature', label: 'Nature' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'writing', label: 'Writing' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'wine', label: 'Wine' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'beach', label: 'Beach' },
  { value: 'camping', label: 'Camping' },
  { value: 'motorcycles', label: 'Motorcycles' },
  { value: 'cats', label: 'Cats' },
  { value: 'dogs', label: 'Dogs' },
] as const;

// Age limits
export const AGE_LIMITS = {
  MIN: 18,
  MAX: 100,
} as const;

// Photo limits
export const PHOTO_LIMITS = {
  MAX_PHOTOS: 5,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const;

// Validation rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  BIOGRAPHY: {
    MAX_LENGTH: 500,
  },
} as const;

// Search and filter settings
export const SEARCH_SETTINGS = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 500,
  RESULTS_PER_PAGE: 20,
  MAX_DISTANCE: 500,
  DEFAULT_FILTERS: {
    ageMin: 18,
    ageMax: 35,
    distance: 50,
    fameMin: 0,
    fameMax: 100,
  },
} as const;

// Fame rating system
export const FAME_SYSTEM = {
  ACTIONS: {
    PROFILE_VIEW: 1,
    LIKE_RECEIVED: 3,
    MATCH_MADE: 5,
    MESSAGE_SENT: 2,
    PROFILE_COMPLETED: 10,
    PHOTO_ADDED: 2,
    UNLIKE_RECEIVED: -2,
    REPORT_RECEIVED: -10,
    BLOCK_RECEIVED: -5,
  },
  THRESHOLDS: {
    BRONZE: 0,
    SILVER: 50,
    GOLD: 150,
    PLATINUM: 300,
    DIAMOND: 500,
  },
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  MATCH: 'match',
  MESSAGE: 'message',
  PROFILE_VIEW: 'profile_view',
  UNLIKE: 'unlike',
  REPORT: 'report',
  SYSTEM: 'system',
} as const;

// Chat settings
export const CHAT_SETTINGS = {
  MAX_MESSAGE_LENGTH: 1000,
  MESSAGES_PER_PAGE: 50,
  TYPING_TIMEOUT: 3000,
  ONLINE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'matcha_auth_token',
  USER_PREFERENCES: 'matcha_user_preferences',
  THEME: 'matcha_theme',
  LOCATION: 'matcha_location',
  SEARCH_FILTERS: 'matcha_search_filters',
} as const;

// Socket events
export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  NOTIFICATION: 'notification',
} as const;

// Default settings
export const SETTINGS = {
  THEME: {
    DEFAULT: 'light',
    OPTIONS: ['light', 'dark', 'system'],
  },
  NOTIFICATIONS: {
    PUSH_ENABLED: true,
    EMAIL_ENABLED: true,
    TYPES: {
      LIKES: true,
      MATCHES: true,
      MESSAGES: true,
      PROFILE_VIEWS: true,
    },
  },
  PRIVACY: {
    SHOW_ONLINE_STATUS: true,
    SHOW_LAST_SEEN: true,
    SHOW_DISTANCE: true,
    ALLOW_PROFILE_VIEWS: true,
  },
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 500,
    RESULTS_PER_PAGE: 20,
  },
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  COMPLETE_PROFILE: '/complete-profile',
  BROWSE: '/browse',
  SEARCH: '/search',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  CHAT: '/chat',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
} as const;
