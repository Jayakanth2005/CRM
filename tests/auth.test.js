const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new employee successfully', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john.doe@fastor7.com',
                password: 'Password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Verify response structure
            expect(response.body).toMatchObject({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        name: userData.name,
                        email: userData.email
                    },
                    token: expect.any(String)
                }
            });

            // Verify user was created in database
            const savedUser = await User.findOne({ where: { email: userData.email } });
            expect(savedUser).toBeTruthy();
            expect(savedUser.name).toBe(userData.name);
            expect(savedUser.passwordHash).not.toBe(userData.password); // Should be hashed
        });

        it('should reject registration with invalid email', async () => {
            const userData = {
                name: 'John Doe',
                email: 'invalid-email',
                password: 'Password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation failed',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Please provide a valid email address'
                    })
                ])
            });
        });

        it('should reject registration with weak password', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john.doe@fastor7.com',
                password: 'weak'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation failed'
            });
        });

        it('should reject duplicate email registration', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john.doe@fastor7.com',
                password: 'Password123'
            };

            // First registration
            await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Duplicate registration
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(409);

            expect(response.body).toMatchObject({
                success: false,
                message: 'User with this email already exists'
            });
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user before each login test
            await User.create({
                name: 'Test User',
                email: 'test@fastor7.com',
                passwordHash: 'Password123'
            });
        });

        it('should login successfully with valid credentials', async () => {
            const loginData = {
                email: 'test@fastor7.com',
                password: 'Password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        name: 'Test User',
                        email: loginData.email
                    },
                    token: expect.any(String)
                }
            });
        });

        it('should reject login with invalid email', async () => {
            const loginData = {
                email: 'nonexistent@fastor7.com',
                password: 'Password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Invalid email or password'
            });
        });

        it('should reject login with invalid password', async () => {
            const loginData = {
                email: 'test@fastor7.com',
                password: 'WrongPassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Invalid email or password'
            });
        });

        it('should reject login with malformed email', async () => {
            const loginData = {
                email: 'invalid-email',
                password: 'Password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation failed'
            });
        });
    });
});
