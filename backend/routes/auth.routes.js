const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(protect); // All routes after this middleware require authentication
router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);

module.exports = router;
