const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No valid token provided'
            });
        }

        // Extract token
        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Find user
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

module.exports = auth;
