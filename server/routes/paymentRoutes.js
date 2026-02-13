const express = require('express');
const router = express.Router();
const { createPaymentIntent, getPaymentConfig } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public route - get Stripe publishable key
router.get('/config', getPaymentConfig);

// Protected route - create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

module.exports = router;
