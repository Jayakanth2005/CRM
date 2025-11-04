const express = require('express');
const { getUnclaimedEnquiries, claimEnquiry, getMyEnquiries } = require('../controllers/enquiryController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/enquiries/unclaimed - Get all unclaimed enquiries
router.get('/unclaimed', getUnclaimedEnquiries);

// POST /api/enquiries/:id/claim - Claim an enquiry
router.post('/:id/claim', claimEnquiry);

// GET /api/enquiries/claimed - Get user's claimed enquiries
router.get('/claimed', getMyEnquiries);

module.exports = router;
