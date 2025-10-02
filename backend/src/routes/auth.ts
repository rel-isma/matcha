import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateRegistration, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword 
} from '../middleware/validation';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';
import googleAuthRoutes from './googleAuth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

// Public routes
router.post('/register', authLimiter, validateRegistration, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/verify', AuthController.verifyEmail);
router.post('/resend-verification', authLimiter, validateForgotPassword, AuthController.resendVerification);
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, AuthController.forgotPassword);
router.post('/reset-password', validateResetPassword, AuthController.resetPassword);

// Protected routes
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.put('/me', authenticateToken, AuthController.updateUser);
router.put('/me/password', authenticateToken, AuthController.changePassword);
router.post('/logout', authenticateToken, AuthController.logout);

// Google OAuth routes
router.use('/', googleAuthRoutes);

export default router;
