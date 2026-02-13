const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private/Admin
const getNotifications = asyncHandler(async (req, res) => {
    // Initial sync if no notifications exist
    const count = await Notification.countDocuments();
    if (count === 0) {
        // Sync pending orders
        const pendingOrders = await Order.find({ orderStatus: 'Placed' });
        for (const order of pendingOrders) {
            await Notification.create({
                message: `Pending order #${order._id.toString().slice(-6).toUpperCase()}`,
                type: 'order',
                dataId: order._id,
                createdAt: order.createdAt
            });
        }

        // Sync low stock - check EACH variant individually, not the sum
        const products = await Product.find({});
        for (const p of products) {
            // Check variant stock individually
            if (p.variantStock && p.variantStock.length > 0) {
                for (const variant of p.variantStock) {
                    const variantStock = variant.stock || 0;
                    const variantLabel = `${variant.color} - ${variant.size}`;

                    if (variantStock > 0 && variantStock <= 5) {
                        await Notification.create({
                            message: `Low stock alert: ${p.name} (${variantLabel}) - only ${variantStock} left`,
                            type: 'stock',
                            dataId: p._id
                        });
                    } else if (variantStock === 0) {
                        await Notification.create({
                            message: `Out of stock: ${p.name} (${variantLabel}) is sold out`,
                            type: 'stock',
                            dataId: p._id
                        });
                    }
                }
            } else {
                // Fallback: No variants, use product-level stock
                const productStock = p.stock || 0;
                if (productStock > 0 && productStock <= 5) {
                    await Notification.create({
                        message: `Low stock alert: ${p.name} (${productStock} left)`,
                        type: 'stock',
                        dataId: p._id
                    });
                } else if (productStock === 0) {
                    await Notification.create({
                        message: `Out of stock alert: ${p.name} is sold out`,
                        type: 'stock',
                        dataId: p._id
                    });
                }
            }

            // Sync unreplied reviews
            if (p.reviews && p.reviews.length > 0) {
                const unreplied = p.reviews.filter(r => !r.adminReply);
                for (const r of unreplied) {
                    await Notification.create({
                        message: `New review for ${p.name} (${r.rating} stars)`,
                        type: 'review',
                        dataId: p._id,
                        createdAt: r.date
                    });
                }
            }
        }
    }

    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private/Admin
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification removed' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
