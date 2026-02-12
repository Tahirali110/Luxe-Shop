import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface WishlistState {
  items: string[]; // Array of product IDs (strings for MongoDB _id)

  // Actions
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string, productName?: string) => void;
  clearWishlist: () => void;

  // Computed
  isInWishlist: (productId: string) => boolean;
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
