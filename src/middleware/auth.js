const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-__v');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        next();
    } catch (error) {
        logger.error(`JWT verification error: ${error.message}`);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Invalid token.',
        });
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized',
        });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `User role '${req.user.role}' is not authorized to access this route`,
        });
    }

    next();
};

module.exports = { generateToken, protect, authorize };
