import { ConflictError, UnauthorizedError, ValidationError } from '../errors/errors.js';
import { validationResult } from 'express-validator';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import User from '../models/userModel.js';
import Item from '../models/itemModel.js';

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

export const onboarding = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid onboarding data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Get onboarding data from request body
    const {
        gender,
        shoeSize,
        shirtSize,
        shortSize,
        pantsSize,
        stylePreferences,
        colorPreferences,
        favoriteBrands,
        priceRange,
    } = req.body;

    // Update user preferences
    if (gender) user.gender = gender;

    user.preferences = {
        shoeSize: shoeSize || user.preferences.shoeSize,
        shirtSize: shirtSize || user.preferences.shirtSize,
        pantsSize: pantsSize || user.preferences.pantsSize,
        shortSize: shortSize || user.preferences.shortSize,
        stylePreferences: stylePreferences || user.preferences.stylePreferences,
        colorPreferences: colorPreferences || user.preferences.colorPreferences,
        favoriteBrands: favoriteBrands || user.preferences.favoriteBrands,
        priceRange: priceRange || user.preferences.priceRange,
    };

    await user.save();
    res.status(200).json({ message: 'Onboarding completed successfully' });
};

export const getAccountDetails = async (req, res) => {
    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Fetch full user details including liked items to add to shopping cart
    const fullUser = await User.findById(user._id).populate('likedItems');

    if (!fullUser) throw new UnauthorizedError('User not found');

    // Prepare account details response with full liked items
    const accountDetails = {
        username: fullUser.username,
        email: fullUser.email,
        name: fullUser.name,
        bio: fullUser.bio,
        gender: fullUser.gender,
        dateOfBirth: fullUser.dateOfBirth,
        preferences: fullUser.preferences,
        likedItems: fullUser.likedItems,
        dislikedItemsCount: fullUser.dislikedItems.length,
        savedItemsCount: fullUser.savedItems.length,
        cartItemsCount: fullUser.cart.length,
        lastActive: fullUser.lastActive,
        createdAt: fullUser.createdAt,
        updatedAt: fullUser.updatedAt
    };

    res.status(200).json(accountDetails);
};

export const updateAccount = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid account update data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Get update data from request body
    const {
        username,
        email,
        name,
        bio,
        gender,
        dateOfBirth,
        shoeSize,
        shirtSize,
        shortSize,
        pantsSize,
        stylePreferences,
        colorPreferences,
        favoriteBrands,
        priceRange,
    } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Check if username or email are being changed and if they're already in use by another user
    if (username && username !== existingUser.username) {
        const userWithUsername = await User.findOne({ username });
        if (userWithUsername) {
            throw new ConflictError('Username already in use');
        }
        existingUser.username = username;
    }

    if (email && email !== existingUser.email) {
        const userWithEmail = await User.findOne({ email });
        if (userWithEmail) {
            throw new ConflictError('Email already in use');
        }
        existingUser.email = email;
    }

    // Update profile fields if provided
    if (name !== undefined) existingUser.name = name;
    if (bio !== undefined) existingUser.bio = bio;
    if (gender !== undefined) existingUser.gender = gender;
    if (dateOfBirth !== undefined) existingUser.dateOfBirth = dateOfBirth;
    if (profilePicture !== undefined) existingUser.profilePicture = profilePicture;

    // Update preferences if provided
    if (shoeSize !== undefined) existingUser.preferences.shoeSize = shoeSize;
    if (shirtSize !== undefined) existingUser.preferences.shirtSize = shirtSize;
    if (pantsSize !== undefined) existingUser.preferences.pantsSize = pantsSize;
    if (shortSize !== undefined) existingUser.preferences.shortSize = shortSize;
    if (stylePreferences !== undefined) existingUser.preferences.stylePreferences = stylePreferences;
    if (colorPreferences !== undefined) existingUser.preferences.colorPreferences = colorPreferences;
    if (favoriteBrands !== undefined) existingUser.preferences.favoriteBrands = favoriteBrands;
    if (priceRange !== undefined) existingUser.preferences.priceRange = priceRange;

    await existingUser.save();
    res.status(200).json({ message: 'Account updated successfully' });
};

export const deleteLikedItems = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid delete liked items data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Get item IDs to remove from request body
    const { itemIds } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Remove the specified items from likedItems
    existingUser.likedItems = existingUser.likedItems.filter(
        (itemId) => !itemIds.includes(itemId.toString())
    );

    await existingUser.save();
    res.status(200).json({ 
        message: 'Liked items removed successfully',
        removedCount: itemIds.length 
    });
};

export const addToCart = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid move to cart data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Get item IDs to move from request body
    const { itemIds } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Convert itemIds to strings for comparison
    const itemIdStrings = itemIds.map(id => id.toString());

    // Filter items that are in likedItems and not already in cart
    const existingCartItemIds = existingUser.cart.map(cartItem => cartItem.item.toString());
    const itemsToMove = existingUser.likedItems.filter(itemId => {
        const itemIdStr = itemId.toString();
        return itemIdStrings.includes(itemIdStr) && !existingCartItemIds.includes(itemIdStr);
    });

    // Add items to cart
    const newCartItems = itemsToMove.map(itemId => ({
        item: itemId,
        dateAdded: Date.now()
    }));
    existingUser.cart.push(...newCartItems);

    await existingUser.save();
    res.status(200).json({ 
        message: 'Items moved to cart successfully',
        movedCount: itemsToMove.length,
        skippedCount: itemIds.length - itemsToMove.length
    });
};

