const Exchange = require('../models/Exchange');
const Product = require('../models/Product');

// Create exchange request
const createExchange = async (req, res) => {
  try {
    const { productId, message, type, exchangeItemDetails } = req.body;
    const requesterId = req.user.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is not requesting their own product
    if (product.user.toString() === requesterId) {
      return res.status(400).json({ message: 'Cannot request your own product' });
    }

    // Check if exchange request already exists
    const existingRequest = await Exchange.findOne({
      product: productId,
      requester: requesterId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Exchange request already exists' });
    }

    const exchange = new Exchange({
      product: productId,
      owner: product.user,
      requester: requesterId,
      type,
      exchangeItemDetails,
      message,
    });

    await exchange.save();
    await exchange.populate([
      { path: 'product' },
      { path: 'owner', select: 'name avatar location' },
      { path: 'requester', select: 'name avatar location' }
    ]);

    res.status(201).json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get exchanges for user (both as owner and requester)
const getUserExchanges = async (req, res) => {
  try {
    const userId = req.user.id;
    const exchanges = await Exchange.find({
      $or: [{ owner: userId }, { requester: userId }]
    })
      .populate('product')
      .populate('owner', 'name avatar')
      .populate('requester', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single exchange
const getExchange = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate({
        path: 'product',
        select: 'title description images location category condition'
      })
      .populate('owner', 'name avatar location')
      .populate('requester', 'name avatar location');

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update exchange status
const updateExchangeStatus = async (req, res) => {
  try {
    const { status, meetupLocation, meetupTime } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Verify user is the owner
    if (exchange.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.status = status;
    if (meetupLocation) exchange.meetupLocation = meetupLocation;
    if (meetupTime) exchange.meetupTime = meetupTime;

    // If exchange is completed, update product status
    if (status === 'Completed') {
      await Product.findByIdAndUpdate(exchange.product, { status: 'Exchanged' });
    }

    await exchange.save();
    
    // Populate the exchange before sending response
    await exchange.populate([
      {
        path: 'product',
        select: 'title description images location category condition'
      },
      { path: 'owner', select: 'name avatar location' },
      { path: 'requester', select: 'name avatar location' }
    ]);

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit feedback
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Verify user is part of the exchange
    const isOwner = exchange.owner.toString() === req.user.id;
    const isRequester = exchange.requester.toString() === req.user.id;

    if (!isOwner && !isRequester) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add feedback based on user role
    if (isOwner) {
      exchange.ownerFeedback = { rating, comment };
    } else {
      exchange.requesterFeedback = { rating, comment };
    }

    await exchange.save();
    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExchange,
  getUserExchanges,
  getExchange,
  updateExchangeStatus,
  submitFeedback,
}; 