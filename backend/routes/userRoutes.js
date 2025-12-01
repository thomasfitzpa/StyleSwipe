import { Router } from 'express';
import { validateUserCreation, validateUserLogin, validateUserOnboarding, validateAccountUpdate, validateItemIds } from '../validator/userValidator.js';
import { register, login, refresh, logout, getAccountDetails, getLikedItems, onboarding, updateAccount, deleteLikedItems, addToCart } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const userRouter = Router();

// Authentication routes
userRouter.post('/register', validateUserCreation, register);
userRouter.post('/login', validateUserLogin, login);
userRouter.post('/token', refresh);
userRouter.post('/logout', logout);

// Onboarding page route
userRouter.post('/onboarding', authenticateToken, validateUserOnboarding, onboarding);

// Account page routes
userRouter.get('/account', authenticateToken, getAccountDetails);
userRouter.get('/account/liked-items', authenticateToken, getLikedItems);
userRouter.put('/account', authenticateToken, validateAccountUpdate, updateAccount);
userRouter.delete('/account/liked-items', authenticateToken, validateItemIds, deleteLikedItems);
userRouter.post('/account/add-to-cart', authenticateToken, validateItemIds, addToCart);

export default userRouter;