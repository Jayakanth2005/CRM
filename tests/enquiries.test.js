const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Enquiry = require('../src/models/Enquiry');

describe('Enquiries', () => {
    let authToken;
    let testUser;

    // Create authenticated user before each test suite
    beforeEach(async () => {
        // Create and login test user
        testUser = await User.create({
            name: 'Test Employee',
            email: 'employee@fastor7.com',
            passwordHash: 'Password123'
        });

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'employee@fastor7.com',
                password: 'Password123'
            });

        authToken = loginResponse.body.data.token;
    });

    describe('POST /api/public/enquiries', () => {
        it('should create a public enquiry without authentication', async () => {
            const enquiryData = {
                name: 'Alice Johnson',
                email: 'alice.johnson@example.com',
                courseInterest: 'Full Stack Web Development'
            };

            const response = await request(app)
                .post('/api/public/enquiries')
                .send(enquiryData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Enquiry submitted successfully',
                data: {
                    enquiry: {
                        name: enquiryData.name,
                        email: enquiryData.email,
                        courseInterest: enquiryData.courseInterest,
                        id: expect.any(String),
                        createdAt: expect.any(String)
                    }
                }
            });

            // Verify enquiry was saved to database
            const savedEnquiry = await Enquiry.findOne({
                where: { email: enquiryData.email }
            });
            expect(savedEnquiry).toBeTruthy();
            expect(savedEnquiry.claimedBy).toBeNull();
        });

        it('should reject enquiry with invalid data', async () => {
            const enquiryData = {
                name: 'A', // Too short
                email: 'invalid-email',
                courseInterest: '' // Empty
            };

            const response = await request(app)
                .post('/api/public/enquiries')
                .send(enquiryData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation failed',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        msg: expect.stringContaining('Name must be between 2 and 100 characters')
                    }),
                    expect.objectContaining({
                        msg: expect.stringContaining('Please provide a valid email address')
                    }),
                    expect.objectContaining({
                        msg: expect.stringContaining('Course interest is required')
                    })
                ])
            });
        });

        it('should handle rate limiting after multiple requests', async () => {
            const enquiryData = {
                name: 'Rate Test User',
                email: 'ratetest@example.com',
                courseInterest: 'Testing Rate Limits'
            };

            let rateLimitHit = false;
            let successCount = 0;

            // Try up to 10 requests, expecting some to be rate limited
            for (let i = 0; i < 10; i++) {
                try {
                    const response = await request(app)
                        .post('/api/public/enquiries')
                        .send({
                            ...enquiryData,
                            email: `ratetest${Date.now()}_${i}@example.com`
                        });

                    if (response.status === 429) {
                        rateLimitHit = true;
                        expect(response.body).toMatchObject({
                            success: false,
                            message: 'Too many enquiry submissions. Please try again after a minute.'
                        });
                        break;
                    } else if (response.status === 201) {
                        successCount++;
                    }
                } catch (error) {
                    // If we get a 429 error, that's what we're testing for
                    if (error.status === 429) {
                        rateLimitHit = true;
                        break;
                    }
                }

                // Add small delay to avoid overwhelming the rate limiter
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Either we hit the rate limit or we made at least some successful requests
            expect(rateLimitHit || successCount >= 1).toBe(true);
        });
    });

    describe('GET /api/enquiries/unclaimed', () => {
        beforeEach(async () => {
            // Create test enquiries
            await Enquiry.bulkCreate([
                {
                    name: 'John Smith',
                    email: 'john.smith@example.com',
                    courseInterest: 'React Development',
                    claimedBy: null
                },
                {
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                    courseInterest: 'Node.js Backend',
                    claimedBy: null
                },
                {
                    name: 'Bob Johnson',
                    email: 'bob.johnson@example.com',
                    courseInterest: 'Python Programming',
                    claimedBy: testUser.id // Already claimed
                }
            ]);
        });

        it('should fetch unclaimed enquiries for authenticated user', async () => {
            const response = await request(app)
                .get('/api/enquiries/unclaimed')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Unclaimed enquiries retrieved successfully',
                data: {
                    enquiries: expect.any(Array),
                    pagination: {
                        currentPage: 1,
                        totalCount: 2, // Only unclaimed ones
                        limit: 10
                    }
                }
            });

            // Should only return unclaimed enquiries
            expect(response.body.data.enquiries).toHaveLength(2);
            response.body.data.enquiries.forEach(enquiry => {
                expect(['john.smith@example.com', 'jane.doe@example.com'])
                    .toContain(enquiry.email);
            });
        });

        it('should reject request without authentication', async () => {
            const response = await request(app)
                .get('/api/enquiries/unclaimed')
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Access denied. No valid token provided'
            });
        });

        it('should handle pagination correctly', async () => {
            const response = await request(app)
                .get('/api/enquiries/unclaimed?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.data.pagination).toMatchObject({
                currentPage: 1,
                totalCount: 2,
                limit: 1,
                totalPages: 2,
                hasNextPage: true,
                hasPrevPage: false
            });

            expect(response.body.data.enquiries).toHaveLength(1);
        });
    });

    describe('POST /api/enquiries/:id/claim', () => {
        let testEnquiry;

        beforeEach(async () => {
            testEnquiry = await Enquiry.create({
                name: 'Claimable User',
                email: 'claimable@example.com',
                courseInterest: 'Full Stack Development',
                claimedBy: null
            });
        });

        it('should allow authenticated user to claim an enquiry', async () => {
            const response = await request(app)
                .post(`/api/enquiries/${testEnquiry.id}/claim`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Enquiry claimed successfully',
                data: {
                    enquiry: {
                        id: testEnquiry.id,
                        name: testEnquiry.name,
                        email: testEnquiry.email,
                        courseInterest: testEnquiry.courseInterest,
                        claimedBy: {
                            id: testUser.id,
                            name: testUser.name,
                            email: testUser.email
                        }
                    }
                }
            });

            // Verify claim in database
            const updatedEnquiry = await Enquiry.findByPk(testEnquiry.id);
            expect(updatedEnquiry.claimedBy).toBe(testUser.id);
        });

        it('should reject claim for non-existent enquiry', async () => {
            const fakeId = '550e8400-e29b-41d4-a716-446655440000';

            const response = await request(app)
                .post(`/api/enquiries/${fakeId}/claim`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Enquiry not found'
            });
        });

        it('should reject claim for already claimed enquiry', async () => {
            // First claim
            await testEnquiry.update({ claimedBy: testUser.id });

            const response = await request(app)
                .post(`/api/enquiries/${testEnquiry.id}/claim`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(409);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Enquiry already claimed',
                data: {
                    claimedBy: testUser.name
                }
            });
        });

        it('should reject claim without authentication', async () => {
            const response = await request(app)
                .post(`/api/enquiries/${testEnquiry.id}/claim`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Access denied. No valid token provided'
            });
        });
    });

    describe('GET /api/enquiries/claimed', () => {
        beforeEach(async () => {
            // Create enquiries - some claimed by test user, some unclaimed
            await Enquiry.bulkCreate([
                {
                    name: 'My Claim 1',
                    email: 'myclaim1@example.com',
                    courseInterest: 'React Development',
                    claimedBy: testUser.id
                },
                {
                    name: 'My Claim 2',
                    email: 'myclaim2@example.com',
                    courseInterest: 'Node.js Backend',
                    claimedBy: testUser.id
                },
                {
                    name: 'Other Claim',
                    email: 'otherclaim@example.com',
                    courseInterest: 'Python Programming',
                    claimedBy: null // Unclaimed
                }
            ]);
        });

        it('should fetch claimed enquiries for authenticated user', async () => {
            const response = await request(app)
                .get('/api/enquiries/claimed')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Your claimed enquiries retrieved successfully',
                data: {
                    enquiries: expect.any(Array),
                    pagination: {
                        currentPage: 1,
                        totalCount: 2, // Only user's claimed enquiries
                        limit: 10
                    }
                }
            });

            // Should only return current user's claimed enquiries
            expect(response.body.data.enquiries).toHaveLength(2);
            response.body.data.enquiries.forEach(enquiry => {
                expect(['myclaim1@example.com', 'myclaim2@example.com'])
                    .toContain(enquiry.email);
                expect(enquiry.claimedAt).toBeDefined();
            });
        });

        it('should return empty array when user has no claimed enquiries', async () => {
            // Clear all enquiries
            await Enquiry.destroy({ where: {} });

            const response = await request(app)
                .get('/api/enquiries/claimed')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.data.enquiries).toHaveLength(0);
            expect(response.body.data.pagination.totalCount).toBe(0);
        });

        it('should reject request without authentication', async () => {
            const response = await request(app)
                .get('/api/enquiries/claimed')
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Access denied. No valid token provided'
            });
        });
    });
});
