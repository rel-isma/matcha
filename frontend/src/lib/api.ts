// API client for authentication
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './constants';
import type { 
  ApiResponse,
  User,
  LoginFormData,
  RegisterFormData
} from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle common response format and profile completion
api.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    // Handle 403 with profile completion redirect
    if (error.response?.status === 403 && error.response?.data?.redirect) {
      // Redirect to complete profile page
      window.location.href = error.response.data.redirect;
      return Promise.reject({
        success: false,
        message: error.response.data.message || 'Profile completion required',
        redirect: error.response.data.redirect
      });
    }
    
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      success: false,
      message: error.message || 'Network error'
    });
  }
);

interface AuthApiError {
  success: false;
  message: string;
}

class AuthApiClient {
  // Register new user
  async register(userData: RegisterFormData): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(credentials: LoginFormData): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response as unknown as ApiResponse<{ user: User }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Login failed'
      };
    }
  }

  // Logout user
  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Logout failed'
      };
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY, { token });
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Email verification failed'
      };
    }
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH);
      return response as unknown as ApiResponse<{ user: User }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Token refresh failed'
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      return response as unknown as ApiResponse<{ user: User }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to get user data'
      };
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Password reset request failed'
      };
    }
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Password reset failed'
      };
    }
  }

  // Resend verification email
  async resendVerification(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to resend verification email'
      };
    }
  }

  // Update user information
  async updateUser(userData: { firstName: string; lastName: string; email: string }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.put(API_ENDPOINTS.AUTH.ME, userData);
      return response as unknown as ApiResponse<{ user: User }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to update user information'
      };
    }
  }

  // Change password
  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.put(`${API_ENDPOINTS.AUTH.ME}/password`, passwordData);
      return response as unknown as ApiResponse<{ message: string }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to change password'
      };
    }
  }
}

// Chat API Client
import type { Message, Conversation, SendMessageInput } from '../types';

class ChatApiClient {
  // Get all conversations
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    try {
      const response = await api.get('/chat/conversations');
      return response as unknown as ApiResponse<Conversation[]>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to fetch conversations'
      };
    }
  }

  // Get messages for a conversation
  async getMessages(otherUserId: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<Message[]>> {
    try {
      const response = await api.get(`/chat/messages/${otherUserId}`, {
        params: { limit, offset }
      });
      return response as unknown as ApiResponse<Message[]>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to fetch messages'
      };
    }
  }

  // Send a message (HTTP fallback, socket is preferred)
  async sendMessage(data: SendMessageInput): Promise<ApiResponse<Message>> {
    try {
      const response = await api.post('/chat/messages', data);
      return response as unknown as ApiResponse<Message>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to send message'
      };
    }
  }

  // Mark messages as read
  async markAsRead(senderId: string): Promise<ApiResponse> {
    try {
      const response = await api.put('/chat/messages/read', { senderId });
      return response as unknown as ApiResponse;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to mark messages as read'
      };
    }
  }

  // Get unread message count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await api.get('/chat/unread-count');
      return response as unknown as ApiResponse<{ count: number }>;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to fetch unread count'
      };
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      return response as unknown as ApiResponse;
    } catch (error: unknown) {
      const authError = error as AuthApiError;
      return {
        success: false,
        message: authError.message || 'Failed to delete message'
      };
    }
  }
}

// Create and export singleton instances
export const authApi = new AuthApiClient();
export const chatApi = new ChatApiClient();
export default authApi;
