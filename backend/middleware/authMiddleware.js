import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/errors.js';
import User from '../models/userModel.js';


export const authenticateToken = async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedError('Access token is missing');

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) throw new UnauthorizedError('User not found');

        user.lastActive = Date.now();
        await user.save();
        
        req.user = user;
        next();
    } catch (err) {
        // Use 401 to signal clients to attempt token refresh
        throw new UnauthorizedError('Invalid or expired access token');
    }
};