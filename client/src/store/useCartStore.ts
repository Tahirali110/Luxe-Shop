import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { SHIPPING_COST, SHIPPING_THRESHOLD, TAX_RATE, SHIPPING_COST_EXPRESS, SHIPPING_COST_OVERNIGHT } from '@/utils/constants';
import { toast } from 'sonner';

export interface CartItem {
  id: string; // Unique ID: `${productId}-${color}-${size}`
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  colorHex: string;
  size?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Promo / discount (persisted)
  promoCode: string | null;
  promoPercentOff: number; // 0..100
  shippingMethod: 'standard' | 'express' | 'overnight';

  // Actions
  addItem: (product: Product, color: string, colorHex: string, size?: string, customPrice?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  setShippingMethod: (method: 'standard' | 'express' | 'overnight') => void;

  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTaxableSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemQuantity: (productId: string, color: string, size?: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: null,
      promoPercentOff: 0,
      shippingMethod: 'standard',

      addItem: (product, color, colorHex, size, customPrice) => {
        // Use _id from MongoDB, fallback to id if strictly needed by TS until fully migrated
        const productId = product._id;
        const id = `${productId}-${color}-${size || 'default'}`;

        // Handle optional colors array
        const colorVariant = product.colors?.find(c => c.name === color);
        const finalPrice = customPrice !== undefined ? customPrice : product.price;

        set((state) => {
          const existingItem = state.items.find(item => item.id === id);

          if (existingItem) {
            toast.success('Cart updated', {
              description: `${product.name} quantity increased`,
              icon: '✓',
            });
            return {
              items: state.items.map(item =>
                item.id === id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          toast.success('Added to cart', {
            description: `${product.name} has been added`,
            icon: '✓',
          });

          return {
            items: [
              ...state.items,
              {
                id,
                productId: productId,
                name: product.name,
                price: finalPrice,
                image: colorVariant?.image || (product.colors?.[0]?.image || product.image || ''),
                color,
                colorHex,
                size,
                quantity: 1,
              },
            ],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyPromoCode: (code) => {
        const normalized = code.toUpperCase().trim();
        const promos: Record<string, { percentOff: number; description: string }> = {
          SAVE20: { percentOff: 20, description: "20% off your order" },
          WELCOME10: { percentOff: 10, description: "10% off your order" },
        };
        const promo = promos[normalized];
        if (!promo) {
          toast.error("Invalid promo code", { description: "Please check the code and try again." });
          return false;
        }

        set({ promoCode: normalized, promoPercentOff: promo.percentOff });
        toast.success("Promo applied!", { description: promo.description });
        return true;
      },

      removePromoCode: () => {
        set({ promoCode: null, promoPercentOff: 0 });
        toast.success("Promo removed");
      },

      setShippingMethod: (method) => set({ shippingMethod: method }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const pct = get().promoPercentOff || 0;
        return subtotal * (pct / 100);
      },

      getTaxableSubtotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },

      getTax: () => {
        return get().getTaxableSubtotal() * TAX_RATE;
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;

        const method = get().shippingMethod;
        if (method === 'standard') {
          return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        } else if (method === 'express') {
          return SHIPPING_COST_EXPRESS;
        } else if (method === 'overnight') {
          return SHIPPING_COST_OVERNIGHT;
        }
        return SHIPPING_COST;
      },

      getTotal: () => {
        return get().getTaxableSubtotal() + get().getTax() + get().getShipping();
      },

      getItemQuantity: (productId, color, size) => {
        const id = `${productId}-${color}-${size || 'default'}`;
        const item = get().items.find(item => item.id === id);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'luxe-cart',
    }
  )
);
