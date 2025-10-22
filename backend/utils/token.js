import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { UnauthorizedError } from '../errors/errors.js';

// Config
const ACCESS_TTL = '15m';
const REFRESH_TTL = '30d';

export const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TTL });
}

export const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TTL });
}

export const verifyRefreshToken = async (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        // Clear invalid refresh token from any user
        const userWithToken = await User.findOne({ refreshToken: token });
        if (userWithToken) {
            userWithToken.refreshToken = null;
            await userWithToken.save();
        }
        throw new UnauthorizedError('Invalid or expired refresh token');
    }
}