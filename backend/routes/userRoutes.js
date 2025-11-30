import { Router } from 'express';
import { validateUserCreation, validateUserLogin, validateUserOnboarding, validateAccountUpdate } from '../validator/userValidator.js';
import { register, login, refresh, logout, getAccountDetails, onboarding, updateAccount } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const userRouter = Router();

userRouter.post('/register', validateUserCreation, register);
userRouter.post('/login', validateUserLogin, login);
userRouter.post('/token', refresh);
userRouter.post('/logout', logout);
userRouter.get('/account', authenticateToken, getAccountDetails);
userRouter.put('/account', authenticateToken, validateAccountUpdate, updateAccount);
userRouter.post('/onboarding', authenticateToken, validateUserOnboarding, onboarding);

export default userRouter;