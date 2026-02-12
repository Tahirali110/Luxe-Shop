const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
        totals,
    } = req.body;

    console.log('Creating order for user:', req.user._id);
    console.log('Order Data:', JSON.stringify(req.body, null, 2));

    if (items && items.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        const order = new Order({
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            totals,
            paymentStatus: 'Pending', // Default, would be updated by payment gateway in real app
        });

        try {
            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        } catch (error) {
            console.error('Order creation error:', error);
            res.status(400);
            throw new Error(`Order placement failed: ${error.message}`);
        }
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

module.exports = { createOrder, getMyOrders };
