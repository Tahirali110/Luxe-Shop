const mongoose = require('mongoose');

// --- Sub-Schemas (Smaller schemas that sit inside the main Product schema) ---

// 1. Review Schema (Mirrors your frontend Review interface)
const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        userName: { type: String, required: true },
        userAvatar: { type: String },
        rating: { type: Number, required: true, min: 0, max: 5 },
        comment: { type: String, required: true },
        images: [{ type: String }],
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        date: { type: Date, default: Date.now },
        verified: { type: Boolean, default: true },
        adminReply: { type: String },
        adminReplyDate: { type: Date },
    },
    { timestamps: true }
);

const colorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "Midnight Black"
        hex: { type: String, required: true }, // e.g., "#000000"
        image: { type: String, required: true }, // Main image for this color variant
        images: [{ type: String }], // Array of additional gallery images for this specific color
        price: { type: Number }, // Optional override price for this specific color variant
        originalPrice: { type: Number }, // Optional comparative price for this specific color variant
    },
    { _id: false } // We don't need separate _ids for color sub-documents either
);

// 3. Variant Stock Schema (Tracks stock per color + size combination)
const variantStockSchema = new mongoose.Schema(
    {
        color: { type: String, required: true }, // Color name (e.g., "Midnight Black")
        size: { type: String, required: true }, // Size (e.g., "M")
        stock: { type: Number, required: true, default: 0, min: 0 }, // Stock count for this variant
    },
    { _id: false }
);

// --- Main Product Schema ---
const productSchema = new mongoose.Schema(
    {
        // Note: We removed 'id: number' from the mock data structure because MongoDB
        // automatically generates its own unique '_id' field.

        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: 0,
        },
        // Original price (used to calculate and show discounts)
        originalPrice: {
            type: Number,
            min: 0,
        },
        // Short description (used on product cards on the shop page)
        description: {
            type: String,
            required: [true, 'Short description is required'],
            trim: true,
        },
        // Long description (used on the single product detail page)
        longDescription: {
            type: String,
            required: [true, 'Long description is required'],
            trim: true,
        },
        category: {
            type: String,
            required: true,
            // Limits the category to only strictly these options based on your frontend types
            enum: ['Clothing', 'Electronics', 'Accessories'],
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewsCount: {
            type: Number,
            required: true,
            default: 0,
        },
        // The reviewSchema defined above is used here as an array of sub-documents
        reviews: [reviewSchema],
        badge: {
            type: String, // e.g., "Best Seller", "New"
            trim: true,
        },
        // The colorSchema defined above is used here as an array of sub-documents
        colors: [colorSchema],
        // Simple string array for sizes (e.g., ["S", "M", "L"])
        sizes: [{ type: String }],
        // ⭐ This is the Mongoose equivalent of TypeScript's 'Record<string, number>' ⭐
        // It stores dynamic objects like { "XL": 20, "XXL": 40 } for price adjustments.
        sizePriceAdjustments: {
            type: Map,
            of: Number,
        },
        // Simple string array for product feature bullet points
        features: [{ type: String }],
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        // Variant-level stock tracking (per color + size combination)
        // If this array has entries, it takes precedence over the global 'stock' field
        variantStock: [variantStockSchema],
    },
    {
        timestamps: true, // Mongoose automatically manages 'createdAt' and 'updatedAt' fields
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;