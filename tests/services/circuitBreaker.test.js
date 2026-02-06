const CircuitBreaker = require('../../src/services/circuitBreaker');

describe('Circuit Breaker', () => {
    let circuitBreaker;

    beforeEach(() => {
        circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 1000, // 1 second for testing
        });
    });

    describe('CLOSED State', () => {
        it('should start in CLOSED state', () => {
            const state = circuitBreaker.getState();
            expect(state.state).toBe('CLOSED');
            expect(state.failureCount).toBe(0);
        });

        it('should execute function successfully', async () => {
            const mockFn = jest.fn().mockResolvedValue('success');
            const result = await circuitBreaker.execute(mockFn);

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should reset failure count on success', async () => {
            const failingFn = jest.fn().mockRejectedValue(new Error('fail'));
            const successFn = jest.fn().mockResolvedValue('success');

            // Fail once
            try {
                await circuitBreaker.execute(failingFn);
            } catch (err) {
                // Expected
            }

            expect(circuitBreaker.getState().failureCount).toBe(1);

            // Then succeed
            await circuitBreaker.execute(successFn);

            expect(circuitBreaker.getState().failureCount).toBe(0);
        });
    });

    describe('OPEN State', () => {
        it('should open circuit after threshold failures', async () => {
            const failingFn = jest.fn().mockRejectedValue(new Error('fail'));

            // Fail 3 times
            for (let i = 0; i < 3; i += 1) {
                try {
                    await circuitBreaker.execute(failingFn);
                } catch (err) {
                    // Expected
                }
            }

            const state = circuitBreaker.getState();
            expect(state.state).toBe('OPEN');
            expect(state.failureCount).toBe(3);
        });

        it('should reject requests when OPEN', async () => {
            const failingFn = jest.fn().mockRejectedValue(new Error('fail'));

            // Open the circuit
            for (let i = 0; i < 3; i += 1) {
                try {
                    await circuitBreaker.execute(failingFn);
                } catch (err) {
                    // Expected
                }
            }

            // Try to execute when OPEN
            let error;
            try {
                await circuitBreaker.execute(jest.fn());
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.message).toBe('Circuit breaker is OPEN');
            expect(error.circuitBreakerOpen).toBe(true);
        });
    });

    describe('HALF_OPEN State', () => {
        it('should move to HALF_OPEN after reset timeout', async () => {
            const failingFn = jest.fn().mockRejectedValue(new Error('fail'));
            const successFn = jest.fn().mockResolvedValue('success');

            // Open the circuit
            for (let i = 0; i < 3; i += 1) {
                try {
                    await circuitBreaker.execute(failingFn);
                } catch (err) {
                    // Expected
                }
            }

            expect(circuitBreaker.getState().state).toBe('OPEN');

            // Wait for reset timeout
            await new Promise((resolve) => setTimeout(resolve, 1100));

            // Execute should move to HALF_OPEN
            await circuitBreaker.execute(successFn);

            const state = circuitBreaker.getState();
            expect(state.state).toBe('CLOSED'); // Should close on success
        });

        it('should close circuit on success in HALF_OPEN', async () => {
            const failingFn = jest.fn().mockRejectedValue(new Error('fail'));
            const successFn = jest.fn().mockResolvedValue('success');

            // Open the circuit
            for (let i = 0; i < 3; i += 1) {
                try {
                    await circuitBreaker.execute(failingFn);
                } catch (err) {
                    // Expected
                }
            }

            // Wait and execute successfully
            await new Promise((resolve) => setTimeout(resolve, 1100));
            await circuitBreaker.execute(successFn);

            const state = circuitBreaker.getState();
            expect(state.state).toBe('CLOSED');
            expect(state.failureCount).toBe(0);
        });
    });
});
