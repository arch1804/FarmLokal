const logger = require('../utils/logger');

const retryWithBackoff = async (fn, options = {}) => {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        factor = 2,
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
            const result = await fn();
            if (attempt > 0) {
                logger.info(`Retry successful on attempt ${attempt + 1}`);
            }
            return result;
        } catch (error) {
            lastError = error;

            if (error.response && error.response.status >= 400 && error.response.status < 500) {
                logger.warn(`Client error ${error.response.status}, not retrying`);
                throw error;
            }

            if (attempt === maxRetries) {
                logger.error(`All ${maxRetries + 1} attempts failed`);
                throw error;
            }

            const delay = Math.min(initialDelay * factor ** attempt, maxDelay);
            logger.warn(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};

module.exports = { retryWithBackoff };
