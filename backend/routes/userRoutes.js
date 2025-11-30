import { Router } from 'express';
import { validateUserCreation, validateUserLogin, validateUserOnboarding, validateAccountUpdate, validateDeleteLikedItems } from '../validator/userValidator.js';
import { register, login, refresh, logout, getAccountDetails, onboarding, updateAccount, deleteLikedItems } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const userRouter = Router();

userRouter.post('/register', validateUserCreation, register);
userRouter.post('/login', validateUserLogin, login);
userRouter.post('/token', refresh);
userRouter.post('/logout', logout);
userRouter.get('/account', authenticateToken, getAccountDetails);
userRouter.put('/account', authenticateToken, validateAccountUpdate, updateAccount);
userRouter.delete('/account/liked-items', authenticateToken, validateDeleteLikedItems, deleteLikedItems);
userRouter.post('/onboarding', authenticateToken, validateUserOnboarding, onboarding);

export default userRouter;