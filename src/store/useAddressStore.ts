import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShippingAddress } from '@/context/CheckoutContext';

interface Address extends ShippingAddress {
    id: string;
    isDefault?: boolean;
}

interface AddressState {
    addresses: Address[];
    addAddress: (address: Omit<Address, 'id'>) => void;
    removeAddress: (id: string) => void;
    updateAddress: (id: string, address: Partial<Address>) => void;
    setDefaultAddress: (id: string) => void;
    getDefaultAddress: () => Address | undefined;
}

export const useAddressStore = create<AddressState>()(
    persist(
        (set, get) => ({
            addresses: [
                {
                    id: '1',
                    label: 'Home',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1 (555) 000-1111',
                    address: '123 Luxury Lane',
                    apartment: 'Suite 404',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'United States',
                    isDefault: true,
                },
                {
                    id: '2',
                    label: 'Office',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1 (555) 000-2222',
                    address: '456 Fashion Ave',
                    apartment: 'Apt 12B',
                    city: 'Los Angeles',
                    state: 'CA',
                    zipCode: '90012',
                    country: 'United States',
                    isDefault: false,
                },
            ],

            addAddress: (addressData) => {
                const newAddress = {
                    ...addressData,
                    id: Math.random().toString(36).substring(7),
                };

                set((state) => {
                    let newAddresses = [...state.addresses];
                    if (newAddress.isDefault) {
                        newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
                    }
                    // If this is the first address, make it default
                    if (newAddresses.length === 0) {
                        newAddress.isDefault = true;
                    }
                    return { addresses: [...newAddresses, newAddress] };
                });
            },

            removeAddress: (id) => {
                set((state) => ({
                    addresses: state.addresses.filter((a) => a.id !== id),
                }));
            },

            updateAddress: (id, addressData) => {
                set((state) => {
                    let newAddresses = state.addresses.map((a) =>
                        a.id === id ? { ...a, ...addressData } : a
                    );

                    if (addressData.isDefault) {
                        newAddresses = newAddresses.map(a => a.id === id ? a : { ...a, isDefault: false });
                    }

                    return { addresses: newAddresses };
                });
            },

            setDefaultAddress: (id) => {
                set((state) => ({
                    addresses: state.addresses.map((a) => ({
                        ...a,
                        isDefault: a.id === id,
                    })),
                }));
            },

            getDefaultAddress: () => {
                return get().addresses.find((a) => a.isDefault);
            },
        }),
        {
            name: 'luxe-shope-addresses',
        }
    )
);
