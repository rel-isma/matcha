import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { JWTPayload } from '../types';

/**
 * Middleware to check if user profile is completed
 * Must be used after authenticateToken middleware
 */
export const requireProfileCompletion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Check the database for the latest profile completion status
    const user = await UserModel.findById(userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (!user.isProfileCompleted) {
      res.status(403).json({
        success: false,
        message: 'Profile not completed'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking profile completion:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};