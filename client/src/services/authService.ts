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
    avatar?: string;
    token: string;
    addresses?: Address[];
    wishlist?: (string | any)[];
    cart?: {
        product: string | any;
        color: string;
        size?: string;
        quantity: number;
    }[];
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
        const { avatar, ...userWithoutAvatar } = response.data;
        localStorage.setItem('user', JSON.stringify(userWithoutAvatar));
    }

    return response.data;
};

const register = async (userData: RegisterData): Promise<User> => {
    const response = await axios.post(`${API_URL}/api/users`, userData);

    if (response.data) {
        const { avatar, ...userWithoutAvatar } = response.data;
        localStorage.setItem('user', JSON.stringify(userWithoutAvatar));
    }

    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
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

const syncCart = async (cart: any[], token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/api/users/profile/cart`, { cart }, config);
    return response.data;
};

const syncWishlist = async (wishlist: string[], token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/api/users/profile/wishlist`, { wishlist }, config);
    return response.data;
};

const updateProfile = async (userData: Partial<User>, token: string): Promise<User> => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/api/users/profile`, userData, config);

    if (response.data) {
        // Merge with existing user data to preserve the token, but omit avatar from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const currentUser = JSON.parse(storedUser);
            const { avatar, ...updatedWithoutAvatar } = response.data;
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedWithoutAvatar }));
        }
    }

    return response.data;
};

const authService = {
    login,
    register,
    getProfile,
    updateProfile,
    logout,
    syncCart,
    syncWishlist,
};

export default authService;