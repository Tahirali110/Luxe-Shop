import { loadStripe, Stripe } from '@stripe/stripe-js';

// Singleton pattern for Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
    if (!stripePromise) {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            console.error('Stripe publishable key is not configured');
            return Promise.resolve(null);
        }

        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
};

export default getStripe;
