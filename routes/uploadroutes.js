const express = require('express');
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadImage, uploadImages, deleteImage } = require('../controllers/uploadController');

const router = express.Router();

router.post('/single', protect, admin, uploadSingle('image'), uploadImage);
router.post('/multiple', protect, admin, uploadMultiple('images', 10), uploadImages);
router.delete('/:publicId', protect, admin, deleteImage);

module.exports = router;