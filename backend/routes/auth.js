const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, getProfile } = require('../controllers/authController');
const upload = require('../middleware/upload');
const User = require('../models/User');
const cloudinary = require('cloudinary');

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile
router.get('/profile', auth, getProfile);

// Update user profile
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    if (req.body.name) user.name = req.body.name;
    if (req.body.location) user.location = req.body.location;

    // Handle avatar upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'eco-swap/avatars',
      });
      user.avatar = result.secure_url;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 