'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    token: string | null;
    refreshUser: () => Promise<void>;
    setAuth: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('access_token');
        }
        return null;
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            // Check if we're in browser environment
            if (typeof window === 'undefined') {
                setLoading(false);
                return;
            }

            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('access_token');

            if (storedToken) {
                setToken(storedToken);
            }

            // Only parse if both exist and storedUser is not null/undefined
            if (storedUser && storedToken && storedUser !== 'undefined' && storedUser !== 'null') {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (parseError) {
                    console.error('Error parsing stored user:', parseError);
                    // Clear invalid data
                    localStorage.removeItem('user');
                    localStorage.removeItem('access_token');
                    setToken(null);
                }
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (data: LoginRequest) => {
        try {
            const response = await authApi.login(data);
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setToken(response.access_token);
            setUser(response.user);
            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            const response = await authApi.register(data);
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setToken(response.access_token);
            setUser(response.user);
            router.push('/dashboard');
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error("Failed to refresh user", error);
        }
    };

    const setAuth = (newUser: User, newToken: string) => {
        setUser(newUser);
        setToken(newToken);
        localStorage.setItem('access_token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                token: token,
                refreshUser,
                setAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
