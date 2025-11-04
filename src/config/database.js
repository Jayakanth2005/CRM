const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration object
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.NODE_ENV === 'test'
        ? (process.env.DB_NAME || 'fastor7_crm_test')
        : (process.env.DB_NAME || 'fastor7_crm'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// Create Sequelize instance
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: config.pool
    }
);

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    testConnection
};
