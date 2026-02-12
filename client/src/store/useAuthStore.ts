import { create } from 'zustand';
import authService, { User, LoginData, RegisterData } from '../services/authService';

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

export const useAuthStore = create<AuthState>((set) => ({
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
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            set({ isLoading: false, isError: true, message, user: null });
            throw error; // Re-throw to handle in UI if needed
        }
    },

    register: async (userData: RegisterData) => {
        set({ isLoading: true, isError: false, isSuccess: false, message: '' });
        try {
            const user = await authService.register(userData);
            set({ user, isLoading: false, isSuccess: true });
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            set({ isLoading: false, isError: true, message, user: null });
            throw error;
        }
    },

    logout: () => {
        authService.logout();
        set({ user: null, isError: false, isSuccess: false, message: '' });
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
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            set({ isLoading: false, isError: true, message });
        }
    },

    reset: () => {
        set({ isLoading: false, isError: false, isSuccess: false, message: '' });
    },
}));
