const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');

// Initialize Stripe lazily to prevent crash when key is not set
let stripe = null;
const getStripe = () => {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
};

// @desc    Create a Stripe PaymentIntent
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount, currency = 'usd' } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Invalid payment amount');
    }

    // Check if Stripe is configured
    const stripeClient = getStripe();
    if (!stripeClient) {
        res.status(503);
        throw new Error('Payment service not configured. Please add STRIPE_SECRET_KEY to .env');
    }

    // Convert to smallest currency unit (cents for USD)
    const amountInSmallestUnit = Math.round(amount * 100);

    try {
        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: req.user._id.toString(),
                userEmail: req.user.email,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Stripe PaymentIntent error:', error);
        res.status(500);
        throw new Error(`Payment processing failed: ${error.message}`);
    }
});

// @desc    Get payment configuration (publishable key)
// @route   GET /api/payments/config
// @access  Public
const getPaymentConfig = asyncHandler(async (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

module.exports = { createPaymentIntent, getPaymentConfig };
