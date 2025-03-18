const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  getUsers
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

// Routes d'authentification
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/logout', protect, logout);

// Routes utilisateur
router.get('/me', protect, getMe);
router.put('/me', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Routes admin
router.get('/', protect, authorize('admin'), getUsers);

module.exports = router;
