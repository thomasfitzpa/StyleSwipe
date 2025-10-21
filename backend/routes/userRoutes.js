import { Router } from 'express';
import { validateUserCreation } from '../validator/userValidator.js';
import { register } from '../controllers/userController.js';

const userRouter = Router();

userRouter.post('/register', validateUserCreation, register);

export default userRouter;