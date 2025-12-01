import express from 'express';
import { getFeed, likeItem, dislikeItem, undoSwipe } from '../controllers/itemController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateLikeItem, validateDislikeItem, validateUndoSwipe } from '../validator/itemValidator.js';

const router = express.Router();

router.get('/feed', authenticateToken, getFeed);
router.post('/like', authenticateToken, validateLikeItem, likeItem);
router.post('/dislike', authenticateToken, validateDislikeItem, dislikeItem);
router.post('/undo', authenticateToken, validateUndoSwipe, undoSwipe);

export default router;
