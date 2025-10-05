// Types for authentication and API responses

// User type from backend
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Profile types
export interface Profile {
  id: string;
  userId: string;
  gender?: string;
  sexualPreference?: string;
  bio?: string;
  dateOfBirth?: string;
  fameRating: number;
  latitude?: number;
  longitude?: number;
  locationSource: 'gps' | 'ip' | 'manual';
  neighborhood?: string;
  completeness: number;
  createdAt: string;
  updatedAt: string;
}

export interface Interest {
  id: number;
  name: string;
}

export interface ProfilePicture {
  id: string;
  profileId: string;
  url: string;
  isProfilePic: boolean;
  position: number;
  createdAt: string;
}

export interface ProfileView {
  id: string;
  viewerId?: string;
  viewedUser: string;
  createdAt: string;
}

export interface Like {
  id: string;
  fromUser: string;
  toUser: string;
  createdAt: string;
}

export interface ProfileWithDetails extends Profile {
  interests: Interest[];
  pictures: ProfilePicture[];
}

export interface PublicProfile {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  gender?: string;
  bio?: string;
  dateOfBirth?: string;
  fameRating: number;
  neighborhood?: string;
  completeness: number;
  interests: Interest[];
  pictures: ProfilePicture[];
  createdAt: string;
}

export interface UpdateProfileInput {
  gender?: string;
  sexualPreference?: string;
  bio?: string;
  dateOfBirth?: string;
  latitude?: number;
  longitude?: number;
  locationSource?: 'gps' | 'ip' | 'manual';
  neighborhood?: string;
}

// API Response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Authentication form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Form validation errors
export interface FormErrors {
  [key: string]: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginFormData) => Promise<{ success: boolean; message?: string; data?: any }>;
  register: (userData: RegisterFormData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: () => Promise<void>;
}

// Email verification types
export interface EmailVerificationData {
  token: string;
}

// Password reset types
export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

// Component prop types for UI components
export interface ButtonProps {
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  loading?: boolean;
  className?: string;
  children?: any;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  error?: string;
  icon?: any;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  disabled?: boolean;
  required?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: any;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}
