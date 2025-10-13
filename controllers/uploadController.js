const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private/Admin
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'ecommerce/products');

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    
    // Clean up local file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.path, 'ecommerce/products')
    );

    const results = await Promise.all(uploadPromises);

    // Delete local files after upload
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes
    }));

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images
    });
  } catch (error) {
    console.error('Upload images error:', error);
    
    // Clean up local files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while uploading images'
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await deleteFromCloudinary(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting image'
    });
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  deleteImage
};