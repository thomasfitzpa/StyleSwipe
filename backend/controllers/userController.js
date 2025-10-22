import { ConflictError, UnauthorizedError, ValidationError } from '../errors/errors.js';
import { validationResult } from 'express-validator';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import User from '../models/userModel.js';

// Create and Save a new User
export const register = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid user data provided');
    }

    const { username, email, password } = req.body;

    // Check if user with the same username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ConflictError('Username or email already in use');
    }

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
};

export const login = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid login data provided');
    }

    // Authenticate user
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select('+password');
    if (!user) throw new UnauthorizedError('No user found with this username or email');

    if (!(await user.comparePassword(password))) {
        throw new UnauthorizedError('Password is incorrect');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    user.lastActive = Date.now();
    await user.save();

    res.status(200).json({ accessToken, refreshToken });
};


export const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new UnauthorizedError('No refresh token in request');
    }
    const decoded = await verifyRefreshToken(refreshToken);

    // Find user by ID from token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedError('No user with this refresh token found');
    }

    // Check inactivity timeout (14 days)
    if (user.lastActive < Date.now() - 14*24*60*60*1000) {
        user.refreshToken = null;
        await user.save();
        throw new UnauthorizedError('Session timed out due to inactivity');
    }

    // Issue new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    user.lastActive = Date.now();
    await user.save();

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
};

export const logout = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new UnauthorizedError('No refresh token in request');
    }
    const decoded = await verifyRefreshToken(refreshToken);

    // Find user by ID from token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedError('No user with this refresh token found');
    }

    // Remove the refresh token
    user.refreshToken = null;
    await user.save();
    res.status(200).json({ message: 'Logged out successfully' });
};