const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['exchange', 'donation'],
    required: true
  },
  exchangeItemDetails: {
    type: String,
    required: function() { return this.type === 'exchange'; }
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Arranged', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  message: {
    type: String,
    required: true
  },
  meetupLocation: {
    type: String
  },
  meetupTime: {
    type: Date
  },
  ownerFeedback: {
    rating: Number,
    comment: String
  },
  requesterFeedback: {
    rating: Number,
    comment: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exchange', exchangeSchema); 