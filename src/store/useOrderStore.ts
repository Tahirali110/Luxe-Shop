import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShippingAddress } from '@/context/CheckoutContext';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedColor: string;
    selectedSize: string;
    image: string;
}

export interface Order {
    id: string;
    date: string;
    placedAt: string;
    paymentConfirmedAt: string;
    status: 'placed' | 'processing' | 'shipped' | 'delivered';
    items: OrderItem[];
    totals: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    shippingAddress: ShippingAddress;
    shippingMethodName: string;
    estimatedDelivery: string;
    paymentMethod: string;
    trackingNumber?: string | null;
}

interface OrderState {
    orders: Order[];
    addOrder: (order: Order) => void;
    getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [], // Start with empty, or we can move mock data here if desired

            addOrder: (order) => {
                set((state) => ({
                    orders: [order, ...state.orders],
                }));
            },

            getOrderById: (id) => {
                return get().orders.find((o) => o.id === id);
            },
        }),
        {
            name: 'luxe-shope-orders',
        }
    )
);
