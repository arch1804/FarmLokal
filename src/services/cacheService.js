const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
    static async getCachedData(key) {
        try {
            const client = getRedisClient();
            if (!client || !client.isOpen) {
                logger.warn('Redis client not available, cache miss');
                return null;
            }

            const data = await client.get(key);
            if (data) {
                logger.info(`Cache HIT: ${key}`);
                return JSON.parse(data);
            }

            logger.info(`Cache MISS: ${key}`);
            return null;
        } catch (error) {
            logger.error(`Error getting cached data for key ${key}: ${error.message}`);
            return null;
        }
    }

    static async setCachedData(key, data, ttl = 300) {
        try {
            const client = getRedisClient();
            if (!client || !client.isOpen) {
                logger.warn('Redis client not available, skipping cache set');
                return false;
            }

            await client.setEx(key, ttl, JSON.stringify(data));
            logger.info(`Cache SET: ${key} (TTL: ${ttl}s)`);
            return true;
        } catch (error) {
            logger.error(`Error setting cached data for key ${key}: ${error.message}`);
            return false;
        }
    }

    static async deleteCachedData(pattern) {
        try {
            const client = getRedisClient();
            if (!client || !client.isOpen) {
                logger.warn('Redis client not available, skipping cache delete');
                return 0;
            }

            const keys = await client.keys(pattern);
            if (keys.length === 0) {
                logger.info(`No keys found matching pattern: ${pattern}`);
                return 0;
            }

            const deleted = await client.del(keys);
            logger.info(`Cache DELETE: ${deleted} keys matching pattern ${pattern}`);
            return deleted;
        } catch (error) {
            logger.error(`Error deleting cached data for pattern ${pattern}: ${error.message}`);
            return 0;
        }
    }

    static async clearAllCache() {
        try {
            const client = getRedisClient();
            if (!client || !client.isOpen) {
                logger.warn('Redis client not available, skipping cache clear');
                return false;
            }

            await client.flushAll();
            logger.info('Cache CLEARED: All keys deleted');
            return true;
        } catch (error) {
            logger.error(`Error clearing all cache: ${error.message}`);
            return false;
        }
    }

    static async deleteKey(key) {
        try {
            const client = getRedisClient();
            if (!client || !client.isOpen) {
                return false;
            }

            await client.del(key);
            logger.info(`Cache DELETE: ${key}`);
            return true;
        } catch (error) {
            logger.error(`Error deleting key ${key}: ${error.message}`);
            return false;
        }
    }
}

const CACHE_TTL = {
    PRODUCT_LIST: 300,
    PRODUCT_SINGLE: 3600,
    USER_DATA: 1800,
    EXTERNAL_API: 600,
    CATEGORY_LIST: 1800,
};

module.exports = { CacheService, CACHE_TTL };
