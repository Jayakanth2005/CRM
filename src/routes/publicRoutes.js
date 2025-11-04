const express = require('express');
const rateLimit = require('express-rate-limit');
const { createEnquiry } = require('../controllers/enquiryController');
const { validateEnquiry } = require('../middleware/validation');

const router = express.Router();

// Rate limiting for enquiry submissions - 5 requests per minute
const enquiryLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Maximum 5 requests per minute
    message: {
        success: false,
        message: 'Too many enquiry submissions. Please try again after a minute.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// POST /api/public/enquiries - Submit new enquiry (no authentication required)
router.post('/enquiries', enquiryLimiter, validateEnquiry, createEnquiry);

module.exports = router;
