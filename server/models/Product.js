const mongoose = require('mongoose');

// --- Sub-Schemas (Smaller schemas that sit inside the main Product schema) ---

// 1. Review Schema (Mirrors your frontend Review interface)
const reviewSchema = new mongoose.Schema(
    {
        id: { type: String, required: true }, // The 'r1', 'r2' IDs from mock data
        userName: { type: String, required: true },
        userAvatar: { type: String }, // Optional field
        rating: { type: Number, required: true, min: 0, max: 5 },
        comment: { type: String, required: true },
        date: { type: String, required: true }, // Stores dates as strings like "YYYY-MM-DD"
        verified: { type: Boolean, default: false },
    },
    { _id: false } // Tells Mongoose NOT to create a separate unique _id for each review sub-document
);

// 2. Color Schema (Mirrors your frontend ProductColor interface)
const colorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "Midnight Black"
        hex: { type: String, required: true }, // e.g., "#000000"
        image: { type: String, required: true }, // Main image for this color variant
        images: [{ type: String }], // Array of additional gallery images for this specific color
        price: { type: Number }, // Optional override price for this specific color variant
    },
    { _id: false } // We don't need separate _ids for color sub-documents either
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
    },
    {
        timestamps: true, // Mongoose automatically manages 'createdAt' and 'updatedAt' fields
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;