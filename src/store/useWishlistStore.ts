import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface WishlistState {
  items: number[]; // Array of product IDs
  
  // Actions
  addItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  toggleItem: (productId: number, productName?: string) => void;
  clearWishlist: () => void;
  
  // Computed
  isInWishlist: (productId: number) => boolean;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        set((state) => {
          if (state.items.includes(productId)) return state;
          return { items: [...state.items, productId] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(id => id !== productId),
        }));
      },

      toggleItem: (productId, productName) => {
        const isInWishlist = get().isInWishlist(productId);
        if (isInWishlist) {
          get().removeItem(productId);
          toast.success('Removed from wishlist', {
            description: productName ? `${productName} removed` : 'Item removed',
            icon: '💔',
          });
        } else {
          get().addItem(productId);
          toast.success('Added to wishlist', {
            description: productName ? `${productName} saved` : 'Item saved',
            icon: '❤️',
          });
        }
      },

      clearWishlist: () => set({ items: [] }),

      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },

      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: 'luxe-wishlist',
    }
  )
);
