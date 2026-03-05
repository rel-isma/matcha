import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authenticateToken } from '../middleware/auth';
import { requireProfileCompletion } from '../middleware/profileCompletion';

const router = Router();

// All chat routes require authentication and completed profile
router.use(authenticateToken);
router.use(requireProfileCompletion);

// Get all conversations
router.get('/conversations', ChatController.getConversations);

// Get messages for a specific conversation
router.get('/messages/:otherUserId', ChatController.getMessages);

// Send a message (HTTP endpoint, though socket is preferred)
router.post('/messages', ChatController.sendMessage);

// Mark messages as read
router.put('/messages/read', ChatController.markAsRead);

// Get unread message count
router.get('/unread-count', ChatController.getUnreadCount);

// Delete a message
router.delete('/messages/:messageId', ChatController.deleteMessage);

export default router;
