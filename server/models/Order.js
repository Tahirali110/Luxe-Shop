const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    selectedColor: { type: String },
    selectedSize: { type: String },
    isReviewed: { type: Boolean, default: false },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true, default: 'India' },
    },
    paymentMethod: { type: String, required: true, enum: ['Credit Card', 'UPI', 'Wallet', 'COD'] },
    paymentStatus: { type: String, required: true, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    orderStatus: { type: String, required: true, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
    shippingMethodId: { type: String },
    shippingMethodName: { type: String },
    estimatedDelivery: { type: String },
    totals: {
        subtotal: { type: Number, required: true },
        tax: { type: Number, required: true },
        shipping: { type: Number, required: true },
        total: { type: Number, required: true },
    },
    paymentIntentId: { type: String, default: null },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
