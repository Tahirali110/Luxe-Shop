import api from './api';
import { Order, OrderStatus, PaymentStatus } from '../types';

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, orderStatus: OrderStatus): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}`, { orderStatus });
    return response.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: PaymentStatus): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}`, { paymentStatus });
    return response.data;
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}`, {
      orderStatus: 'Cancelled',
      paymentStatus: 'Failed'
    });
    return response.data;
  },
};
