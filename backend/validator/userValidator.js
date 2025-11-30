import { body } from 'express-validator';

export const validateUserCreation = [
    // Username validation
    body('username')
        .trim()
        .exists({ checkFalsy: true }).withMessage('Username is required.')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters.')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores.'),
    
    // Email validation
    body('email')
        .trim()
        .exists({ checkFalsy: true }).withMessage('Email is required.')
        .isEmail().withMessage('Invalid email format.'),
    
    // Password validation
    body('password')
        .exists({ checkFalsy: true }).withMessage('Password is required.')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,}$/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'),

    body('confirmPassword')
        .exists({ checkFalsy: true }).withMessage('Confirm Password is required.')
        .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.')
];

export const validateUserLogin = [
    // Username or Email validation
    body('identifier')
        .trim()
        .exists({ checkFalsy: true }).withMessage('Username or Email is required.')
        .custom((value) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isValidUsername = /^[a-zA-Z0-9_]+$/.test(value);
            if (!isEmail && !isValidUsername) {
                throw new Error('Must be a valid username or email.');
            }
            return true;
        }),

    // Password validation
    body('password')
        .exists({ checkFalsy: true }).withMessage('Password is required.')
];

export const validateUserOnboarding = [
    // Gender validation
    body('gender')
        .isIn(['Male', 'Female', 'Unisex'])
        .withMessage('Gender must be Male, Female, or Unisex.'),

    // Shoe size validation
    body('shoeSize')
        .isInt({ min: 4, max: 23 })
        .withMessage('Shoe size must be between 4 and 23.'),

    // Shirt size validation
    body('shirtSize')
        .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
        .withMessage('Shirt size must be one of: XS, S, M, L, XL, XXL.'),

    // Pants size validation
    body('pantsSize')
        .isIn(['26', '28', '30', '32', '34', '36', '38', '40'])
        .withMessage('Pants size must be one of: 26, 28, 30, 32, 34, 36, 38, 40.'),
        .isIn(['26', '28', '30', '32', '34', '36', '38', '40'])
        .withMessage('Pants size must be one of: 26, 28, 30, 32, 34, 36, 38, 40.'),

    // Short size validation
    body('shortSize')
        .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
        .withMessage('Short size must be one of: XS, S, M, L, XL, XXL.'),

    // Style preferences validation
    body('stylePreferences')
        .isArray()
        .withMessage('Style preferences must be an array.')
        .custom((value) => {
            const validStyles = ['Streetwear', 'Casual', 'Athletic', 'Formal', 'Vintage', 'Minimalist', 'Boho', 'Preppy', 'Grunge', 'Techwear'];
            return value.every(style => validStyles.includes(style));
        })
        .withMessage('Style preferences must be valid options.'),

    // Color preferences validation
    body('colorPreferences')
        .isArray()
        .withMessage('Color preferences must be an array.')
        .custom((value) => {
            const validColors = ['Black', 'White', 'Gray', 'Navy', 'Brown', 'Beige', 'Red', 'Blue', 'Green', 'Pastels'];
            return value.every(color => validColors.includes(color));
        })
        .withMessage('Color preferences must be valid options.'),

    // Favorite brands validation
    body('favoriteBrands')
        .isArray()
        .withMessage('Favorite brands must be an array.')
        .custom((value) => {
            const validBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', "Levi's", 'Patagonia', 'Vans', 'Converse', 'The North Face', 'Supreme', 'Stüssy', 'Other'];
            return value.every(brand => validBrands.includes(brand));
        })
        .withMessage('Favorite brands must be valid options.'),

    // Price range validation
    body('priceRange')
        .isIn(['$0-50', '$50-100', '$100-200', '$200+'])
        .withMessage('Price range must be one of: $0-50, $50-100, $100-200, $200+.')
];

export const validateAccountUpdate = [
    // Username validation
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters.')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores.'),
    
    // Email validation
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid email format.'),
    
    // Name validation
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters.'),
    
    // Bio validation (optional)
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters.'),
    
    // Gender validation (optional)
    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Unisex'])
        .withMessage('Gender must be Male, Female, or Unisex.'),
    
    // Date of birth validation (optional)
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date.'),
    
    // Profile picture validation (optional)
    body('profilePicture')
        .optional()
        .trim()
        .isURL().withMessage('Profile picture must be a valid URL.'),
    
    // Shoe size validation (optional)
    body('shoeSize')
        .optional()
        .isInt({ min: 4, max: 23 })
        .withMessage('Shoe size must be between 4 and 23.'),

    // Shirt size validation (optional)
    body('shirtSize')
        .optional()
        .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
        .withMessage('Shirt size must be one of: XS, S, M, L, XL, XXL.'),

    // Pants size validation (optional)
    body('pantsSize')
        .optional()
        .isIn(['26', '28', '30', '32', '34', '36', '38', '40'])
        .withMessage('Pants size must be one of: 26, 28, 30, 32, 34, 36, 38, 40.'),

    // Short size validation (optional)
    body('shortSize')
        .optional()
        .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
        .withMessage('Short size must be one of: XS, S, M, L, XL, XXL.'),

    // Style preferences validation (optional)
    body('stylePreferences')
        .optional()
        .isArray()
        .withMessage('Style preferences must be an array.')
        .custom((value) => {
            const validStyles = ['Streetwear', 'Casual', 'Athletic', 'Formal', 'Vintage', 'Minimalist', 'Boho', 'Preppy', 'Grunge', 'Techwear'];
            return value.every(style => validStyles.includes(style));
        })
        .withMessage('Style preferences must be valid options.'),

    // Color preferences validation (optional)
    body('colorPreferences')
        .optional()
        .isArray()
        .withMessage('Color preferences must be an array.')
        .custom((value) => {
            const validColors = ['Black', 'White', 'Gray', 'Navy', 'Brown', 'Beige', 'Red', 'Blue', 'Green', 'Pastels'];
            return value.every(color => validColors.includes(color));
        })
        .withMessage('Color preferences must be valid options.'),

    // Favorite brands validation (optional)
    body('favoriteBrands')
        .optional()
        .isArray()
        .withMessage('Favorite brands must be an array.')
        .custom((value) => {
            const validBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', "Levi's", 'Patagonia', 'Vans', 'Converse', 'The North Face', 'Supreme', 'Stüssy', 'Other'];
            return value.every(brand => validBrands.includes(brand));
        })
        .withMessage('Favorite brands must be valid options.'),

    // Price range validation (optional)
    body('priceRange')
        .optional()
        .isIn(['$0-50', '$50-100', '$100-200', '$200+'])
        .withMessage('Price range must be one of: $0-50, $50-100, $100-200, $200+.')
];