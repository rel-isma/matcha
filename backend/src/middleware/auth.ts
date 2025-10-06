import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyRefreshToken, generateToken } from '../utils/auth';
import { JWTPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Try to get token from cookies first, then fallback to Authorization header
  let token = req.cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // If access token is invalid, try to refresh it using refresh token
    const refreshToken = req.cookies?.refreshToken;
    
    if (refreshToken) {
      try {
        const decodedRefresh = verifyRefreshToken(refreshToken);
        
        // Generate new access token
        const newToken = generateToken({
          userId: decodedRefresh.userId,
          email: decodedRefresh.email,
          username: decodedRefresh.username,
        });
        
        // Set new access token in cookie
        res.cookie('accessToken', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        req.user = decodedRefresh;
        next();
        return;
      } catch (refreshError) {
        // Both tokens are invalid, clear cookies and return error
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(403).json({
          success: false,
          message: 'Invalid or expired tokens. Please log in again.',
        });
        return;
      }
    }
    
    res.status(403).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};
