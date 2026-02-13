import api from './api';
import { Product } from '../types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await Promise.all(ids.map(id => api.delete(`/products/${id}`)));
  },

  updateStock: async (id: string, stock: number): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, { stock });
    return response.data;
  },

  deleteReview: async (productId: string, reviewId: string): Promise<void> => {
    await api.delete(`/products/${productId}/reviews/${reviewId}`);
  },

  replyToReview: async (productId: string, reviewId: string, reply: string): Promise<void> => {
    await api.put(`/products/${productId}/reviews/${reviewId}/reply`, { reply });
  },
};
