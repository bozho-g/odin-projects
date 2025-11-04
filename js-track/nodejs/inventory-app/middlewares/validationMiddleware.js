const { body, validationResult } = require('express-validator');

const validateItem = [
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('make').notEmpty().withMessage('Make is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('year')
        .isInt({ min: 1886, max: new Date().getFullYear() })
        .withMessage('Year must be a valid number'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be a positive number'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be under 500 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(errors.array().map(err => err.msg).join(', '));
        }
        next();
    },
];

const validateCategory = [
    body('name').notEmpty().withMessage('Category name is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(errors.array().map(err => err.msg).join(', '));
        }
        next();
    },
];

module.exports = { validateItem, validateCategory };