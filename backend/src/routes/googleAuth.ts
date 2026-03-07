import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { ProfileModel } from '../models/Profile';

const router = Router();

// Get frontend URLs from environment
const FRONTEND_URLS = process.env.FRONTEND_URL ? 
  process.env.FRONTEND_URL.split(',').map(url => url.trim()) : 
  ['http://localhost:3000', 'http://10.30.246.128:3000'];

// Function to get the appropriate frontend URL based on the request
const getFrontendUrl = (req: Request): string => {
  const host = req.get('host');
  const referer = req.get('referer');
  
  // Check if request came from private IP
  if (referer && referer.includes('10.30.246.128')) {
    return 'http://10.30.246.128:3000';
  }
  
  // Check if host suggests private IP
  if (host && host.includes('10.30.246.128')) {
    return 'http://10.30.246.128:3000';
  }
  
  // Default to localhost
  return 'http://localhost:3000';
};

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     description: Redirects user to Google OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get('/google', (req: Request, res: Response, next: Function) => {
  // Get the frontend URL and encode it in state parameter
  const frontendUrl = getFrontendUrl(req);
  const state = Buffer.from(frontendUrl).toString('base64');
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state
  })(req, res, next);
});

// Track processed codes to prevent duplicate processing
const processedCodes = new Set<string>();

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     description: Handles the callback from Google OAuth
 *     responses:
 *       302:
 *         description: Redirect to frontend with authentication result
 *       400:
 *         description: Authentication failed
 */
router.get('/google/callback',
  (req: Request, res: Response, next: Function) => {
    
    // Check if this code has already been processed
    const code = req.query.code as string;
    if (code && processedCodes.has(code)) {
      // Get frontend URL from state or default
      let frontendUrl = 'http://localhost:3000';
      try {
        if (req.query.state) {
          frontendUrl = Buffer.from(req.query.state as string, 'base64').toString();
        }
      } catch (e) {
        frontendUrl = getFrontendUrl(req);
      }
      return res.redirect(`${frontendUrl}/browse`);
    }
    
    // Mark code as being processed
    if (code) {
      processedCodes.add(code);
      // Clean up old codes after 10 minutes
      setTimeout(() => processedCodes.delete(code), 10 * 60 * 1000);
    }
    
    next();
  },
  passport.authenticate('google', { 
    session: false
  }),
  async (req: Request, res: Response) => {
    try {
      // Get frontend URL from state parameter or fallback
      let frontendUrl = 'http://localhost:3000';
      try {
        if (req.query.state) {
          frontendUrl = Buffer.from(req.query.state as string, 'base64').toString();
        }
      } catch (e) {
        frontendUrl = getFrontendUrl(req);
      }
      
      const authResult = req.user as any;
      
      if (!authResult || !authResult.user || !authResult.tokens) {
        return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }

      const { user, tokens } = authResult;

      // Set JWT tokens in HTTP-only cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });


      // Check if profile is completed and redirect accordingly
      if (!user.isProfileCompleted) {
        res.redirect(`${frontendUrl}/complete-profile`);
      } else {
        res.redirect(`${frontendUrl}/browse`);
      }
    } catch (error) {
      
      // Get frontend URL for error redirect
      let frontendUrl = 'http://localhost:3000';
      try {
        if (req.query.state) {
          frontendUrl = Buffer.from(req.query.state as string, 'base64').toString();
        }
      } catch (e) {
        frontendUrl = getFrontendUrl(req);
      }
      
      res.redirect(`${frontendUrl}/login?error=oauth_error`);
    }
  }
);

export default router;
