import api from './api';

export interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    type: 'message' | 'call_request';
    createdAt: string;
    updatedAt: string;
}

export const contactService = {
    getAll: async (): Promise<ContactMessage[]> => {
        const response = await api.get<ContactMessage[]>('/contacts');
        return response.data;
    },

    submitForm: async (data: any): Promise<any> => {
        const response = await api.post('/contacts', data);
        return response.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.put(`/contacts/${id}/read`);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/contacts/${id}`);
    },
};
