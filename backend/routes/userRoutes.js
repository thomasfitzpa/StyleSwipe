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

import { 
    validateUserCreation, 
    validateUserLogin,
    validateUserOnboarding, 
    validateAccountUpdate, 
    validateItemIds, 
    validateCartUpdate, 
    validateCartItemRemoval, 
    validateAddToCart 
} from '../validator/userValidator.js';
import { 
    register, 
    login, 
    refresh, 
    logout, 
    getAccountDetails, 
    getLikedItems, 
    onboarding, 
    updateAccount, 
    deleteLikedItems, 
    addToCart, 
    getCartItems, 
    updateCartItem, 
    removeCartItem 
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const userRouter = Router();

// Authentication routes
userRouter.post('/register', validateUserCreation, register);
userRouter.post('/login', validateUserLogin, login);
userRouter.post('/token', refresh);
userRouter.post('/logout', logout);

// Onboarding page route
userRouter.post('/onboarding', authenticateToken, validateUserOnboarding, onboarding);


//profile routes
userRouter.get('/profile', authenticateToken, getProfile);
userRouter.put('/profile', authenticateToken, updateProfile);

export default userRouter;
// Account page routes
userRouter.get('/account', authenticateToken, getAccountDetails);
userRouter.get('/account/liked-items', authenticateToken, getLikedItems);
userRouter.put('/account', authenticateToken, validateAccountUpdate, updateAccount);
userRouter.delete('/account/liked-items', authenticateToken, validateItemIds, deleteLikedItems);
userRouter.post('/account/add-to-cart', authenticateToken, validateAddToCart, addToCart);

// Shopping cart routes
userRouter.get('/cart', authenticateToken, getCartItems);
userRouter.put('/cart', authenticateToken, validateCartUpdate, updateCartItem);
userRouter.delete('/cart', authenticateToken, validateCartItemRemoval, removeCartItem);

export default userRouter;
