// Profile API client
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './constants';
import type { 
  ApiResponse,
  Profile,
  ProfileWithDetails,
  PublicProfile,
  UpdateProfileInput,
  ProfilePicture,
  Interest,
  LikeWithUser
} from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle common response format
api.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      success: false,
      message: error.message || 'Network error'
    });
  }
);

interface ProfileApiError {
  success: false;
  message: string;
}

class ProfileApiClient {
  // Get my profile
  async getMyProfile(): Promise<ApiResponse<ProfileWithDetails>> {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE.ME);
      return response as unknown as ApiResponse<ProfileWithDetails>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to get profile'
      };
    }
  }

  // Update my profile
  async updateMyProfile(profileData: UpdateProfileInput): Promise<ApiResponse<ProfileWithDetails>> {
    try {
      const response = await api.put(API_ENDPOINTS.PROFILE.ME, profileData);
      return response as unknown as ApiResponse<ProfileWithDetails>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to update profile'
      };
    }
  }

  // Update location
  async updateLocation(locationData: {
    city?: string;
    lat: number;
    lon: number;
    source: 'gps' | 'manual' | 'default';
  }): Promise<ApiResponse<{
    latitude: number;
    longitude: number;
    locationSource: string;
    neighborhood?: string;
  }>> {
    try {
      const response = await api.post(API_ENDPOINTS.PROFILE.LOCATION, locationData);
      return response as unknown as ApiResponse<{
        latitude: number;
        longitude: number;
        locationSource: string;
        neighborhood?: string;
      }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to update location'
      };
    }
  }

  // Upload picture
  async uploadPicture(file: File): Promise<ApiResponse<{ picture: ProfilePicture }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post(API_ENDPOINTS.PROFILE.PICTURES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response as unknown as ApiResponse<{ picture: ProfilePicture }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to upload picture'
      };
    }
  }

  // Delete picture
  async deletePicture(pictureId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete(API_ENDPOINTS.PROFILE.PICTURE_DELETE(pictureId));
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to delete picture'
      };
    }
  }

  // Add interests
  async addInterests(interests: string[]): Promise<ApiResponse<{ interests: Interest[] }>> {
    try {
      const response = await api.post(API_ENDPOINTS.PROFILE.INTERESTS, { interests });
      return response as unknown as ApiResponse<{ interests: Interest[] }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to add interests'
      };
    }
  }

  // Remove interest
  async removeInterest(interestId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete(API_ENDPOINTS.PROFILE.INTEREST_DELETE(interestId));
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to remove interest'
      };
    }
  }

  // Get public profile by username
  async getPublicProfile(username: string): Promise<ApiResponse<{ profile: PublicProfile }>> {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE.USER(username));
      return response as unknown as ApiResponse<{ profile: PublicProfile }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to get profile'
      };
    }
  }

  // Like user
  async likeUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.PROFILE.LIKE(userId));
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to like user'
      };
    }
  }

  // Unlike user
  async unlikeUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete(API_ENDPOINTS.PROFILE.UNLIKE(userId));
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to unlike user'
      };
    }
  }

  // Get likes received
  async getLikesReceived(): Promise<ApiResponse<LikeWithUser[]>> {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE.LIKES_RECEIVED);
      return response as unknown as ApiResponse<LikeWithUser[]>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to get likes received'
      };
    }
  }

  // Get profile views
  async getProfileViews(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    views: Array<{
      id: string;
      viewerId?: string;
      createdAt: Date;
      viewer?: {
        username: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
      };
    }>;
    total: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  }>> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await api.get(`${API_ENDPOINTS.PROFILE.VIEWS}?${params.toString()}`);
      return response as unknown as ApiResponse<{
        views: Array<{
          id: string;
          viewerId?: string;
          createdAt: Date;
          viewer?: {
            username: string;
            firstName: string;
            lastName: string;
            profilePicture?: string;
          };
        }>;
        total: number;
        hasMore: boolean;
        currentPage: number;
        totalPages: number;
      }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to get profile views'
      };
    }
  }

  // Block user
  async blockUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.PROFILE.BLOCK(userId));
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to block user'
      };
    }
  }

  // Get blocked users
  async getBlockedUsers(): Promise<ApiResponse<Array<{
    id: string;
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    blockedAt: Date;
  }>>> {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE.BLOCKED);
      return response as unknown as ApiResponse<Array<{
        id: string;
        userId: string;
        username: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        blockedAt: Date;
      }>>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to get blocked users'
      };
    }
  }

  // Unblock user
  async unblockUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete(API_ENDPOINTS.PROFILE.UNBLOCK(userId));
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to unblock user'
      };
    }
  }

  // Report user
  async reportUser(userId: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.PROFILE.REPORT(userId), { reason });
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to report user'
      };
    }
  }

  // Fix coordinate-based neighborhoods
  async fixNeighborhoods(): Promise<ApiResponse<{ oldNeighborhood?: string; newNeighborhood?: string; currentNeighborhood?: string }>> {
    try {
      const response = await api.patch('/profile/fix-neighborhoods');
      return response as unknown as ApiResponse<{ oldNeighborhood?: string; newNeighborhood?: string; currentNeighborhood?: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to fix neighborhoods'
      };
    }
  }

  // Browse profiles with filters
  async browseProfiles(filters: {
    minAge?: number;
    maxAge?: number;
    maxDistance?: number;
    fameMin?: number;
    fameMax?: number;
    interests?: string[];
    sortBy?: 'age' | 'location' | 'fame_rating' | 'common_tags';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    profiles: Array<{
      id: string;
      userId: string;
      username: string;
      firstName: string;
      lastName: string;
      age?: number;
      gender?: string;
      bio?: string;
      fameRating: number;
      neighborhood?: string;
      distance?: number;
      commonInterests?: number;
      interests: Array<{ id: number; name: string }>;
      pictures: Array<{ 
        id: string; 
        url: string; 
        isProfilePic: boolean; 
        position: number 
      }>;
      isLiked?: boolean;
      hasLikedBack?: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      hasMore: boolean;
    };
  }>> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.minAge) params.append('minAge', filters.minAge.toString());
      if (filters.maxAge) params.append('maxAge', filters.maxAge.toString());
      if (filters.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
      if (filters.fameMin) params.append('fameMin', filters.fameMin.toString());
      if (filters.fameMax) params.append('fameMax', filters.fameMax.toString());
      if (filters.interests?.length) {
        filters.interests.forEach(interest => params.append('interests', interest));
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`${API_ENDPOINTS.PROFILE.BROWSE}?${params.toString()}`);
      return response as unknown as ApiResponse<{
        profiles: Array<{
          id: string;
          userId: string;
          username: string;
          firstName: string;
          lastName: string;
          age?: number;
          gender?: string;
          bio?: string;
          fameRating: number;
          neighborhood?: string;
          distance?: number;
          commonInterests?: number;
          interests: Array<{ id: number; name: string }>;
          pictures: Array<{ id: string; url: string; isProfilePic: boolean; position: number }>;
          isLiked?: boolean;
          hasLikedBack?: boolean;
        }>;
        pagination: { page: number; limit: number; hasMore: boolean };
      }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to browse profiles'
      };
    }
  }

  // Search profiles with manual filters (no algorithm)
  async searchProfiles(filters: {
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
  }): Promise<ApiResponse<{
    profiles: Array<{
      id: string;
      userId: string;
      username: string;
      firstName: string;
      lastName: string;
      age?: number;
      gender?: string;
      bio?: string;
      fameRating: number;
      neighborhood?: string;
      distance?: number;
      commonInterests?: number;
      interests: Array<{ id: number; name: string }>;
      pictures: Array<{ 
        id: string; 
        url: string; 
        isProfilePic: boolean; 
        position: number 
      }>;
      isLiked?: boolean;
      hasLikedBack?: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      hasMore: boolean;
    };
  }>> {
    try {
      const params = new URLSearchParams();
      
      // Add search filters to params
      if (filters.minAge) params.append('minAge', filters.minAge.toString());
      if (filters.maxAge) params.append('maxAge', filters.maxAge.toString());
      if (filters.minFame) params.append('minFame', filters.minFame.toString());
      if (filters.maxFame) params.append('maxFame', filters.maxFame.toString());
      if (filters.tags?.length) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.city) params.append('city', filters.city);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`${API_ENDPOINTS.PROFILE.SEARCH}?${params.toString()}`);
      return response as unknown as ApiResponse<{
        profiles: Array<{
          id: string;
          userId: string;
          username: string;
          firstName: string;
          lastName: string;
          age?: number;
          gender?: string;
          bio?: string;
          fameRating: number;
          neighborhood?: string;
          distance?: number;
          commonInterests?: number;
          interests: Array<{ id: number; name: string }>;
          pictures: Array<{ id: string; url: string; isProfilePic: boolean; position: number }>;
          isLiked?: boolean;
          hasLikedBack?: boolean;
        }>;
        pagination: { page: number; limit: number; hasMore: boolean };
      }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to search profiles'
      };
    }
  }
}

// Create and export a singleton instance
export const profileApi = new ProfileApiClient();
export default profileApi;
