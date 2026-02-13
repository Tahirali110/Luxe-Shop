const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById,
    createProductReview,
    updateProductReview,
    deleteProductReview,
    replyToReview
} = require('../controllers/productController');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', getProducts);

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', getProductById);

// @desc    Create/Update review
// @route   POST/PUT /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id/reviews', protect, updateProductReview);

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
router.delete('/:id/reviews/:reviewId', protect, admin, deleteProductReview);

// @desc    Reply to review
// @route   PUT /api/products/:id/reviews/:reviewId/reply
// @access  Private/Admin
router.put('/:id/reviews/:reviewId/reply', protect, admin, replyToReview);

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, createProduct);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateProduct);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
