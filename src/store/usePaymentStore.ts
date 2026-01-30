import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentDetails } from '@/context/CheckoutContext';

export interface SavedPayment extends PaymentDetails {
    id: string;
    isDefault?: boolean;
}

export interface SavedUpi {
    id: string;
    upiId: string;
    isDefault?: boolean;
}

interface PaymentState {
    methods: SavedPayment[];
    upiIds: SavedUpi[];
    addPaymentMethod: (method: Omit<SavedPayment, 'id'>) => void;
    removePaymentMethod: (id: string) => void;
    setDefaultPayment: (id: string) => void;
    getDefaultPayment: () => SavedPayment | undefined;
    addUpiId: (upi: Omit<SavedUpi, 'id'>) => void;
    removeUpiId: (id: string) => void;
    setDefaultUpi: (id: string) => void;
}

export const usePaymentStore = create<PaymentState>()(
    persist(
        (set, get) => ({
            methods: [
                {
                    id: '1',
                    cardNumber: '**** **** **** 4242',
                    cardName: 'John Doe',
                    expiryDate: '12/26',
                    cvv: '***',
                    isDefault: true,
                },
            ],
            upiIds: [
                { id: '1', upiId: 'johndoe@upi', isDefault: true },
            ],

            addPaymentMethod: (methodData) => {
                const newMethod = {
                    ...methodData,
                    id: Math.random().toString(36).substring(7),
                };

                set((state) => {
                    let newMethods = [...state.methods];
                    if (newMethod.isDefault) {
                        newMethods = newMethods.map(m => ({ ...m, isDefault: false }));
                    }
                    if (newMethods.length === 0) {
                        newMethod.isDefault = true;
                    }
                    return { methods: [...newMethods, newMethod] };
                });
            },

            removePaymentMethod: (id) => {
                set((state) => ({
                    methods: state.methods.filter((m) => m.id !== id),
                }));
            },

            setDefaultPayment: (id) => {
                set((state) => ({
                    methods: state.methods.map((m) => ({
                        ...m,
                        isDefault: m.id === id,
                    })),
                }));
            },

            getDefaultPayment: () => {
                return get().methods.find((m) => m.isDefault);
            },

            addUpiId: (upiData) => {
                const newUpi = {
                    ...upiData,
                    id: Math.random().toString(36).substring(7),
                };

                set((state) => {
                    let newUpis = [...state.upiIds];
                    if (newUpi.isDefault) {
                        newUpis = newUpis.map(u => ({ ...u, isDefault: false }));
                    }
                    if (newUpis.length === 0) {
                        newUpi.isDefault = true;
                    }
                    return { upiIds: [...newUpis, newUpi] };
                });
            },

            removeUpiId: (id) => {
                set((state) => ({
                    upiIds: state.upiIds.filter((u) => u.id !== id),
                }));
            },

            setDefaultUpi: (id) => {
                set((state) => ({
                    upiIds: state.upiIds.map((u) => ({
                        ...u,
                        isDefault: u.id === id,
                    })),
                }));
            },
        }),
        {
            name: 'luxe-shope-payments',
        }
    )
);
