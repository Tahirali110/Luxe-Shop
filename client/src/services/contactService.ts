import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const contactService = {
    submitForm: async (formData: { name: string; email: string; subject: string; message: string; type?: string }) => {
        const response = await axios.post(`${API_URL}/api/contacts`, formData);
        return response.data;
    },
};
