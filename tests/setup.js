const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Enquiry = require('../src/models/Enquiry');

// Set up database associations
User.hasMany(Enquiry, { foreignKey: 'claimedBy', as: 'claimedEnquiries' });
Enquiry.belongsTo(User, { foreignKey: 'claimedBy', as: 'claimedByUser' });

// Setup before all tests
beforeAll(async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Test database connected successfully');

        // Sync database with force: true to start with clean slate
        await sequelize.sync({ force: true });
        console.log('Test database synchronized');
    } catch (error) {
        console.error('Test database setup failed:', error);
        throw error;
    }
});

// Cleanup before each test to ensure isolation
beforeEach(async () => {
    try {
        // Clear all tables in correct order (respect foreign keys)
        await Enquiry.destroy({ where: {}, force: true });
        await User.destroy({ where: {}, force: true });
    } catch (error) {
        console.error('Test cleanup failed:', error);
    }
});

// Cleanup after all tests
afterAll(async () => {
    try {
        await sequelize.close();
        console.log('Test database connection closed');
    } catch (error) {
        console.error('Test database cleanup failed:', error);
    }
});
