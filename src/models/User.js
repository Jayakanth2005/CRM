const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
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
        unique: {
            msg: 'Email address already in use'
        },
        validate: {
            isEmail: {
                msg: 'Please provide a valid email address'
            }
        }
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        // Hash password before saving
        beforeCreate: async (user) => {
            if (user.passwordHash) {
                const saltRounds = 12;
                user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('passwordHash')) {
                const saltRounds = 12;
                user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
            }
        }
    }
});

// Instance method to compare password
User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

// Remove sensitive data from JSON output
User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
};

module.exports = User;
