import api from './api';
import { AdminUser } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: 'admin' | 'demo_admin';
  avatar?: string;
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/users/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<AdminUser> => {
    const response = await api.get<AdminUser>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await api.put<AdminUser>('/users/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/users/password', { currentPassword, newPassword });
  },
};
