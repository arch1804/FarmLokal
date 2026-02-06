const { fetchExternalProducts, getCircuitBreakerStatus } = require('../services/externalApi');
const logger = require('../utils/logger');

const getSupplierProducts = async (req, res) => {
    try {
        const result = await fetchExternalProducts();
        const statusCode = result.success ? 200 : 503;

        res.set('X-Circuit-Breaker-State', result.circuitBreakerState.state);

        res.status(statusCode).json(result);
    } catch (error) {
        logger.error(`Get supplier products error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

const getStatus = async (req, res) => {
    try {
        const status = getCircuitBreakerStatus();

        res.status(200).json({
            success: true,
            data: status,
        });
    } catch (error) {
        logger.error(`Get status error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching status',
            error: error.message,
        });
    }
};

module.exports = {
    getSupplierProducts,
    getStatus,
};
