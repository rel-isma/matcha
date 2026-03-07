import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { ProfileModel } from '../models/Profile';

const router = Router();

// Get frontend URLs from environment
const FRONTEND_URLS = process.env.FRONTEND_URL ? 
  process.env.FRONTEND_URL.split(',').map(url => url.trim()) : 
  ['http://localhost:3000'];

// Function to get the appropriate frontend URL based on the request
const getFrontendUrl = (_req: Request): string => {
  return FRONTEND_URLS[0] || 'http://localhost:3000';
};

/**
 * @swagger
 * /auth/42:
 *   get:
 *     summary: Initiate 42 Intra OAuth login
 *     tags: [Authentication]
 *     description: Redirects user to 42 Intra OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to 42 Intra OAuth
 */
router.get('/42', (req: Request, res: Response, next: Function) => {
  // Get the frontend URL and encode it in state parameter
  const frontendUrl = getFrontendUrl(req);
  const state = Buffer.from(frontendUrl).toString('base64');
  
  passport.authenticate('intra42', {
    scope: ['public'],
    state: state
  })(req, res, next);
});

// Track processed codes to prevent duplicate processing
const processedCodes = new Set<string>();

/**
 * @swagger
 * /auth/42/callback:
 *   get:
 *     summary: 42 Intra OAuth callback
 *     tags: [Authentication]
 *     description: Handles the callback from 42 Intra OAuth
 *     responses:
 *       302:
 *         description: Redirect to frontend with authentication result
 *       400:
 *         description: Authentication failed
 */
router.get('/42/callback',
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
  passport.authenticate('intra42', { 
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
        console.error('42 Intra OAuth failed: No user data received');
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
