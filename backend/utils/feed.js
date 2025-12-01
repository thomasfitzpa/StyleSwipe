// Determine the price range bucket for a given price
export const getPriceRange = (price) => {
    if (price < 50) return '$0-50';
    if (price < 100) return '$50-100';
    if (price < 200) return '$100-200';
    return '$200+';
};

// Update a user's preference tallies based on an item
// increment=true increases tallies; false decreases them
export const updateTallies = (user, item, increment = true) => {
    const tally = increment ? 1 : -1;

    // Brand
    if (item.brand) {
        const currentBrand = user.preferenceTallies.brands.get(item.brand) || 0;
        user.preferenceTallies.brands.set(item.brand, currentBrand + tally);
    }

    // Styles
    if (item.style && Array.isArray(item.style)) {
        item.style.forEach(s => {
            const currentStyle = user.preferenceTallies.styles.get(s) || 0;
            user.preferenceTallies.styles.set(s, currentStyle + tally);
        });
    }

    // Colors
    if (item.availableColors && Array.isArray(item.availableColors)) {
        item.availableColors.forEach(c => {
            const currentColor = user.preferenceTallies.colors.get(c) || 0;
            user.preferenceTallies.colors.set(c, currentColor + tally);
        });
    }

    // Price range
    if (item.price !== undefined) {
        const priceRange = getPriceRange(item.price);
        const currentPriceRange = user.preferenceTallies.priceRanges.get(priceRange) || 0;
        user.preferenceTallies.priceRanges.set(priceRange, currentPriceRange + tally);
    }

    // Category
    if (item.category) {
        const currentCategory = user.preferenceTallies.categories.get(item.category) || 0;
        user.preferenceTallies.categories.set(item.category, currentCategory + tally);
    }

    // Pattern
    if (item.pattern) {
        const currentPattern = user.preferenceTallies.patterns.get(item.pattern) || 0;
        user.preferenceTallies.patterns.set(item.pattern, currentPattern + tally);
    }
};

// Get the top N features (by score) from a Map<string, number>
export const getTopFeatures = (preferences, count = 3) => {
    const entries = Array.from(preferences.entries());
    const positive = entries.filter(([, score]) => score > 0);
    positive.sort((a, b) => b[1] - a[1]);
    return positive.slice(0, count).map(([feature]) => feature);
};

// Compute a score for an item using the user's tallies
export const scoreItem = (user, item) => {
    let score = 0;

    if (item.brand) {
        score += user.preferenceTallies.brands.get(item.brand) || 0;
    }

    if (item.style && Array.isArray(item.style)) {
        item.style.forEach(s => {
            score += user.preferenceTallies.styles.get(s) || 0;
        });
    }

    if (item.availableColors && Array.isArray(item.availableColors)) {
        item.availableColors.forEach(c => {
            score += user.preferenceTallies.colors.get(c) || 0;
        });
    }

    if (item.price !== undefined) {
        const priceRange = getPriceRange(item.price);
        score += user.preferenceTallies.priceRanges.get(priceRange) || 0;
    }

    if (item.category) {
        score += user.preferenceTallies.categories.get(item.category) || 0;
    }

    if (item.pattern) {
        score += user.preferenceTallies.patterns.get(item.pattern) || 0;
    }

    return score;
};
