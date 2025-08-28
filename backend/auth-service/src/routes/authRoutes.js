const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Redirects the user to GitHub OAuth consent
router.get('/github', authController.githubRedirect);

// GitHub OAuth callback URL
router.get('/github/callback', authController.githubCallback);

module.exports = router;
