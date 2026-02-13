import { create } from 'zustand';
import axios from 'axios';
import authService, { User, LoginData, RegisterData } from '../services/authService';
import { useCartStore } from './useCartStore';
import { useWishlistStore } from './useWishlistStore';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    message: string;
    login: (userData: LoginData) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    getProfile: () => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<void>;
    reset: () => void;
}

// Get user from localStorage safely
const getUserFromStorage = () => {
    try {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error('Error parsing user from storage:', error);
        return null;
    }
};

const user = getUserFromStorage();

export const useAuthStore = create<AuthState>((set, get) => ({
    user: user,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',

    login: async (userData: LoginData) => {
        set({ isLoading: true, isError: false, isSuccess: false, message: '' });
        try {
            const user = await authService.login(userData);
            set({ user, isLoading: false, isSuccess: true });
            await get().getProfile();
        } catch (error) {
            let message = 'Failed to login';
            if (axios.isAxiosError<{ message: string }>(error)) {
                message = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            set({ isLoading: false, isError: true, message, user: null });
            throw error;
        }
    },

    register: async (userData: RegisterData) => {
        set({ isLoading: true, isError: false, isSuccess: false, message: '' });
        try {
            const user = await authService.register(userData);
            set({ user, isLoading: false, isSuccess: true });
            await get().getProfile();
        } catch (error) {
            let message = 'Failed to register';
            if (axios.isAxiosError<{ message: string }>(error)) {
                message = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            set({ isLoading: false, isError: true, message, user: null });
            throw error;
        }
    },

    logout: () => {
        authService.logout();
        set({ user: null, isError: false, isSuccess: false, message: '' });
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();
    },

    getProfile: async () => {
        const currentUser = get().user;
        if (!currentUser || !currentUser.token) return;

        set({ isLoading: true });
        try {
            const fullProfile = await authService.getProfile(currentUser.token);
            // Merge with existing user (preserving token)
            set({
                user: { ...currentUser, ...fullProfile },
                isLoading: false,
                isSuccess: true
            });

            // Sync stores
            if (fullProfile.cart) {
                const cartItems = fullProfile.cart.map((item: any) => ({
                    id: `${item.product._id}-${item.color}-${item.size || 'default'}`,
                    productId: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.colors?.find((c: any) => c.name === item.color)?.image || item.product.image,
                    color: item.color,
                    colorHex: item.product.colors?.find((c: any) => c.name === item.color)?.hex || '',
                    size: item.size,
                    quantity: item.quantity
                }));
                useCartStore.getState().setItems(cartItems);
            }

            if (fullProfile.wishlist) {
                const wishlistIds = fullProfile.wishlist.map((item: any) => typeof item === 'string' ? item : item._id);
                useWishlistStore.getState().setItems(wishlistIds);
            }
        } catch (error) {
            let message = 'Failed to get profile';
            if (axios.isAxiosError<{ message: string }>(error)) {
                message = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            set({ isLoading: false, isError: true, message });
        }
    },

    updateProfile: async (userData: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser || !currentUser.token) return;

        set({ isLoading: true, isError: false, isSuccess: false, message: '' });
        try {
            const updatedUser = await authService.updateProfile(userData, currentUser.token);
            set({
                user: { ...currentUser, ...updatedUser },
                isLoading: false,
                isSuccess: true,
                message: 'Profile updated successfully'
            });
        } catch (error) {
            let message = 'Failed to update profile';
            if (axios.isAxiosError<{ message: string }>(error)) {
                message = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            set({ isLoading: false, isError: true, message });
            throw error;
        }
    },

    reset: () => {
        set({ isLoading: false, isError: false, isSuccess: false, message: '' });
    },
}));
