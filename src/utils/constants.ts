// Application constants
export const APP_NAME = 'LUXE';
export const APP_TAGLINE = 'Premium Shopping Experience';

// Shipping and tax
export const SHIPPING_THRESHOLD = 100; // Free shipping over this amount
export const SHIPPING_COST = 10;
export const SHIPPING_COST_EXPRESS = 20;
export const SHIPPING_COST_OVERNIGHT = 50;
export const TAX_RATE = 0.08; // 8% tax

// Contact information
export const CONTACT_INFO = {
  email: 'hello@luxe.store',
  phone: '+1 (555) 123-4567',
  address: {
    street: '123 Fashion Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
  },
  hours: {
    weekday: '9:00 AM - 8:00 PM EST',
    saturday: '10:00 AM - 6:00 PM EST',
    sunday: 'Closed',
    weekend: '10:00 AM - 6:00 PM EST',
  },
  social: {
    instagram: 'https://instagram.com/luxe',
    twitter: 'https://twitter.com/luxe',
    facebook: 'https://facebook.com/luxe',
    pinterest: 'https://pinterest.com/luxe',
  },
};

// Navigation links
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?filter=new' },
  { label: 'Sale', href: '/shop?filter=sale' },
  { label: 'Contact', href: '/contact' },
];

// Footer links
export const FOOTER_LINKS = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Clothing', href: '/shop?category=Clothing' },
    { label: 'Electronics', href: '/shop?category=Electronics' },
    { label: 'Accessories', href: '/shop?category=Accessories' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Shipping & Returns', href: '/shipping-returns' },
    { label: 'Track Order', href: '/track-order' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

// Feature highlights for Hero/Marketing
export const FEATURES = [
  {
    title: 'Free Shipping',
    description: 'On orders over $100',
    icon: 'Truck',
  },
  {
    title: 'Premium Quality',
    description: 'Curated selections',
    icon: 'Award',
  },
  {
    title: 'Easy Returns',
    description: '30-day guarantee',
    icon: 'RotateCcw',
  },
  {
    title: 'Secure Payments',
    description: 'SSL encrypted',
    icon: 'Shield',
  },
];

// Toast messages
export const TOAST_MESSAGES = {
  addedToCart: 'Added to cart',
  removedFromCart: 'Removed from cart',
  addedToWishlist: 'Added to wishlist',
  removedFromWishlist: 'Removed from wishlist',
  orderPlaced: 'Order placed successfully!',
  messageSent: 'Message sent! We\'ll be in touch soon.',
};

// Empty state messages
export const EMPTY_STATES = {
  cart: {
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added anything to your cart yet.',
    cta: 'Start Shopping',
  },
  wishlist: {
    title: 'Your wishlist is empty',
    description: 'Save your favorite items to buy them later.',
    cta: 'Explore Products',
  },
  search: {
    title: 'No results found',
    description: 'Try adjusting your search or browse our categories.',
    cta: 'View All Products',
  },
};
