import { UnauthorizedError, ValidationError } from '../errors/errors.js';
import { validationResult } from 'express-validator';
import User from '../models/userModel.js';
import Item from '../models/itemModel.js';
import { getPriceRange, updateTallies, getTopFeatures, scoreItem } from '../utils/feed.js';

export const getFeed = async (req, res) => {
    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    // Get pagination parameters
    const limit = parseInt(req.query.limit, 10) || 20;
    // What proportion of the feed won't be based on recommendation to encourage user to explore options
    const explorationRate = parseFloat(req.query.explorationRate) || 0.2;

    // Find the full user with swipe history
    const existingUser = await User.findById(user._id).select('likedItems dislikedItems preferenceTallies gender preferences');
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Get IDs of already swiped items
    const swipedItemIds = [
        ...existingUser.likedItems,
        ...existingUser.dislikedItems
    ];

    // Get the top features from tallies
    const topBrands = getTopFeatures(existingUser.preferenceTallies.brands, 5);
    const topStyles = getTopFeatures(existingUser.preferenceTallies.styles, 5);
    const topColors = getTopFeatures(existingUser.preferenceTallies.colors, 5);
    const topPriceRanges = getTopFeatures(existingUser.preferenceTallies.priceRanges, 3);
    const topCategories = getTopFeatures(existingUser.preferenceTallies.categories, 5);
    const topPatterns = getTopFeatures(existingUser.preferenceTallies.patterns, 3);

    // Build query for candidate items
    const candidateQuery = {
        isActive: true,
        _id: { $nin: swipedItemIds }
    };

    // Filter by gender only if the user is male or female
    if (existingUser.gender === "Male" || existingUser.gender === "Female") {
        candidateQuery.gender = { $in: [existingUser.gender.toLowerCase(), 'unisex'] };
    }

    // If we have top features, use them to build a preference query
    // Items matching any top feature will be included
    const preferenceConditions = [];
    
    if (topBrands.length > 0) {
        preferenceConditions.push({ brand: { $in: topBrands } });
    }
    if (topStyles.length > 0) {
        preferenceConditions.push({ style: { $in: topStyles } });
    }
    if (topColors.length > 0) {
        preferenceConditions.push({ availableColors: { $in: topColors } });
    }
    if (topCategories.length > 0) {
        preferenceConditions.push({ category: { $in: topCategories } });
    }
    if (topPatterns.length > 0) {
        preferenceConditions.push({ pattern: { $in: topPatterns } });
    }

    // Add price range conditions
    if (topPriceRanges.length > 0) {
        const priceConditions = [];
        topPriceRanges.forEach(range => {
            switch (range) {
                case '$0-50':
                    priceConditions.push({ price: { $gte: 0, $lt: 50 } });
                    break;
                case '$50-100':
                    priceConditions.push({ price: { $gte: 50, $lt: 100 } });
                    break;
                case '$100-200':
                    priceConditions.push({ price: { $gte: 100, $lt: 200 } });
                    break;
                case '$200+':
                    priceConditions.push({ price: { $gte: 200 } });
                    break;
            }
        });
        if (priceConditions.length > 0) {
            preferenceConditions.push({ $or: priceConditions });
        }
    }

    // If no features obtained from tallies, fall back to user's explicit preferences
    const prefs = existingUser.preferences || {};
    const hasTopFeature = [
        topBrands.length, topStyles.length, topColors.length,
        topPriceRanges.length, topCategories.length, topPatterns.length
    ].some(len => len > 0);

    if (!hasTopFeature) {
        const prefFallbackConditions = [];
        if (prefs.favoriteBrands && prefs.favoriteBrands.length) {
            prefFallbackConditions.push({ brand: { $in: prefs.favoriteBrands } });
        }
        if (prefs.stylePreferences && prefs.stylePreferences.length) {
            prefFallbackConditions.push({ style: { $in: prefs.stylePreferences } });
        }
        if (prefs.colorPreferences && prefs.colorPreferences.length) {
            prefFallbackConditions.push({ availableColors: { $in: prefs.colorPreferences } });
        }
        if (prefs.priceRange) {
            switch (prefs.priceRange) {
                case '$0-50':
                    prefFallbackConditions.push({ price: { $gte: 0, $lt: 50 } });
                    break;
                case '$50-100':
                    prefFallbackConditions.push({ price: { $gte: 50, $lt: 100 } });
                    break;
                case '$100-200':
                    prefFallbackConditions.push({ price: { $gte: 100, $lt: 200 } });
                    break;
                case '$200+':
                    prefFallbackConditions.push({ price: { $gte: 200 } });
                    break;
            }
        }
        if (prefFallbackConditions.length) {
            candidateQuery.$or = prefFallbackConditions;
        }
    } else if (preferenceConditions.length > 0) {
        candidateQuery.$or = preferenceConditions;
    }

    // Only show items available in the user's size
    const userSizes = [];
    if (prefs.shoeSize) userSizes.push(String(prefs.shoeSize));
    if (prefs.shirtSize) userSizes.push(prefs.shirtSize);
    if (prefs.pantsSize) userSizes.push(prefs.pantsSize);
    if (prefs.shortSize) userSizes.push(prefs.shortSize);
    
    if (userSizes.length > 0) {
        candidateQuery.availableSizes = { $in: userSizes };
    }

    // Fetch a larger pool of candidate items to allow for both scoring and exploration
    const poolSize = Math.min(limit * 5, 200);
    const candidateItems = await Item.find(candidateQuery).limit(poolSize);

    if (candidateItems.length === 0) {
        return res.status(200).json({
            items: [],
            message: 'No more items available',
            totalReturned: 0
        });
    }

    // Score each candidate item
    const scoredItems = candidateItems.map(item => ({
        item,
        score: scoreItem(existingUser, item)
    }));

    // Sort by score descending
    scoredItems.sort((a, b) => b.score - a.score);

    // Determine how many exploration items to include
    const explorationCount = Math.floor(limit * explorationRate);
    const personalizedCount = limit - explorationCount;

    // Take top personalized items
    const personalizedItems = scoredItems.slice(0, personalizedCount).map(si => si.item);

    // Take random exploration items from the rest of the pool
    const explorationPool = scoredItems.slice(personalizedCount);
    const explorationItems = [];
    
    if (explorationPool.length > 0) {
        // Shuffle and take exploration items
        const shuffled = explorationPool.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(explorationCount, shuffled.length); i++) {
            explorationItems.push(shuffled[i].item);
        }
    }

    // Combine personalized and exploration items by interleaving exploration
    // Insert exploration items at random slots between personalized items to avoid clustering
    let feedItems = [...personalizedItems];
    if (explorationItems.length > 0) {
        const slots = Array.from({ length: feedItems.length + 1 }, (_, i) => i);
        // Randomize slot order and choose as many slots as exploration items
        slots.sort(() => Math.random() - 0.5);
        const chosenSlots = slots.slice(0, explorationItems.length).sort((a, b) => a - b);
        chosenSlots.forEach((slotIndex, idx) => {
            feedItems.splice(slotIndex + idx, 0, explorationItems[idx]);
        });
    }

    res.status(200).json({
        items: feedItems,
        totalReturned: feedItems.length,
        personalizedCount: personalizedItems.length,
        explorationCount: explorationItems.length
    });
};

export const likeItem = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid like item data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    const { itemId } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item) throw new ValidationError([], 'Item not found');

    // Check if already liked
    if (existingUser.likedItems.includes(itemId)) {
        return res.status(200).json({ message: 'Item already liked' });
    }

    // Remove from disliked if it was previously disliked
    const wasDisliked = existingUser.dislikedItems.includes(itemId);
    if (wasDisliked) {
        existingUser.dislikedItems = existingUser.dislikedItems.filter(
            id => id.toString() !== itemId.toString()
        );
        // Update tallies: undo the dislike (add back) and then add the like
        updateTallies(existingUser, item, true); // Undo dislike
    }

    // Add to liked items
    existingUser.likedItems.push(itemId);

    // Update preference tallies
    updateTallies(existingUser, item, true);

    await existingUser.save();

    res.status(200).json({ 
        message: 'Item liked successfully',
        wasDisliked,
        likedItemsCount: existingUser.likedItems.length
    });
};

export const dislikeItem = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid dislike item data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    const { itemId } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item) throw new ValidationError([], 'Item not found');

    // Check if already disliked
    if (existingUser.dislikedItems.includes(itemId)) {
        return res.status(200).json({ message: 'Item already disliked' });
    }

    // Remove from liked if it was previously liked
    const wasLiked = existingUser.likedItems.includes(itemId);
    if (wasLiked) {
        existingUser.likedItems = existingUser.likedItems.filter(
            id => id.toString() !== itemId.toString()
        );
        // Update tallies: undo the like (subtract) and then subtract for dislike
        updateTallies(existingUser, item, false); // Undo like
    }

    // Add to disliked items
    existingUser.dislikedItems.push(itemId);

    // Update preference tallies (decrement)
    updateTallies(existingUser, item, false);

    await existingUser.save();

    res.status(200).json({ 
        message: 'Item disliked successfully',
        wasLiked,
        dislikedItemsCount: existingUser.dislikedItems.length
    });
};

export const undoSwipe = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array(), 'Invalid undo swipe data provided');
    }

    // User obtained from auth middleware
    const user = req.user;
    if (!user) throw new UnauthorizedError('Authentication required');

    const { itemId } = req.body;

    // Find the user
    const existingUser = await User.findById(user._id);
    if (!existingUser) throw new UnauthorizedError('User not found');

    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item) throw new ValidationError([], 'Item not found');

    const wasLiked = existingUser.likedItems.includes(itemId);
    const wasDisliked = existingUser.dislikedItems.includes(itemId);

    if (!wasLiked && !wasDisliked) {
        throw new ValidationError([], 'Item was not swiped');
    }

    // Remove from liked or disliked
    if (wasLiked) {
        existingUser.likedItems = existingUser.likedItems.filter(
            id => id.toString() !== itemId.toString()
        );
        // Undo the like tally update
        updateTallies(existingUser, item, false);
    }

    if (wasDisliked) {
        existingUser.dislikedItems = existingUser.dislikedItems.filter(
            id => id.toString() !== itemId.toString()
        );
        // Undo the dislike tally update (add back)
        updateTallies(existingUser, item, true);
    }

    await existingUser.save();

    res.status(200).json({ 
        message: 'Swipe undone successfully',
        wasLiked,
        wasDisliked
    });
};
