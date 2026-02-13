import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    selectedColor: string;
    selectedSize: string;
    image: string;
    isReviewed?: boolean;
}

export interface Order {
    placedAt?: string;
    id?: string;
    shippingMethodName: string;
    estimatedDelivery?: string;
    trackingNumber: string;
    orderId?: string;
    date?: string;
    _id: string;
    user: string;
    items: OrderItem[];
    shippingAddress: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    paymentMethod: string;
    paymentStatus: string;
    totals: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    orderStatus: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: string;
    updatedAt?: string;
}

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    fetchOrders: () => Promise<void>;
    addOrder: (order: Order) => void;
    getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],
            isLoading: false,

            fetchOrders: async () => {
                const token = useAuthStore.getState().user?.token;
                if (!token) return;

                set({ isLoading: true });
                try {
                    const response = await axios.get(`${API_URL}/api/orders/myorders`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    set({ orders: response.data, isLoading: false });
                } catch (error) {
                    console.error('Failed to fetch orders', error);
                    set({ isLoading: false });
                }
            },

            addOrder: (order) => {
                set((state) => ({
                    orders: [order, ...state.orders],
                }));
            },

            getOrderById: (id) => {
                return get().orders.find((o) => o._id === id);
            },
        }),
        {
            name: 'luxe-shope-orders',
        }
    )
);
