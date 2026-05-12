import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const authApi = {
    // Register new user
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/register', data);
            return response.data;
        } catch (error: any) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Server is taking too long to respond. Please check if the backend is running.');
            }
            throw error;
        }
    },

    // Login user
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/login', data);
            return response.data;
        } catch (error: any) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Server is taking too long to respond. Please check if the backend is running.');
            }
            throw error;
        }
    },

    // Logout (client-side only)
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    },

    // Google OAuth login
    googleLogin: async (credential: string): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/google', { credential });
            return response.data;
        } catch (error: any) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Server is taking too long to respond. Please check if the backend is running.');
            }
            throw error;
        }
    },
};
