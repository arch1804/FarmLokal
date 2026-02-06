require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const logger = require('../utils/logger');

// Sample data
const categories = [
    { name: 'Vegetables', slug: 'vegetables', description: 'Fresh organic vegetables' },
    { name: 'Fruits', slug: 'fruits', description: 'Seasonal fresh fruits' },
    { name: 'Dairy', slug: 'dairy', description: 'Milk, cheese, and dairy products' },
    { name: 'Grains', slug: 'grains', description: 'Rice, wheat, and other grains' },
    { name: 'Organic', slug: 'organic', description: 'Certified organic products' },
];

const users = [
    {
        email: 'admin@farmlokal.com',
        name: 'Admin User',
        oauthProvider: 'google',
        oauthId: 'admin-google-id-123',
        role: 'admin',
    },
    {
        email: 'user1@example.com',
        name: 'John Doe',
        oauthProvider: 'google',
        oauthId: 'user1-google-id-456',
        role: 'user',
    },
    {
        email: 'user2@example.com',
        name: 'Jane Smith',
        oauthProvider: 'github',
        oauthId: 'user2-github-id-789',
        role: 'user',
    },
];

const generateProducts = (categories) => {
    const vegetables = [
        'Tomatoes', 'Potatoes', 'Onions', 'Carrots', 'Cabbage', 'Spinach', 'Broccoli', 'Cauliflower',
        'Bell Peppers', 'Cucumbers', 'Lettuce', 'Radish', 'Beetroot', 'Pumpkin', 'Zucchini',
    ];

    const fruits = [
        'Apples', 'Bananas', 'Oranges', 'Mangoes', 'Grapes', 'Strawberries', 'Watermelon',
        'Pineapple', 'Papaya', 'Guava', 'Pomegranate', 'Kiwi', 'Dragon Fruit', 'Lychee',
    ];

    const dairy = [
        'Whole Milk', 'Skimmed Milk', 'Cheddar Cheese', 'Mozzarella', 'Yogurt', 'Butter',
        'Cream', 'Paneer', 'Cottage Cheese',
    ];

    const grains = [
        'Basmati Rice', 'Brown Rice', 'Wheat Flour', 'Oats', 'Quinoa', 'Barley', 'Millet',
        'Corn', 'Buckwheat',
    ];

    const organic = [
        'Organic Honey', 'Organic Eggs', 'Organic Tea', 'Organic Coffee', 'Organic Spices',
        'Organic Nuts', 'Organic Seeds',
    ];

    const products = [];
    const vegCat = categories.find((c) => c.slug === 'vegetables');
    const fruitCat = categories.find((c) => c.slug === 'fruits');
    const dairyCat = categories.find((c) => c.slug === 'dairy');
    const grainCat = categories.find((c) => c.slug === 'grains');
    const organicCat = categories.find((c) => c.slug === 'organic');

    // Generate vegetable products
    vegetables.forEach((name, index) => {
        products.push({
            name,
            description: `Fresh ${name.toLowerCase()} sourced from local farms`,
            price: Math.floor(Math.random() * 100) + 20,
            category: vegCat._id,
            stock: Math.floor(Math.random() * 500) + 50,
            unit: 'kg',
            images: [`https://via.placeholder.com/400x300?text=${name.replace(' ', '+')}`],
            views: Math.floor(Math.random() * 1000),
        });
    });

    // Generate fruit products
    fruits.forEach((name) => {
        products.push({
            name,
            description: `Sweet and juicy ${name.toLowerCase()}`,
            price: Math.floor(Math.random() * 150) + 30,
            category: fruitCat._id,
            stock: Math.floor(Math.random() * 300) + 30,
            unit: 'kg',
            images: [`https://via.placeholder.com/400x300?text=${name.replace(' ', '+')}`],
            views: Math.floor(Math.random() * 800),
        });
    });

    // Generate dairy products
    dairy.forEach((name) => {
        products.push({
            name,
            description: `Premium quality ${name.toLowerCase()}`,
            price: Math.floor(Math.random() * 200) + 50,
            category: dairyCat._id,
            stock: Math.floor(Math.random() * 200) + 20,
            unit: 'liter',
            images: [`https://via.placeholder.com/400x300?text=${name.replace(' ', '+')}`],
            views: Math.floor(Math.random() * 600),
        });
    });

    // Generate grain products
    grains.forEach((name) => {
        products.push({
            name,
            description: `High-quality ${name.toLowerCase()}`,
            price: Math.floor(Math.random() * 80) + 40,
            category: grainCat._id,
            stock: Math.floor(Math.random() * 1000) + 100,
            unit: 'kg',
            images: [`https://via.placeholder.com/400x300?text=${name.replace(' ', '+')}`],
            views: Math.floor(Math.random() * 500),
        });
    });

    // Generate organic products
    organic.forEach((name) => {
        products.push({
            name,
            description: `Certified organic ${name.toLowerCase()}`,
            price: Math.floor(Math.random() * 300) + 100,
            category: organicCat._id,
            stock: Math.floor(Math.random() * 150) + 10,
            unit: 'piece',
            images: [`https://via.placeholder.com/400x300?text=${name.replace(' ', '+')}`],
            views: Math.floor(Math.random() * 400),
        });
    });

    return products;
};

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});

        // Insert categories
        console.log('Seeding categories...');
        const createdCategories = await Category.insertMany(categories);
        console.log(`✓ Created ${createdCategories.length} categories`);

        // Insert users
        console.log('Seeding users...');
        const createdUsers = await User.insertMany(users);
        console.log(`✓ Created ${createdUsers.length} users`);

        // Generate and insert products
        console.log('Seeding products...');
        const products = generateProducts(createdCategories);
        const createdProducts = await Product.insertMany(products);
        console.log(`✓ Created ${createdProducts.length} products`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Users:');
        console.log('- Admin: admin@farmlokal.com (role: admin)');
        console.log('- User 1: user1@example.com (role: user)');
        console.log('- User 2: user2@example.com (role: user)');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        logger.error(`Database seeding error: ${error.message}`);
        process.exit(1);
    }
};

seedDatabase();
