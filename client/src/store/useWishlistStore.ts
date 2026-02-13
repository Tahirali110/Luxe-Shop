import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import authService from '@/services/authService';

interface WishlistState {
  items: string[]; // Array of product IDs (strings for MongoDB _id)

  // Actions
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string, productName?: string) => void;
  clearWishlist: () => void;
  setItems: (items: string[]) => void;

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
          const newItems = [...state.items, productId];

          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.token) {
              authService.syncWishlist(newItems, user.token).catch(console.error);
            }
          }

          return { items: newItems };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter(id => id !== productId);

          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.token) {
              authService.syncWishlist(newItems, user.token).catch(console.error);
            }
          }

          return { items: newItems };
        });
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

      clearWishlist: () => {
        set({ items: [] });
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.token) {
            authService.syncWishlist([], user.token).catch(console.error);
          }
        }
      },

      setItems: (items) => set({ items }),

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
