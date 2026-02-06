const Product = require('../models/Product');
const { CacheService, CACHE_TTL } = require('../services/cacheService');
const logger = require('../utils/logger');

const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            minPrice,
            maxPrice,
            sort = 'createdAt',
            order = 'desc',
            search,
        } = req.query;

        const cacheKey = `products:list:${JSON.stringify(req.query)}`;
        const cachedData = await CacheService.getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                ...cachedData,
            });
        }

        const query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$text = { $search: search };
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const sortOrder = order === 'asc' ? 1 : -1;
        const sortObj = { [sort]: sortOrder };
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const total = await Product.countDocuments(query);

        const result = {
            count: products.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: products,
        };

        await CacheService.setCachedData(cacheKey, result, CACHE_TTL.PRODUCT_LIST);

        res.status(200).json({
            success: true,
            source: 'database',
            ...result,
        });
    } catch (error) {
        logger.error(`Get products error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message,
        });
    }
};

const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `product:${id}`;

        const cachedData = await CacheService.getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData,
            });
        }

        const product = await Product.findById(id).populate('category', 'name slug description').lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        Product.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
        await CacheService.setCachedData(cacheKey, product, CACHE_TTL.PRODUCT_SINGLE);

        res.status(200).json({
            success: true,
            source: 'database',
            data: product,
        });
    } catch (error) {
        logger.error(`Get product error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message,
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        await CacheService.deleteCachedData('products:list:*');

        logger.info(`Product created: ${product.name} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        logger.error(`Create product error: ${error.message}`);
        res.status(400).json({
            success: false,
            message: 'Error creating product',
            error: error.message,
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        await CacheService.deleteKey(`product:${id}`);
        await CacheService.deleteCachedData('products:list:*');

        logger.info(`Product updated: ${product.name} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        logger.error(`Update product error: ${error.message}`);
        res.status(400).json({
            success: false,
            message: 'Error updating product',
            error: error.message,
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        await CacheService.deleteKey(`product:${id}`);
        await CacheService.deleteCachedData('products:list:*');

        logger.info(`Product deleted: ${product.name} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        logger.error(`Delete product error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message,
        });
    }
};

const autocompleteSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters',
            });
        }

        const products = await Product.find({
            isActive: true,
            name: { $regex: q, $options: 'i' },
        })
            .select('name price')
            .limit(10)
            .lean();

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        logger.error(`Autocomplete search error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message,
        });
    }
};

const getPopularProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const cacheKey = `products:popular:${limit}`;
        const cachedData = await CacheService.getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData,
            });
        }

        const products = await Product.find({ isActive: true })
            .sort({ views: -1 })
            .limit(parseInt(limit, 10))
            .populate('category', 'name slug')
            .lean();

        await CacheService.setCachedData(cacheKey, products, CACHE_TTL.PRODUCT_LIST);

        res.status(200).json({
            success: true,
            source: 'database',
            data: products,
        });
    } catch (error) {
        logger.error(`Get popular products error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching popular products',
            error: error.message,
        });
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    autocompleteSearch,
    getPopularProducts,
};
