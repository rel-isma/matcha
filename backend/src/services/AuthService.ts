import { UserModel } from '../models/User';
import { CreateUserInput, LoginInput, User, ApiResponse } from '../types';
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyRefreshToken, generateVerificationToken, generateResetToken } from '../utils/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

export class AuthService {
  static async register(userData: CreateUserInput): Promise<ApiResponse<{ message: string }>> {
    try {
      // Check if user already exists
      const existingUserByEmail = await UserModel.findByEmail(userData.email);
      if (existingUserByEmail) {
        return {
          success: false,
          message: 'User with this email already exists',
        };
      }

      const existingUserByUsername = await UserModel.findByUsername(userData.username);
      if (existingUserByUsername) {
        return {
          success: false,
          message: 'Username is already taken',
        };
      }

      // Hash password and generate verification token
      const hashedPassword = await hashPassword(userData.password);
      const verificationToken = generateVerificationToken();

      // Create user
      const newUser = await UserModel.createUser({
        ...userData,
        password: hashedPassword,
        verificationToken,
      });

      // Send verification email
      try {
        await sendVerificationEmail(userData.email, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Note: We don't fail the registration if email sending fails
        // The user can request a new verification email later
      }

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: { message: 'Please check your email for verification instructions' }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.',
      };
    }
  }

  static async login(loginData: LoginInput): Promise<ApiResponse<{ token: string; refreshToken: string; user: Partial<User> }>> {
    try {
      // Find user by username
      const user = await UserModel.findByUsername(loginData.username);
      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password',
        };
      }

      // Check if user is verified
      if (!user.isVerified) {
        return {
          success: false,
          message: 'Please verify your email address before logging in',
        };
      }

      // Verify password
      const isPasswordValid = await comparePassword(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username or password',
        };
      }

      // Generate JWT tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
      
      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Return user data without password
      const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitiveData } = user;

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          refreshToken,
          user: userWithoutSensitiveData,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  static async verifyEmail(verificationToken: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const isVerified = await UserModel.verifyUser(verificationToken);
      
      if (!isVerified) {
        return {
          success: false,
          message: 'Invalid or expired verification token',
        };
      }

      return {
        success: true,
        message: 'Email verified successfully! You can now log in.',
        data: { message: 'Account verified successfully' }
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed. Please try again.',
      };
    }
  }

  static async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const user = await UserModel.findByEmail(email);
      
      // Don't reveal if the email exists or not for security reasons
      // Always return success message
      const successMessage = 'If an account with this email exists, a password reset link has been sent.';
      
      if (!user || !user.isVerified) {
        return {
          success: true,
          message: successMessage,
          data: { message: successMessage }
        };
      }

      // Generate reset token
      const resetToken = generateResetToken();
      
      // Save reset token to database
      await UserModel.setResetPasswordToken(email, resetToken);

      // Send reset email
      try {
        await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return {
          success: false,
          message: 'Failed to send password reset email. Please try again later.',
        };
      }

      return {
        success: true,
        message: successMessage,
        data: { message: successMessage }
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Password reset request failed. Please try again.',
      };
    }
  }

  static async resetPassword(resetToken: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Reset the password
      const isReset = await UserModel.resetPassword(resetToken, hashedPassword);
      
      if (!isReset) {
        return {
          success: false,
          message: 'Invalid or expired reset token',
        };
      }

      return {
        success: true,
        message: 'Password reset successful! You can now log in with your new password.',
        data: { message: 'Password updated successfully' }
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.',
      };
    }
  }

  static async getCurrentUser(userId: string): Promise<ApiResponse<{ user: Partial<User> }>> {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Return user data without sensitive information
      const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitiveData } = user;

      return {
        success: true,
        message: 'User data retrieved successfully',
        data: { user: userWithoutSensitiveData },
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Failed to retrieve user data',
      };
    }
  }

  static async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string; user: Partial<User> }>> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      // Get user to make sure they still exist and are verified
      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isVerified) {
        return {
          success: false,
          message: 'User not found or not verified',
        };
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
      
      const newAccessToken = generateToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      // Return user data without sensitive information
      const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitiveData } = user;

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: userWithoutSensitiveData,
        },
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }
  }

  static async resendVerification(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address',
        };
      }

      if (user.isVerified) {
        return {
          success: false,
          message: 'This account is already verified',
        };
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();
      
      // Update user's verification token
      await UserModel.updateVerificationToken(user.id, verificationToken);

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken);
        
        return {
          success: true,
          message: 'Verification email sent successfully! Please check your email.',
          data: { message: 'Verification email sent' }
        };
      } catch (emailError) {
        return {
          success: false,
          message: 'Failed to send verification email. Please try again later.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to resend verification email. Please try again.',
      };
    }
  }

  static async updateUser(userId: string, userData: { firstName: string; lastName: string; email: string }): Promise<ApiResponse<{ user: Partial<User> }>> {
    try {
      // Check if email is already taken by another user
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser && existingUser.id !== userId) {
        return {
          success: false,
          message: 'Email is already taken by another user',
        };
      }

      // Update user information
      const updatedUser = await UserModel.updateUser(userId, userData);
      if (!updatedUser) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Return user data without password
      const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitiveData } = updatedUser;

      return {
        success: true,
        message: 'User information updated successfully',
        data: {
          user: userWithoutSensitiveData,
        },
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: 'Failed to update user information. Please try again.',
      };
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // Get user with password
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect',
        };
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password in database
      const success = await UserModel.updatePassword(userId, hashedNewPassword);
      if (!success) {
        return {
          success: false,
          message: 'Failed to update password',
        };
      }

      return {
        success: true,
        message: 'Password changed successfully',
        data: { message: 'Password changed successfully' }
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password. Please try again.',
      };
    }
  }
}
