require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err);
    process.exit(1);
});

const startServer = async () => {
    try {
        const dbConnection = await connectDB();
        const redisConnection = await connectRedis();

        if (!dbConnection) {
            logger.warn('Starting server without MongoDB connection');
            console.warn('⚠️  Server starting without MongoDB - some features will be unavailable');
        }

        if (!redisConnection) {
            logger.warn('Starting server without Redis connection');
            console.warn('⚠️  Server starting without Redis - caching will be unavailable');
        }

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            logger.info(`Server started on port ${PORT}`);

            if (!dbConnection || !redisConnection) {
                console.log('\n⚠️  WARNING: Server started with missing services:');
                if (!dbConnection) console.log('   - MongoDB: Not connected');
                if (!redisConnection) console.log('   - Redis: Not connected');
                console.log('   Please configure environment variables and restart.\n');
            }
        });

        process.on('unhandledRejection', (err) => {
            logger.error(`Unhandled Rejection: ${err.message}`);
            console.error('UNHANDLED REJECTION! Shutting down...');
            console.error(err);
            server.close(() => {
                process.exit(1);
            });
        });

        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Process terminated');
                console.log('Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received. Shutting down gracefully...');
            console.log('\nSIGINT received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Process terminated');
                console.log('Process terminated');
                process.exit(0);
            });
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
