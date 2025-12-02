import { Router } from 'express';
import {
  validateUserCreation,
  validateUserLogin,
  validateUserOnboarding,
} from '../validator/userValidator.js';

import {
  register,
  login,
  refresh,
  logout,
  onboarding,
  getProfile,
  updateProfile,
} from '../controllers/userController.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

const userRouter = Router();

userRouter.post('/register', validateUserCreation, register);
userRouter.post('/login', validateUserLogin, login);
userRouter.post('/token', refresh);
userRouter.post('/logout', logout);
userRouter.post('/onboarding', authenticateToken, validateUserOnboarding, onboarding);


//profile routes
userRouter.get('/profile', authenticateToken, getProfile);
userRouter.put('/profile', authenticateToken, updateProfile);

export default userRouter;
