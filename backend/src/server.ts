import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import passport from './config/passport';
import routes from './routes';
import { specs, swaggerUi } from './config/swagger';
import pool from './config/database';
import { initializeSocket } from './config/socket';
import { NotificationService } from './services/NotificationService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);
NotificationService.setSocketIO(io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Support multiple frontend URLs
const allowedOrigins = process.env.FRONTEND_URL ? 
  process.env.FRONTEND_URL.split(',').map(url => url.trim()) : 
  ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize Passport
app.use(passport.initialize());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Matcha API Documentation'
}));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Matcha API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      },
      profile: {
        getMyProfile: 'GET /api/profile/me',
        updateMyProfile: 'PUT /api/profile/me',
        uploadPicture: 'POST /api/profile/me/pictures',
        deletePicture: 'DELETE /api/profile/me/pictures/:pictureId',
        addInterests: 'POST /api/profile/me/interests',
        removeInterest: 'DELETE /api/profile/me/interests/:interestId',
        getPublicProfile: 'GET /api/profile/user/:username',
        browseProfiles: 'GET /api/profile/browse',
        getLikesReceived: 'GET /api/profile/likes/received',
        likeUser: 'POST /api/profile/like/:userId',
        unlikeUser: 'DELETE /api/profile/like/:userId',
        blockUser: 'POST /api/profile/block/:userId',
        reportUser: 'POST /api/profile/report/:userId'
      }
    }
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Database connection test
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket Server: Ready for connections`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  io.close();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  io.close();
  await pool.end();
  process.exit(0);
});

startServer();
