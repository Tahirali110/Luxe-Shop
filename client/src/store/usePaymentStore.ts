import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface SavedPayment {
    _id: string;
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    isDefault?: boolean;
}

export interface SavedUpi {
    _id: string;
    upiId: string;
    isDefault?: boolean;
}

interface PaymentState {
    methods: SavedPayment[];
    upiIds: SavedUpi[];
    isLoading: boolean;
    fetchPayments: () => Promise<void>;
    addPaymentMethod: (method: Omit<SavedPayment, '_id'>) => Promise<void>;
    removePaymentMethod: (id: string) => Promise<void>;
    setDefaultPayment: (id: string) => void;
    getDefaultPayment: () => SavedPayment | undefined;
    addUpiId: (upi: Omit<SavedUpi, '_id'>) => Promise<void>;
    removeUpiId: (id: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>()(
    persist(
        (set, get) => ({
            methods: [],
            upiIds: [],
            isLoading: false,

            fetchPayments: async () => {
                const token = useAuthStore.getState().user?.token;
                if (!token) return;

                set({ isLoading: true });
                try {
                    const response = await axios.get(`${API_URL}/api/users/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    set({
                        methods: response.data.paymentMethods,
                        upiIds: response.data.upiIds,
                        isLoading: false
                    });
                } catch (error) {
                    console.error('Failed to fetch payments', error);
                    set({ isLoading: false });
                }
            },

            addPaymentMethod: async (methodData) => {
                const token = useAuthStore.getState().user?.token;
                if (!token) return;

                try {
                    const response = await axios.post(`${API_URL}/api/users/profile/payment`, methodData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    set({ methods: response.data });
                } catch (error) {
                    console.error('Failed to add payment method', error);
                }
            },

            removePaymentMethod: async (id) => {
                const token = useAuthStore.getState().user?.token;
                if (!token) return;

                try {
                    const response = await axios.delete(`${API_URL}/api/users/profile/payment/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    set({ methods: response.data });
                } catch (error) {
                    console.error('Failed to remove payment method', error);
                }
            },

            setDefaultPayment: (id) => {
                set((state) => ({
                    methods: state.methods.map((m) => ({
                        ...m,
                        isDefault: m._id === id,
                    })),
                }));
            },

            getDefaultPayment: () => {
                return get().methods.find((m) => m.isDefault);
            },

            addUpiId: async (upiData) => {
                const token = useAuthStore.getState().user?.token;
                if (!token) return;

                try {
                    const response = await axios.post(`${API_URL}/api/users/profile/upi`, upiData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    set({ upiIds: response.data });
                } catch (error) {
                    console.error('Failed to add UPI', error);
                }
            },

            removeUpiId: async (id) => {
                const token = useAuthStore.getState().user?.token;
                if (!token) return;

                try {
                    const response = await axios.delete(`${API_URL}/api/users/profile/upi/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    set({ upiIds: response.data });
                } catch (error) {
                    console.error('Failed to remove UPI', error);
                }
            },
        }),
        {
            name: 'luxe-shope-payments',
        }
    )
);
