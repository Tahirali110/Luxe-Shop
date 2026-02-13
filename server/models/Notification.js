const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['order', 'stock', 'review', 'system', 'contact'],
            required: true,
        },
        dataId: {
            type: String, // ID of the related object (orderId, productId, etc.)
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
