const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, loginAdmin, getUserProfile, updateUserProfile,
  getAllUsers, updateUserStatus
} = require('../controllers/authController');
const { protect, adminGuard } = require('../middleware/authMiddleware');

const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

router.post('/register', loginLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/admin-login', loginLimiter, loginAdmin);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/users', protect, adminGuard, getAllUsers);
router.put('/users/:id/status', protect, adminGuard, updateUserStatus);

module.exports = router;
