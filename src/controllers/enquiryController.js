const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');

// Create new enquiry from public form
const createEnquiry = async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, courseInterest } = req.body;

        // Create new enquiry
        const enquiry = await Enquiry.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            courseInterest: courseInterest.trim(),
            claimedBy: null // Initially unclaimed
        });

        res.status(201).json({
            success: true,
            message: 'Enquiry submitted successfully',
            data: {
                enquiry: {
                    id: enquiry.id,
                    name: enquiry.name,
                    email: enquiry.email,
                    courseInterest: enquiry.courseInterest,
                    createdAt: enquiry.createdAt
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get all unclaimed enquiries with pagination and sorting
const getUnclaimedEnquiries = async (req, res, next) => {
    try {
        // Extract pagination and sorting parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
        const offset = (page - 1) * limit;

        // Validate sort field
        const allowedSortFields = ['createdAt', 'name', 'email', 'courseInterest'];
        const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

        // Fetch unclaimed enquiries
        const { count, rows: enquiries } = await Enquiry.findAndCountAll({
            where: {
                claimedBy: null
            },
            order: [[finalSortBy, sortOrder]],
            limit,
            offset,
            attributes: ['id', 'name', 'email', 'courseInterest', 'createdAt']
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            success: true,
            message: 'Unclaimed enquiries retrieved successfully',
            data: {
                enquiries,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount: count,
                    limit,
                    hasNextPage,
                    hasPrevPage
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// Claim an enquiry by authenticated user
const claimEnquiry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the enquiry
        const enquiry = await Enquiry.findByPk(id);
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }

        // Check if already claimed
        if (enquiry.claimedBy) {
            const claimedByUser = await User.findByPk(enquiry.claimedBy);
            return res.status(409).json({
                success: false,
                message: 'Enquiry already claimed',
                data: {
                    claimedBy: claimedByUser ? claimedByUser.name : 'Unknown user'
                }
            });
        }

        // Claim the enquiry
        await enquiry.update({ claimedBy: userId });

        // Fetch updated enquiry with user details
        const updatedEnquiry = await Enquiry.findByPk(id, {
            include: [{
                model: User,
                as: 'claimedByUser',
                attributes: ['id', 'name', 'email']
            }]
        });

        res.status(200).json({
            success: true,
            message: 'Enquiry claimed successfully',
            data: {
                enquiry: {
                    id: updatedEnquiry.id,
                    name: updatedEnquiry.name,
                    email: updatedEnquiry.email,
                    courseInterest: updatedEnquiry.courseInterest,
                    claimedAt: updatedEnquiry.updatedAt,
                    claimedBy: updatedEnquiry.claimedByUser
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get all enquiries claimed by authenticated user
const getMyEnquiries = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Extract pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'updatedAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
        const offset = (page - 1) * limit;

        // Validate sort field
        const allowedSortFields = ['updatedAt', 'createdAt', 'name', 'email', 'courseInterest'];
        const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'updatedAt';

        // Fetch user's claimed enquiries
        const { count, rows: enquiries } = await Enquiry.findAndCountAll({
            where: {
                claimedBy: userId
            },
            order: [[finalSortBy, sortOrder]],
            limit,
            offset,
            attributes: ['id', 'name', 'email', 'courseInterest', 'createdAt', 'updatedAt']
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            success: true,
            message: 'Your claimed enquiries retrieved successfully',
            data: {
                enquiries: enquiries.map(enquiry => ({
                    id: enquiry.id,
                    name: enquiry.name,
                    email: enquiry.email,
                    courseInterest: enquiry.courseInterest,
                    createdAt: enquiry.createdAt,
                    claimedAt: enquiry.updatedAt
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount: count,
                    limit,
                    hasNextPage,
                    hasPrevPage
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEnquiry,
    getUnclaimedEnquiries,
    claimEnquiry,
    getMyEnquiries
};
