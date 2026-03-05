import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import notificationRoutes from './notifications';
import chatRoutes from './chat';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply general rate limiting to all routes
// router.use(generalLimiter);

// API routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Matcha API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
