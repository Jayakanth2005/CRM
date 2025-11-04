const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enquiry = sequelize.define('Enquiry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Name is required'
            },
            len: {
                args: [2, 100],
                msg: 'Name must be between 2 and 100 characters'
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: {
                msg: 'Please provide a valid email address'
            }
        }
    },
    courseInterest: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'course_interest',
        validate: {
            notEmpty: {
                msg: 'Course interest is required'
            },
            len: {
                args: [2, 200],
                msg: 'Course interest must be between 2 and 200 characters'
            }
        }
    },
    claimedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'claimed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'enquiries',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['email']
        },
        {
            fields: ['claimed_by']
        },
        {
            fields: ['created_at']
        }
    ]
});

module.exports = Enquiry;
