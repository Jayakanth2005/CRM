const app = require('./app');
const config = require('./config');
const { sequelize, testConnection } = require('./config/database');
// Import models to register them
const User = require('./models/User');
const Enquiry = require('./models/Enquiry');

// Define model associations
User.hasMany(Enquiry, { foreignKey: 'claimedBy', as: 'claimedEnquiries' });
Enquiry.belongsTo(User, { foreignKey: 'claimedBy', as: 'claimedByUser' });

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database models (in production, use migrations)
        if (config.server.environment === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Database synchronized');
        }

        // Start server
        const server = app.listen(config.server.port, () => {
            console.log(`Server running on port ${config.server.port}`);
            console.log(`Environment: ${config.server.environment}`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`Received ${signal}. Shutting down gracefully...`);

            server.close(async () => {
                try {
                    await sequelize.close();
                    console.log('Database connection closed');
                    process.exit(0);
                } catch (error) {
                    console.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
