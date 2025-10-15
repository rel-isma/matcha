export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  isVerified: boolean;
  isProfileCompleted: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Profile related types
export interface Profile {
  id: string;
  userId: string;
  gender?: string;
  sexualPreference?: string;
  bio?: string;
  dateOfBirth?: Date;
  fameRating: number;
  latitude?: number;
  longitude?: number;
  locationSource: 'gps' | 'manual' | 'default' | 'ip';
  neighborhood?: string;
  completeness: number;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
}

export interface ProfileView {
  id: string;
  viewerId?: string;
  viewedUser: string;
  viewerIp?: string;
  viewerAgent?: string;
  createdAt: Date;
  // Populated when fetching with viewer details
  viewer?: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export interface Like {
  id: string;
  fromUser: string;
  toUser: string;
  createdAt: Date;
}

export interface Connection {
  id: string;
  userOne: string;
  userTwo: string;
  createdAt: Date;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason?: string;
  createdAt: Date;
}

// Profile DTOs
export interface CreateProfileInput {
  gender?: string;
  sexualPreference?: string;
  bio?: string;
  dateOfBirth?: Date;
  latitude?: number;
  longitude?: number;
  locationSource?: 'gps' | 'manual' | 'default' | 'ip';
  neighborhood?: string;
}

export interface UpdateProfileInput {
  gender?: string;
  sexualPreference?: string;
  bio?: string;
  dateOfBirth?: Date;
  latitude?: number;
  longitude?: number;
  locationSource?: 'gps' | 'manual' | 'default' | 'ip';
  neighborhood?: string;
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
  sexualPreference?: string;
  bio?: string;
  dateOfBirth?: Date;
  fameRating: number;
  neighborhood?: string;
  completeness: number;
  interests: Interest[];
  pictures: ProfilePicture[];
  createdAt: Date;
  isOnline?: boolean;
  lastSeen?: Date;
  isLiked?: boolean;
  hasLikedMe?: boolean;
  isConnected?: boolean;
  isBlocked?: boolean;
}

// Browse and matching types
export interface BrowseFilters {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number; // in kilometers
  fameMin?: number;
  fameMax?: number;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  interests?: string[];
  sortBy?: 'age' | 'location' | 'distance' | 'fame_rating' | 'common_tags' | 'common_interests';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  offset?: number;
}

export interface UserProfile extends PublicProfile {
  age?: number;
  distance?: number; // in kilometers
  commonInterests?: number;
  isLiked?: boolean;
  hasLikedBack?: boolean;
  isBlocked?: boolean;
}

export interface SearchFilters {
  minAge?: number;
  maxAge?: number;
  minFame?: number;
  maxFame?: number;
  tags?: string[];
  city?: string;
  sortBy?: 'age' | 'location' | 'fame' | 'tags';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  offset?: number;
}
