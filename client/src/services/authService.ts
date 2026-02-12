import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Address {
    _id: string;
    label: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
    addresses?: Address[];
    wishlist?: string[];
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

const login = async (userData: LoginData): Promise<User> => {
    const response = await axios.post(`${API_URL}/api/users/login`, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

const register = async (userData: RegisterData): Promise<User> => {
    const response = await axios.post(`${API_URL}/api/users`, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

const getProfile = async (token: string): Promise<User> => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/api/users/profile`, config);
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const authService = {
    login,
    register,
    getProfile,
    logout,
};

export default authService;
