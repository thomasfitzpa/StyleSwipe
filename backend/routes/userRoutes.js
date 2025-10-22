import { Router } from 'express';
import { validateUserCreation, validateUserLogin } from '../validator/userValidator.js';
import { register, login, refresh, logout } from '../controllers/userController.js';

const userRouter = Router();

userRouter.post('/register', validateUserCreation, register);
userRouter.post('/login', validateUserLogin, login);
userRouter.post('/token', refresh);
userRouter.post('/logout', logout);

export default userRouter;