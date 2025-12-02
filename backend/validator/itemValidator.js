import { body } from 'express-validator';

export const validateLikeItem = [
    body('itemId')
        .notEmpty()
        .withMessage('Item ID is required')
        .isMongoId()
        .withMessage('Invalid item ID format')
];

export const validateDislikeItem = [
    body('itemId')
        .notEmpty()
        .withMessage('Item ID is required')
        .isMongoId()
        .withMessage('Invalid item ID format')
];

export const validateUndoSwipe = [
    body('itemId')
        .notEmpty()
        .withMessage('Item ID is required')
        .isMongoId()
        .withMessage('Invalid item ID format')
];
