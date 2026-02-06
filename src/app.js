const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const passport = require('./config/passport');
const { securityHeaders, limiter, corsMiddleware } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const externalRoutes = require('./routes/external');

const app = express();

app.use(securityHeaders);
app.use(corsMiddleware);
app.use('/api/', limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use(passport.initialize());

const { specs, swaggerUi } = require('./config/swagger');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/health', (req, res) => {
    const mongoose = require('mongoose');
    const { getRedisClient } = require('./config/redis');

    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisClient = getRedisClient();
    const redisStatus = redisClient && redisClient.isReady ? 'connected' : 'disconnected';

    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        services: {
            mongodb: mongoStatus,
            redis: redisStatus
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/external', externalRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FarmLokal Backend API',
        version: '1.0.0',
        documentation: '/api/docs',
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

app.use(errorHandler);

module.exports = app;
