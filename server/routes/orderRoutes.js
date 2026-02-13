const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// User routes
router.route('/').post(protect, createOrder);
router.route('/myorders').get(protect, getMyOrders);

// Admin routes
router.route('/').get(protect, admin, getAllOrders);
router.route('/:id').get(protect, admin, getOrderById);
router.route('/:id').put(protect, admin, updateOrderStatus);

module.exports = router;
