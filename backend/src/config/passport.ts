import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/auth';
import { User } from '../types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URLS = process.env.FRONTEND_URL ? 
  process.env.FRONTEND_URL.split(',').map(url => url.trim()) : 
  ['http://localhost:3000', 'http://10.30.246.128:3000'];
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Get the primary frontend URL (first one in the list)
const PRIMARY_FRONTEND_URL = FRONTEND_URLS[0];

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not provided in environment variables');
}

interface GoogleAuthResult {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth Profile:', profile);

        // Extract user information from Google profile
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName || '';
        const lastName = profile.name?.familyName || '';
        const username = email?.split('@')[0] || `user_${googleId}`;

        if (!email) {
          return done(new Error('No email found in Google profile'), false);
        }

        // Check if user already exists by email
        let user = await UserModel.findByEmail(email);

        if (user) {
          // User exists, log them in
          console.log('Existing user found:', user.email);
          
          // Generate JWT tokens
          const tokenPayload = {
            userId: user.id,
            email: user.email,
            username: user.username,
          };

          const jwtToken = generateToken(tokenPayload);
          const jwtRefreshToken = generateRefreshToken(tokenPayload);

          const result: GoogleAuthResult = {
            user,
            tokens: {
              accessToken: jwtToken,
              refreshToken: jwtRefreshToken
            }
          };

          return done(null, result);
        } else {
          // Check if username is taken, if so, make it unique
          let uniqueUsername = username;
          let counter = 1;
          while (await UserModel.findByUsername(uniqueUsername)) {
            uniqueUsername = `${username}_${counter}`;
            counter++;
          }

          // Create new user (Google users are automatically verified)
          const newUser = await UserModel.createGoogleUser({
            email,
            username: uniqueUsername,
            firstName,
            lastName,
            password: 'GOOGLE_OAUTH_USER', // This won't be used since we use createGoogleUser
          });

          console.log('New Google user created:', newUser.email);

          // Generate JWT tokens
          const tokenPayload = {
            userId: newUser.id,
            email: newUser.email,
            username: newUser.username,
          };

          const jwtToken = generateToken(tokenPayload);
          const jwtRefreshToken = generateRefreshToken(tokenPayload);

          const result: GoogleAuthResult = {
            user: newUser,
            tokens: {
              accessToken: jwtToken,
              refreshToken: jwtRefreshToken
            }
          };

          return done(null, result);
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
      }
    }
  )
);

// Serialize user for session (not used with JWT, but required by passport)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
