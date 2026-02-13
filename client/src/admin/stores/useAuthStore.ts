import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '../types';
import { authService, LoginCredentials } from '../services/authService';

interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);

          if (!response.isAdmin) {
            set({
              isLoading: false,
              error: 'Access denied. Admin privileges required.'
            });
            return false;
          }

          const admin: AdminUser = {
            _id: response._id,
            name: response.name,
            email: response.email,
            isAdmin: response.isAdmin,
            role: response.role,
          };

          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('admin_user', JSON.stringify(admin));

          set({
            admin,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please check your credentials.';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            admin: null,
            token: null,
          });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: () => {
        const token = localStorage.getItem('admin_token');
        const userStr = localStorage.getItem('admin_user');
        const state = get();

        if (token && userStr) {
          try {
            const admin = JSON.parse(userStr) as AdminUser;
            if (admin.isAdmin) {
              if (!state.isAuthenticated || state.token !== token || state.admin?._id !== admin._id) {
                set({ admin, token, isAuthenticated: true });
              }
              return true;
            }
          } catch {
            // Invalid stored data
          }
        }

        if (state.isAuthenticated || state.token !== null || state.admin !== null) {
          set({ admin: null, token: null, isAuthenticated: false });
        }
        return false;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
