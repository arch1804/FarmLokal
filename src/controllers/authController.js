const passport = require('passport');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
});

const googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            logger.error(`Google OAuth callback error: ${err.message}`);
            return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${err.message}`);
        }

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
        }

        const token = generateToken(user);
        res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    })(req, res, next);
};

const githubAuth = passport.authenticate('github', {
    scope: ['user:email'],
});

const githubCallback = (req, res, next) => {
    passport.authenticate('github', { session: false }, (err, user, info) => {
        if (err) {
            logger.error(`GitHub OAuth callback error: ${err.message}`);
            return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${err.message}`);
        }

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
        }

        const token = generateToken(user);
        res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    })(req, res, next);
};

const getMe = async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        logger.error(`Get me error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const logout = async (req, res) => {
    try {
        logger.info(`User logged out: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

module.exports = {
    googleAuth,
    googleCallback,
    githubAuth,
    githubCallback,
    getMe,
    logout,
};
