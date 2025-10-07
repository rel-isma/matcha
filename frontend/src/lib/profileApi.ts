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
  Interest
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
      return response as ApiResponse<ProfileWithDetails>;
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
      return response as ApiResponse<ProfileWithDetails>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to update profile'
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
      return response as ApiResponse<{ picture: ProfilePicture }>;
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
      return response as ApiResponse<{ message: string }>;
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
      return response as ApiResponse<{ interests: Interest[] }>;
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
      return response as ApiResponse<{ message: string }>;
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
      return response as ApiResponse<{ profile: PublicProfile }>;
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
      return response as ApiResponse<{ message: string }>;
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
      return response as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to unlike user'
      };
    }
  }

  // Block user
  async blockUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.PROFILE.BLOCK(userId));
      return response as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to block user'
      };
    }
  }

  // Report user
  async reportUser(userId: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.PROFILE.REPORT(userId), { reason });
      return response as ApiResponse<{ message: string }>;
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
      return response as ApiResponse<{ oldNeighborhood?: string; newNeighborhood?: string; currentNeighborhood?: string }>;
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
      return response;
    } catch (error: unknown) {
      const profileError = error as ProfileApiError;
      return {
        success: false,
        message: profileError.message || 'Failed to browse profiles'
      };
    }
  }
}

// Create and export a singleton instance
export const profileApi = new ProfileApiClient();
export default profileApi;
