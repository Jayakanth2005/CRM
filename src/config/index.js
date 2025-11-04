require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development'
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'fastor7_crm',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    }
};

module.exports = config;
