import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { UserModel } from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/auth';
import { User } from '../types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const INTRA_CLIENT_ID = process.env.INTRA_CLIENT_ID;
const INTRA_CLIENT_SECRET = process.env.INTRA_CLIENT_SECRET;
const FRONTEND_URLS = process.env.FRONTEND_URL ? 
  process.env.FRONTEND_URL.split(',').map(url => url.trim()) : 
  ['http://localhost:3000'];
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

// Configure 42 Intra OAuth Strategy
passport.use('intra42',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: INTRA_CLIENT_ID || '',
      clientSecret: INTRA_CLIENT_SECRET || '',
      callbackURL: `${BACKEND_URL}/api/auth/42/callback`,
      scope: ['public'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Fetch user profile from 42 Intra API
        const response = await fetch('https://api.intra.42.fr/v2/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          return done(new Error('Failed to fetch user profile from 42 Intra'), false);
        }

        const intraProfile = await response.json();

        // Extract user information from 42 Intra profile
        const intraId = intraProfile.id?.toString();
        const email = intraProfile.email;
        const firstName = intraProfile.first_name || '';
        const lastName = intraProfile.last_name || '';
        const username = intraProfile.login || email?.split('@')[0] || `user_${intraId}`;

        if (!email) {
          return done(new Error('No email found in 42 Intra profile'), false);
        }

        // Check if user already exists by email
        let user = await UserModel.findByEmail(email);

        if (user) {
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

          // Create new user (42 Intra users are automatically verified)
          const newUser = await UserModel.createIntra42User({
            email,
            username: uniqueUsername,
            firstName,
            lastName,
            password: 'INTRA42_OAUTH_USER', // This won't be used since we use createIntra42User
          });

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
        console.error('42 Intra OAuth error:', error);
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
