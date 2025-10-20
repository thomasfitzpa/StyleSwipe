import { ConflictError, ValidationError } from '../errors/errors.js';
import { validationResult } from 'express-validator';
const User = require('../models/userModel.js');

// Create and Save a new User
export const register = async (req, res) => {
    try {
        //Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ValidationError(errors.array(), 'Invalid user data provided.');
        }

        const { username, email, password } = req.body;

        // Check if user with the same username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new ConflictError('Username or email already in use.');
        }

        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (err) {
        next(err);
    }
};