const logger = require('../utils/logger');

const STATES = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN',
};

class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 3;
        this.resetTimeout = options.resetTimeout || 30000;
        this.state = STATES.CLOSED;
        this.failureCount = 0;
        this.nextAttempt = Date.now();
        this.successCount = 0;
    }

    async execute(fn) {
        if (this.state === STATES.OPEN) {
            if (Date.now() < this.nextAttempt) {
                const error = new Error('Circuit breaker is OPEN');
                error.circuitBreakerOpen = true;
                throw error;
            }

            this.state = STATES.HALF_OPEN;
            logger.info('Circuit breaker moved to HALF_OPEN state');
        }

        try {
            const result = await fn();

            if (this.state === STATES.HALF_OPEN) {
                this.successCount += 1;
                logger.info('Circuit breaker test successful, moving to CLOSED state');
                this.close();
            } else {
                this.failureCount = 0;
            }

            return result;
        } catch (error) {
            this.failureCount += 1;
            logger.error(`Circuit breaker failure ${this.failureCount}/${this.failureThreshold}: ${error.message}`);

            if (this.failureCount >= this.failureThreshold) {
                this.open();
            }

            throw error;
        }
    }

    open() {
        this.state = STATES.OPEN;
        this.nextAttempt = Date.now() + this.resetTimeout;
        logger.warn(`Circuit breaker OPENED. Will retry at ${new Date(this.nextAttempt).toISOString()}`);
    }

    close() {
        this.state = STATES.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        logger.info('Circuit breaker CLOSED');
    }

    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            failureThreshold: this.failureThreshold,
            nextAttempt: this.state === STATES.OPEN ? new Date(this.nextAttempt).toISOString() : null,
        };
    }
}

module.exports = CircuitBreaker;
