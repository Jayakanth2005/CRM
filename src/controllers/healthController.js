const { sequelize } = require('../config/database');

const getHealth = async (req, res) => {
    try {
        // Check database connection
        await sequelize.authenticate();

        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
};

module.exports = {
    getHealth
};
