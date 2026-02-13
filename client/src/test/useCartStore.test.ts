import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from '../store/useCartStore';
import { Product } from '../types/product';

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useCartStore', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
        useCartStore.getState().removePromoCode();
        useCartStore.getState().setShippingMethod('standard');
    });

    const mockProduct: Product = {
        _id: 'p1',
        name: 'Luxury Watch',
        price: 50,
        image: 'watch.jpg',
        category: 'Accessories' as const,
        colors: [{ name: 'Gold', hex: '#FFD700', image: 'gold_watch.jpg' }],
        sizes: ['M'],
        description: 'A fine watch',
        rating: 4.5,
        reviewsCount: 10,
        stock: 5,
    };

    it('should add an item to the cart', () => {
        const { addItem, items } = useCartStore.getState();
        addItem(mockProduct, 'Gold', '#FFD700', 'M');

        expect(useCartStore.getState().items.length).toBe(1);
        expect(useCartStore.getState().items[0].name).toBe('Luxury Watch');
        expect(useCartStore.getState().items[0].quantity).toBe(1);
    });

    it('should increment quantity if same item is added', () => {
        const { addItem } = useCartStore.getState();
        addItem(mockProduct, 'Gold', '#FFD700', 'M');
        addItem(mockProduct, 'Gold', '#FFD700', 'M');

        expect(useCartStore.getState().items.length).toBe(1);
        expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it('should calculate subtotal correctly', () => {
        const { addItem } = useCartStore.getState();
        addItem(mockProduct, 'Gold', '#FFD700', 'M'); // 50
        addItem(mockProduct, 'Gold', '#FFD700', 'M'); // 50

        expect(useCartStore.getState().getSubtotal()).toBe(100);
    });

    it('should apply free shipping over threshold', () => {
        const { addItem } = useCartStore.getState();
        // 50 x 2 = 100 (Threshold is 100)
        addItem(mockProduct, 'Gold', '#FFD700', 'M');
        addItem(mockProduct, 'Gold', '#FFD700', 'M');

        expect(useCartStore.getState().getShipping()).toBe(0);
    });

    it('should charge shipping below threshold', () => {
        const { addItem } = useCartStore.getState();
        addItem(mockProduct, 'Gold', '#FFD700', 'M'); // 50

        expect(useCartStore.getState().getShipping()).toBe(10);
    });

    it('should calculate discount with promo code', () => {
        const { addItem, applyPromoCode } = useCartStore.getState();
        addItem(mockProduct, 'Gold', '#FFD700', 'M'); // 50
        applyPromoCode('SAVE20'); // 20% of 50 = 10

        expect(useCartStore.getState().getDiscount()).toBe(10);
        expect(useCartStore.getState().getTaxableSubtotal()).toBe(40);
    });

    it('should calculate total correctly (including tax)', () => {
        const { addItem } = useCartStore.getState();
        addItem(mockProduct, 'Gold', '#FFD700', 'M'); // Subtotal: 50

        // Tax: 50 * 0.08 = 4
        // Shipping: 10
        // Total: 50 + 4 + 10 = 64
        expect(useCartStore.getState().getTotal()).toBe(64);
    });
});
