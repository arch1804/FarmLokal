const mongoose = require('mongoose');
const User = require('../../src/models/User');

describe('User Model', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlokal-test');
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    describe('User Creation', () => {
        it('should create a valid user', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                oauthProvider: 'google',
                oauthId: 'google-123',
            };

            const user = await User.create(userData);

            expect(user.email).toBe(userData.email);
            expect(user.name).toBe(userData.name);
            expect(user.oauthProvider).toBe(userData.oauthProvider);
            expect(user.oauthId).toBe(userData.oauthId);
            expect(user.role).toBe('user'); // default role
        });

        it('should fail without required fields', async () => {
            const user = new User({});

            let error;
            try {
                await user.save();
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.email).toBeDefined();
            expect(error.errors.name).toBeDefined();
        });

        it('should validate email format', async () => {
            const userData = {
                email: 'invalid-email',
                name: 'Test User',
                oauthProvider: 'google',
                oauthId: 'google-123',
            };

            let error;
            try {
                await User.create(userData);
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.email).toBeDefined();
        });

        it('should enforce unique email', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                oauthProvider: 'google',
                oauthId: 'google-123',
            };

            await User.create(userData);

            let error;
            try {
                await User.create({ ...userData, oauthId: 'google-456' });
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.code).toBe(11000); // Duplicate key error
        });
    });

    describe('User Methods', () => {
        it('should update last login', async () => {
            const user = await User.create({
                email: 'test@example.com',
                name: 'Test User',
                oauthProvider: 'google',
                oauthId: 'google-123',
            });

            const originalLogin = user.lastLogin;
            await new Promise((resolve) => setTimeout(resolve, 100));

            await user.updateLastLogin();

            expect(user.lastLogin.getTime()).toBeGreaterThan(originalLogin.getTime());
        });
    });
});
