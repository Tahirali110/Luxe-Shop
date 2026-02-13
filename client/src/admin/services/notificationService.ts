import api from './api';

export interface Notification {
    _id: string;
    message: string;
    type: 'order' | 'stock' | 'review' | 'contact' | 'system';
    dataId?: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export const notificationService = {
    getAll: async (): Promise<Notification[]> => {
        const response = await api.get<Notification[]>('/notifications');
        return response.data;
    },

    markAsRead: async (id: string): Promise<Notification> => {
        const response = await api.put<Notification>(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>('/notifications/read-all');
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/notifications/${id}`);
        return response.data;
    },
};
