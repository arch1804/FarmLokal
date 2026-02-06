const axios = require('axios');
const CircuitBreaker = require('./circuitBreaker');
const { retryWithBackoff } = require('./retryService');
const { CacheService, CACHE_TTL } = require('./cacheService');
const logger = require('../utils/logger');

const apiClient = axios.create({
    baseURL: process.env.EXTERNAL_API_URL || 'https://fakestoreapi.com',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FarmLokal-Backend/1.0',
    },
});

const circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 30000,
});

const fetchExternalProducts = async () => {
    const cacheKey = 'external:supplier-products';

    try {
        const result = await circuitBreaker.execute(async () => {
            return retryWithBackoff(
                async () => {
                    logger.info('Fetching data from external API...');
                    const response = await apiClient.get('/products');
                    return response.data;
                },
                {
                    maxRetries: 3,
                    initialDelay: 1000,
                    factor: 2,
                }
            );
        });

        await CacheService.setCachedData(cacheKey, result, CACHE_TTL.EXTERNAL_API);

        return {
            success: true,
            source: 'external-api',
            data: result,
            circuitBreakerState: circuitBreaker.getState(),
        };
    } catch (error) {
        logger.error(`External API error: ${error.message}`);

        const cachedData = await CacheService.getCachedData(cacheKey);

        if (cachedData) {
            logger.info('Returning cached data as fallback');
            return {
                success: true,
                source: 'cache-fallback',
                data: cachedData,
                circuitBreakerState: circuitBreaker.getState(),
                warning: 'External API unavailable, serving cached data',
            };
        }

        return {
            success: false,
            source: 'error',
            data: [],
            circuitBreakerState: circuitBreaker.getState(),
            error: error.message,
            message: 'External API unavailable and no cached data available',
        };
    }
};

const getCircuitBreakerStatus = () => circuitBreaker.getState();

module.exports = {
    fetchExternalProducts,
    getCircuitBreakerStatus,
};
