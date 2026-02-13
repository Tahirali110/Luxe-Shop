import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ReviewData {
    rating: number;
    comment: string;
    images?: string[];
    orderId: string;
}

const createReview = async (productId: string, reviewData: ReviewData, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(`${API_URL}/api/products/${productId}/reviews`, reviewData, config);
    return response.data;
};

const uploadReviewImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const reviewService = {
    createReview,
    updateReview: async (productId: string, reviewData: ReviewData, token: string) => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await axios.put(`${API_URL}/api/products/${productId}/reviews`, reviewData, config);
        return response.data;
    },
    uploadReviewImage,
};

export default reviewService;
