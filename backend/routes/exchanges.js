const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createExchange,
  getUserExchanges,
  getExchange,
  updateExchangeStatus,
  submitFeedback,
} = require('../controllers/exchangeController');

// Create exchange request
router.post('/', auth, createExchange);

// Get user's exchanges
router.get('/user', auth, getUserExchanges);

// Get single exchange
router.get('/:id', auth, getExchange);

// Update exchange status
router.put('/:id/status', auth, updateExchangeStatus);

// Submit feedback
router.post('/:id/feedback', auth, submitFeedback);

module.exports = router; 