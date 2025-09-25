import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply general rate limiting to all routes
router.use(generalLimiter);

// API routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

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
