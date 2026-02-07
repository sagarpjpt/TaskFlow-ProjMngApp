const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerificationOTP,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  getAllUsers,
  updateRole,  
  getTeamMembers,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendVerificationOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, getAllUsers);
router.put('/role', protect, updateRole);
router.get('/team', protect, getTeamMembers);

module.exports = router;
