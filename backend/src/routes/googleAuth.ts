import { Router, Request, Response } from 'express';
import passport from '../config/passport';

const router = Router();

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
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

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
    console.log('Google OAuth callback received');
    console.log('Query params:', req.query);
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
  }),
  (req: Request, res: Response) => {
    try {
      const authResult = req.user as any;
      
      if (!authResult || !authResult.user || !authResult.tokens) {
        console.error('Google OAuth failed: No user data received');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }

      const { user, tokens } = authResult;

      // Set JWT tokens in HTTP-only cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      console.log('Google OAuth success for user:', user.email);

      // Redirect to frontend browse page (same as regular login)
      res.redirect(`${process.env.FRONTEND_URL}/browse`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
  }
);

export default router;
