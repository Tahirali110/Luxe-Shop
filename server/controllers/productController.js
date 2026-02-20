const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        originalPrice,
        description,
        longDescription,
        category,
        rating,
        reviewsCount,
        reviews,
        badge,
        colors,
        sizes,
        sizePriceAdjustments,
        features,
        stock,
        variantStock
    } = req.body;

    const product = await Product.create({
        name,
        price,
        originalPrice,
        description,
        longDescription,
        category,
        rating: rating || 0,
        reviewsCount: reviewsCount || 0,
        reviews: reviews || [],
        badge,
        colors: colors || [],
        sizes: sizes || [],
        sizePriceAdjustments: sizePriceAdjustments || {},
        features: features || [],
        stock: stock || 0,
        variantStock: variantStock || []
    });

    res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.status(200).json(products);
});

// @desc    Search products using MongoDB full-text search
// @route   GET /api/products/search?q=<query>&limit=<number>
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
    const { q, limit = 5 } = req.query;

    // Require at least 2 characters to avoid overly broad searches
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ message: 'Search query must be at least 2 characters.' });
    }

    // $text uses the compound text index defined on the Product model.
    // { score: { $meta: 'textScore' } } projects the relevance score so we can sort by it.
    // Only select the fields the client actually needs — saves bandwidth.
    const products = await Product.find(
        { $text: { $search: q.trim() } },
        { score: { $meta: 'textScore' } }
    )
        .sort({ score: { $meta: 'textScore' } }) // Most relevant results first
        .limit(Number(limit))
        .select('name category price colors description badge rating');

    res.status(200).json(products);
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.status(200).json(product);
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment, images, orderId } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // 1. Verify that the user has ordered this product and it's delivered
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            orderStatus: 'Delivered',
            'items.productId': product._id
        });

        if (!order) {
            res.status(400);
            throw new Error('Review failed: You can only review products from delivered orders you have placed.');
        }

        // 2. Check if this specific item in the order has already been reviewed
        const orderItem = order.items.find(item => item.productId.toString() === product._id.toString());
        if (orderItem.isReviewed) {
            res.status(400);
            throw new Error('Product already reviewed for this order');
        }

        const review = {
            user: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.avatar || '',
            rating: Number(rating),
            comment,
            images: images || [],
            orderId: order._id,
            verified: true
        };

        product.reviews.push(review);
        product.reviewsCount = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();

        // 3. Mark the item as reviewed in the order
        orderItem.isReviewed = true;
        await order.save();

        // Create notification
        await Notification.create({
            message: `New ${review.rating} star review for ${product.name} from ${req.user.name}`,
            type: 'review',
            dataId: product._id,
        });

        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});



// @desc    Update product review
// @route   PUT /api/products/:id/reviews
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
    const { rating, comment, images } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // Find review by user
        const review = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (review) {
            review.rating = Number(rating);
            review.comment = comment;
            review.images = images || review.images;
            review.date = Date.now(); // Update date on edit? Or keep original? Usually update date.

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(200).json({ message: 'Review updated' });
        } else {
            res.status(404);
            throw new Error('Review not found');
        }
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteProductReview = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const review = product.reviews.find(
            (r) => r._id.toString() === req.params.reviewId.toString()
        );

        if (review) {
            // Remove review
            product.reviews = product.reviews.filter(
                (r) => r._id.toString() !== req.params.reviewId.toString()
            );

            // Recalculate rating
            product.reviewsCount = product.reviews.length;
            product.rating =
                product.reviews.length > 0
                    ? product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                    product.reviews.length
                    : 0;

            await product.save();
            res.status(200).json({ message: 'Review deleted' });
        } else {
            res.status(404);
            throw new Error('Review not found');
        }
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Reply to review (Admin)
// @route   PUT /api/products/:id/reviews/:reviewId/reply
// @access  Private/Admin
const replyToReview = asyncHandler(async (req, res) => {
    const { reply } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const review = product.reviews.find(
            (r) => r._id.toString() === req.params.reviewId.toString()
        );

        if (review) {
            review.adminReply = reply;
            review.adminReplyDate = Date.now();
            await product.save();
            res.status(200).json({ message: 'Reply added' });
        } else {
            res.status(404);
            throw new Error('Review not found');
        }
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById,
    searchProducts,
    createProductReview,
    updateProductReview,
    deleteProductReview,
    replyToReview
};
