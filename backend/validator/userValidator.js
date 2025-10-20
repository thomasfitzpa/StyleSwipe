import { body } from 'express-validator';

export const validateUserCreation = [
    // Username validation
    body('username')
        .exists({ checkFalsy: true, checkNull: true }).withMessage('Username is required.')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters.')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores.'),
    
    // Email validation
    body('email')
        .exists({ checkFalsy: true, checkNull: true }).withMessage('Email is required.')
        .isEmail().withMessage('Invalid email format.'),
    
    // Password validation
    body('password')
        .exists({ checkFalsy: true, checkNull: true }).withMessage('Password is required.')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,}$/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'),

    body('confirmPassword')
        .exists({ checkFalsy: true, checkNull: true }).withMessage('Confirm Password is required.')
        .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.')
];