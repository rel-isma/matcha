import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { CreateUserInput, LoginInput, ResetPasswordInput } from '../types';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     RegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *           example: "johndoe"
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "John"
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Doe"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "SecurePass123!"
 *     
 *     LoginInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "johndoe"
 *         password:
 *           type: string
 *           example: "SecurePass123!"
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         error:
 *           type: string
 */

export class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterInput'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Validation error or user already exists
   *       500:
   *         description: Internal server error
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserInput = req.body;
      const result = await AuthService.register(userData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Register controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginInput'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         token:
   *                           type: string
   *                         user:
   *                           $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid credentials or unverified account
   *       500:
   *         description: Internal server error
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginInput = req.body;
      const result = await AuthService.login(loginData);

      if (result.success && result.data) {
        // Set JWT token in HTTP-only cookie
        res.cookie('accessToken', result.data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Set refresh token in HTTP-only cookie if available
        if (result.data.refreshToken) {
          res.cookie('refreshToken', result.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });
        }

        // Return success response without tokens
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.data.user,
          },
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/verify:
   *   post:
   *     summary: Verify user email
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *             properties:
   *               token:
   *                 type: string
   *                 example: "abc123def456ghi789"
   *     responses:
   *       200:
   *         description: Email verified successfully
   *       400:
   *         description: Invalid or expired token
   *       500:
   *         description: Internal server error
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Verification token is required',
        });
        return;
      }

      const result = await AuthService.verifyEmail(token);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Verify email controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/resend-verification:
   *   post:
   *     summary: Resend email verification
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "user@example.com"
   *     responses:
   *       200:
   *         description: Verification email sent (if email exists)
   *       400:
   *         description: Validation error
   *       500:
   *         description: Internal server error
   */
  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.resendVerification(email);

      // Always return 200 to prevent email enumeration
      res.status(200).json(result);
    } catch (error) {
      console.error('Resend verification controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Request password reset
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "user@example.com"
   *     responses:
   *       200:
   *         description: Password reset email sent (if email exists)
   *       400:
   *         description: Validation error
   *       500:
   *         description: Internal server error
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);

      // Always return 200 to prevent email enumeration
      res.status(200).json(result);
    } catch (error) {
      console.error('Forgot password controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     summary: Reset password with token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - password
   *             properties:
   *               token:
   *                 type: string
   *                 example: "abc123def456ghi789"
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: "NewSecurePass123!"
   *     responses:
   *       200:
   *         description: Password reset successful
   *       400:
   *         description: Invalid token or validation error
   *       500:
   *         description: Internal server error
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password }: ResetPasswordInput = req.body;
      const result = await AuthService.resetPassword(token, password);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Reset password controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current user information
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         user:
   *                           $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const result = await AuthService.getCurrentUser(userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Get current user controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *       500:
   *         description: Internal server error
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear JWT cookies
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
        data: { message: 'You have been logged out successfully' }
      });
    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   *       500:
   *         description: Internal server error
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not provided',
        });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);

      if (result.success && result.data) {
        // Set new JWT token in HTTP-only cookie
        res.cookie('accessToken', result.data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Set new refresh token if provided
        if (result.data.refreshToken) {
          res.cookie('refreshToken', result.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });
        }

        res.status(200).json({
          success: true,
          message: 'Token refreshed successfully',
          data: {
            user: result.data.user,
          },
        });
      } else {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Refresh token controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/me:
   *   put:
   *     summary: Update user information
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firstName
   *               - lastName
   *               - email
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *     responses:
   *       200:
   *         description: User information updated successfully
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Unauthorized
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.userId;
      const { firstName, lastName, email } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Validate input
      if (!firstName || !lastName || !email) {
        res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      const result = await AuthService.updateUser(userId, { firstName, lastName, email });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.data?.user,
          },
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Update user controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /auth/me/password:
   *   put:
   *     summary: Change user password
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *                 minLength: 8
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Invalid input data or incorrect current password
   *       401:
   *         description: Unauthorized
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Validate input
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long'
        });
        return;
      }

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Change password controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
