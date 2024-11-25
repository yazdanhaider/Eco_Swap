const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const path = require('path');

// Create new product
const createProduct = async (req, res) => {
  try {
    const { title, description, category, condition, location } = req.body;
    
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    // Get file paths
    const images = req.files.map(file => {
      return path.join('uploads', file.filename).replace(/\\/g, '/');
    });

    // Create product
    const product = new Product({
      title,
      description,
      category,
      condition,
      location,
      images,
      user: req.user.id,
    });

    await product.save();
    await product.populate('user', 'name avatar location');
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all products with filters and pagination
const getProducts = async (req, res) => {
  try {
    const { category, condition, page = 1, limit = 9 } = req.query;
    const query = { status: 'Available' };

    if (category && category !== 'All') query.category = category;
    if (condition && condition !== 'All') query.condition = condition;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'user',
        select: 'name avatar location',
      },
    };

    const products = await Product.paginate(query, options);

    res.json({
      products: products.docs,
      currentPage: products.page,
      totalPages: products.totalPages,
      totalProducts: products.totalDocs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('user', 'name avatar location');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's products
const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete images from cloudinary
    for (const imageUrl of product.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`eco-swap/products/${publicId}`);
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  getUserProducts,
  updateProduct,
  deleteProduct,
}; 