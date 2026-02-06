const mongoose = require('mongoose');
const Product = require('../../src/models/Product');
const Category = require('../../src/models/Category');

describe('Product Model', () => {
    let categoryId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlokal-test');

        // Create a test category
        const category = await Category.create({
            name: 'Test Category',
            slug: 'test-category',
        });
        categoryId = category._id;
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await Product.deleteMany({});
    });

    describe('Product Creation', () => {
        it('should create a valid product', async () => {
            const productData = {
                name: 'Test Product',
                description: 'Test description',
                price: 100,
                category: categoryId,
                stock: 50,
            };

            const product = await Product.create(productData);

            expect(product.name).toBe(productData.name);
            expect(product.price).toBe(productData.price);
            expect(product.stock).toBe(productData.stock);
            expect(product.isActive).toBe(true); // default value
        });

        it('should fail without required fields', async () => {
            const product = new Product({});

            let error;
            try {
                await product.save();
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
            expect(error.errors.description).toBeDefined();
            expect(error.errors.price).toBeDefined();
            expect(error.errors.category).toBeDefined();
        });

        it('should not allow negative price', async () => {
            const productData = {
                name: 'Test Product',
                description: 'Test description',
                price: -10,
                category: categoryId,
                stock: 50,
            };

            let error;
            try {
                await Product.create(productData);
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.price).toBeDefined();
        });

        it('should not allow negative stock', async () => {
            const productData = {
                name: 'Test Product',
                description: 'Test description',
                price: 100,
                category: categoryId,
                stock: -5,
            };

            let error;
            try {
                await Product.create(productData);
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.stock).toBeDefined();
        });
    });

    describe('Product Virtuals', () => {
        it('should return inStock true when stock > 0', async () => {
            const product = await Product.create({
                name: 'Test Product',
                description: 'Test description',
                price: 100,
                category: categoryId,
                stock: 10,
            });

            expect(product.inStock).toBe(true);
        });

        it('should return inStock false when stock = 0', async () => {
            const product = await Product.create({
                name: 'Test Product',
                description: 'Test description',
                price: 100,
                category: categoryId,
                stock: 0,
            });

            expect(product.inStock).toBe(false);
        });
    });
});
