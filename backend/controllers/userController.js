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
        throw new ValidationError(errors.array(), 'Invalid add to cart data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Get item details from request body
    const { itemId, selectedSize, selectedColor, quantity } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item) throw new ValidationError([], 'Item not found');

    // Verify selected size and color are available
    if (!item.availableSizes.includes(selectedSize)) {
        throw new ValidationError([], `Size ${selectedSize} is not available for this item`);
    }
    if (!item.availableColors.includes(selectedColor)) {
        throw new ValidationError([], `Color ${selectedColor} is not available for this item`);
    }

    // Check stock availability
    // Handle MongoDB Map object
    const sizeStock = item.stock?.get?.(selectedSize) || item.stock?.[selectedSize];
    const availableStock = sizeStock?.get?.(selectedColor) ?? sizeStock?.[selectedColor] ?? 0;
    const requestedQuantity = quantity || 1;

    // Check if this exact item/size/color combo already exists in cart
    const existingCartItem = existingUser.cart.find(
        cartItem => 
            cartItem.item.toString() === itemId.toString() &&
            cartItem.selectedSize === selectedSize &&
            cartItem.selectedColor === selectedColor
    );

    if (existingCartItem) {
        // Update quantity if already in cart
        const newQuantity = existingCartItem.quantity + requestedQuantity;
        if (newQuantity > availableStock) {
            throw new ValidationError([], `Insufficient stock. Only ${availableStock} available, you already have ${existingCartItem.quantity} in cart`);
        }
        existingCartItem.quantity = newQuantity;
    } else {
        // Validate stock for new item
        if (requestedQuantity > availableStock) {
            throw new ValidationError([], `Insufficient stock. Only ${availableStock} available`);
        }
        // Add new item to cart
        existingUser.cart.push({
            item: itemId,
            selectedSize,
            selectedColor,
            quantity: requestedQuantity,
            dateAdded: Date.now()
        });
    }

    await existingUser.save();
    res.status(200).json({ 
        message: 'Item added to cart successfully',
        cartItemCount: existingUser.cart.length
    });
};

export const getLikedItems = async (req, res) => {
    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Convert page number and limit to integers in base 10
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';

    // Find user and get liked item IDs
    const existingUser = await User.findById(user._id).select('likedItems');
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Build query for items
    const itemQuery = {
        _id: { $in: existingUser.likedItems },
    };
    if (search) {
        itemQuery.name = { $regex: search, $options: 'i' }; // 'i' for case insensitivity
    }

    // Get number of items that match query
    const total = await Item.countDocuments(itemQuery);

    // Get paginated items
    const items = await Item.find(itemQuery)
        .skip((page - 1) * limit) // Skip items in the pages before the current page
        .limit(limit) // Only return as many items as the limit
        .sort({ createdAt: -1 }); // Sort by most recently added

    res.status(200).json({
        items,
        // Pagination metadata
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
};

export const getCartItems = async (req, res) => {
    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Fetch user with populated cart items
    const existingUser = await User.findById(user._id).populate({
        path: 'cart.item',
        select: 'name brand price images availableSizes availableColors stock'
    });
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Safely map cart to response-friendly structure and compute subtotal
    let subtotal = 0;
    const cartItems = existingUser.cart.map(ci => {
        const itemDoc = ci.item;
        const price = itemDoc && itemDoc.price ? itemDoc.price : 0;
        subtotal += price * (ci.quantity || 1);
        return {
            itemId: itemDoc ? itemDoc._id : ci.item,
            name: itemDoc ? itemDoc.name : undefined,
            brand: itemDoc ? itemDoc.brand : undefined,
            price,
            images: itemDoc ? itemDoc.images : undefined,
            availableSizes: itemDoc ? itemDoc.availableSizes : undefined,
            availableColors: itemDoc ? itemDoc.availableColors : undefined,
            selectedSize: ci.selectedSize,
            selectedColor: ci.selectedColor,
            quantity: ci.quantity || 1,
            dateAdded: ci.dateAdded,
            stock: itemDoc && itemDoc.stock ? itemDoc.stock : undefined
        };
    });

    res.status(200).json({
        items: cartItems,
        subtotal
    });
};

export const updateCartItem = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid cart update data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Get update data from request body
    const { itemId, oldSize, oldColor, newSize, newColor, newQuantity } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Find the cart item to update
    const cartItemIndex = existingUser.cart.findIndex(
        ci => 
            ci.item.toString() === itemId.toString() &&
            ci.selectedSize === oldSize &&
            ci.selectedColor === oldColor
    );

    if (cartItemIndex === -1) {
        throw new ValidationError([], 'Cart item not found');
    }

    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item) throw new ValidationError([], 'Item not found');

    // Determine final size and color
    const finalSize = newSize || oldSize;
    const finalColor = newColor || oldColor;
    const finalQuantity = newQuantity !== undefined ? newQuantity : existingUser.cart[cartItemIndex].quantity;

    // Verify new size and color are available
    if (!item.availableSizes.includes(finalSize)) {
        throw new ValidationError([], `Size ${finalSize} is not available for this item`);
    }
    if (!item.availableColors.includes(finalColor)) {
        throw new ValidationError([], `Color ${finalColor} is not available for this item`);
    }

    // Check stock availability
    // Handle MongoDB Map object
    const sizeStock = item.stock?.get?.(finalSize) || item.stock?.[finalSize];
    const availableStock = sizeStock?.get?.(finalColor) ?? sizeStock?.[finalColor] ?? 0;

    // If size/color combination changed, check if it already exists in cart
    if (finalSize !== oldSize || finalColor !== oldColor) {
        const existingCartItem = existingUser.cart.find(
            (ci, idx) => 
                idx !== cartItemIndex &&
                ci.item.toString() === itemId.toString() &&
                ci.selectedSize === finalSize &&
                ci.selectedColor === finalColor
        );

        if (existingCartItem) {
            // Merge quantities into existing item
            const combinedQuantity = existingCartItem.quantity + finalQuantity;
            if (combinedQuantity > availableStock) {
                throw new ValidationError([], `Insufficient stock. Only ${availableStock} available, you already have ${existingCartItem.quantity} of this size/color in cart`);
            }
            existingCartItem.quantity = combinedQuantity;
            // Remove the old cart item
            existingUser.cart.splice(cartItemIndex, 1);
        } else {
            // Update to new size/color
            if (finalQuantity > availableStock) {
                throw new ValidationError([], `Insufficient stock. Only ${availableStock} available`);
            }
            existingUser.cart[cartItemIndex].selectedSize = finalSize;
            existingUser.cart[cartItemIndex].selectedColor = finalColor;
            existingUser.cart[cartItemIndex].quantity = finalQuantity;
        }
    } else {
        // Just updating quantity for same size/color
        if (finalQuantity > availableStock) {
            throw new ValidationError([], `Insufficient stock. Only ${availableStock} available`);
        }
        existingUser.cart[cartItemIndex].quantity = finalQuantity;
    }

    await existingUser.save();

    // Recalculate subtotal by populating cart items
    const updatedUser = await User.findById(user._id).populate({
        path: 'cart.item',
        select: 'price'
    });

    let subtotal = 0;
    updatedUser.cart.forEach(ci => {
        const price = ci.item?.price || 0;
        subtotal += price * (ci.quantity || 1);
    });

    res.status(200).json({ 
        message: 'Cart item updated successfully',
        cartItemCount: existingUser.cart.length,
        subtotal
    });
};

export const removeCartItem = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid remove cart item data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Get item details from request body
    const { itemId, selectedSize, selectedColor } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Remove the cart item
    const initialLength = existingUser.cart.length;
    existingUser.cart = existingUser.cart.filter(
        ci => 
            !(ci.item.toString() === itemId.toString() &&
              ci.selectedSize === selectedSize &&
              ci.selectedColor === selectedColor)
    );

    if (existingUser.cart.length === initialLength) {
        throw new ValidationError([], 'Cart item not found');
    }

    await existingUser.save();

    // Recalculate subtotal by populating cart items
    const updatedUser = await User.findById(user._id).populate({
        path: 'cart.item',
        select: 'price'
    });

    let subtotal = 0;
    updatedUser.cart.forEach(ci => {
        const price = ci.item?.price || 0;
        subtotal += price * (ci.quantity || 1);
    });

    res.status(200).json({ 
        message: 'Cart item removed successfully',
        cartItemCount: existingUser.cart.length,
        subtotal
    });
};

