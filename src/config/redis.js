const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                reconnectStrategy: false, // Disable automatic reconnection
                connectTimeout: 5000, // 5 second timeout
            },
            password: process.env.REDIS_PASSWORD || undefined,
        });

        redisClient.on('error', (err) => {
            logger.error(`Redis Client Error: ${err}`);
            console.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            logger.info('Redis client connecting...');
            console.log('Redis client connecting...');
        });

        redisClient.on('ready', () => {
            logger.info('Redis client ready');
            console.log('Redis client connected and ready');
        });

        redisClient.on('reconnecting', () => {
            logger.warn('Redis client reconnecting...');
        });

        redisClient.on('end', () => {
            logger.warn('Redis client disconnected');
        });

        await redisClient.connect();

        return redisClient;
    } catch (error) {
        logger.error(`Error connecting to Redis: ${error.message}`);
        console.error(`Redis connection error: ${error.message}`);
        // Don't exit process - app can run without Redis (degraded mode)
        return null;
    }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
