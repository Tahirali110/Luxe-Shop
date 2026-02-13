import api from './api';
import { User } from '../types';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleAdmin: async (id: string, isAdmin: boolean): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, { isAdmin });
    return response.data;
  },

  updateProfile: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  },
};
