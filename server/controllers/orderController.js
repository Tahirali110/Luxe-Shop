const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');

// Helper function to update stock
const updateProductStock = async (items, type = 'decrement') => {
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product) {
            const qty = type === 'decrement' ? -item.quantity : item.quantity;

            // Update global stock
            product.stock = Math.max(0, product.stock + qty);

            let lowStockMessage = null;

            // Update variant stock if it exists
            if (product.variantStock && product.variantStock.length > 0) {
                const variant = product.variantStock.find(
                    v => v.color === item.selectedColor && v.size === item.selectedSize
                );
                if (variant) {
                    variant.stock = Math.max(0, variant.stock + qty);

                    // Check variant stock level
                    if (type === 'decrement' && variant.stock <= 5) {
                        lowStockMessage = variant.stock === 0
                            ? `Out of stock alert: ${product.name} (${variant.color}/${variant.size}) is now sold out!`
                            : `Low stock alert: ${product.name} (${variant.color}/${variant.size}) has only ${variant.stock} left`;
                    }
                }
            } else {
                // Check global stock level if no variants
                if (type === 'decrement' && product.stock <= 5) {
                    lowStockMessage = product.stock === 0
                        ? `Out of stock alert: ${product.name} is now sold out!`
                        : `Low stock alert: ${product.name} has only ${product.stock} left`;
                }
            }

            await product.save();

            // Notify if stock is low
            if (lowStockMessage) {
                await Notification.create({
                    message: lowStockMessage,
                    type: 'stock',
                    dataId: product._id,
                });
            }
        }
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
        totals,
        shippingMethodId,
        shippingMethodName,
        estimatedDelivery,
        paymentIntentId
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
            shippingMethodId,
            shippingMethodName,
            estimatedDelivery,
            paymentStatus: req.body.paymentStatus || 'Pending',
            paymentIntentId: paymentIntentId || null,
        });

        try {
            const createdOrder = await order.save();

            // Automatically decrease stock when order is placed
            await updateProductStock(createdOrder.items, 'decrement');

            // Create admin notification
            await Notification.create({
                message: `New order #${createdOrder._id.toString().slice(-6).toUpperCase()} received from ${req.user.name}`,
                type: 'order',
                dataId: createdOrder._id,
            });

            // Send order confirmation email
            const userEmail = shippingAddress.email || req.user.email;
            sendOrderConfirmationEmail(createdOrder, userEmail)
                .then(result => {
                    if (result.success) {
                        console.log('Order confirmation email sent successfully');
                    } else {
                        console.log('Email sending skipped or failed:', result.error);
                    }
                })
                .catch(err => console.error('Email error:', err));

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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.json(order);
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const { orderStatus, paymentStatus } = req.body;
    const oldStatus = order.orderStatus;

    if (orderStatus && orderStatus !== oldStatus) {
        // Handle stock changes based on status transitions
        if (orderStatus === 'Cancelled') {
            // Restore stock if order is cancelled
            await updateProductStock(order.items, 'increment');
        } else if (oldStatus === 'Cancelled') {
            // Re-deduct stock if a cancelled order is moved back to processing/shipped
            await updateProductStock(order.items, 'decrement');
        }
        order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderById, updateOrderStatus };

