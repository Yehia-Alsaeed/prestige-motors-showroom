const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// @desc    Upload images to Cloudinary
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.array('images', 6), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const urls = req.files.map(file => file.path);
  res.json({ urls });
});

module.exports = router;
