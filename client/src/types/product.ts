// Product-related type definitions for the Luxe Shop frontend
// These types mirror the backend Product model structure

export interface ProductColor {
    name: string;
    hex: string;
    image: string;
    images?: string[];
    price?: number; // Price for this specific color variant
}

export interface Review {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
}

// Product type for data coming from the backend API
export interface Product {
    _id: string; // MongoDB ObjectId
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    longDescription?: string;
    category: 'Clothing' | 'Electronics' | 'Accessories';
    rating?: number;
    reviewsCount?: number;
    reviews?: Review[];
    badge?: string;
    colors?: ProductColor[];
    sizes?: string[];
    sizePriceAdjustments?: Record<string, number>;
    features?: string[];
    stock: number;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Filter constants
export const categories = ['All', 'Clothing', 'Electronics', 'Accessories'] as const;
export type Category = typeof categories[number];

export const priceRanges = [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: 'Under $100', min: 0, max: 100 },
    { label: '$100 - $250', min: 100, max: 250 },
    { label: '$250 - $500', min: 250, max: 500 },
    { label: '$500+', min: 500, max: Infinity },
];

export type PriceRange = typeof priceRanges[number];

export const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Newest', value: 'newest' },
];

export type SortOption = typeof sortOptions[number];
