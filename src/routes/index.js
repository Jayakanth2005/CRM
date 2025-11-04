const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const publicRoutes = require('./publicRoutes');
const enquiryRoutes = require('./enquiryRoutes');

const router = express.Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/enquiries', enquiryRoutes);

module.exports = router;
