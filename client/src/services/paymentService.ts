import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr).token : null;
};

// Create a PaymentIntent on the backend
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
    const token = getAuthToken();

    if (!token) {
        throw new Error('Authentication required');
    }

    const response = await axios.post(
        `${API_URL}/api/payments/create-payment-intent`,
        { amount, currency },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

// Get Stripe config (publishable key) from backend
export const getPaymentConfig = async () => {
    const response = await axios.get(`${API_URL}/api/payments/config`);
    return response.data;
};

export default {
    createPaymentIntent,
    getPaymentConfig,
};
