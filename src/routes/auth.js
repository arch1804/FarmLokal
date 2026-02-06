const express = require('express');
const {
    googleAuth,
    googleCallback,
    githubAuth,
    githubCallback,
    getMe,
    logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// GitHub OAuth routes
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
