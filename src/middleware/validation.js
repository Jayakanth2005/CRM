const { body } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .trim(),

    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation rules for user login
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Validation rules for enquiry creation
const validateEnquiry = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .trim(),

    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),

    body('courseInterest')
        .notEmpty()
        .withMessage('Course interest is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Course interest must be between 2 and 200 characters')
        .trim()
];

module.exports = {
    validateRegister,
    validateLogin,
    validateEnquiry
};
