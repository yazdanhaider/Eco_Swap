const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createProduct,
  getProducts,
  getProduct,
  getUserProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Create product - allow multiple image uploads
router.post('/', auth, upload.array('images', 5), createProduct);

// Get all products
router.get('/', getProducts);

// Get user's products
router.get('/user', auth, getUserProducts);

// Get single product
router.get('/:id', getProduct);

// Update product
router.put('/:id', auth, updateProduct);

// Delete product
router.delete('/:id', auth, deleteProduct);

module.exports = router; 