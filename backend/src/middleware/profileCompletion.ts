import { Request, Response, NextFunction } from 'express';
import { User } from '../types';

/**
 * Middleware to check if user profile is completed
 * Must be used after authenticateToken middleware
 */
export const requireProfileCompletion = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  // If profile is not completed, return 403 with redirect instruction
  if (!user.isProfileCompleted) {
    return res.status(403).json({
      success: false,
      message: 'Profile not completed',
      redirect: '/complete-profile'
    });
  }

  // Profile is completed, continue to the next middleware/route
  next();
};