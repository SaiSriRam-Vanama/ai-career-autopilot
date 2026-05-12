'use client';

import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

interface GoogleSignInButtonProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    className?: string;
}

export function GoogleSignInButton({ onSuccess, onError, className = '' }: GoogleSignInButtonProps) {
    const router = useRouter();
    const { setAuth } = useAuth();

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (!credentialResponse.credential) {
                throw new Error('No credential received from Google');
            }

            // Send credential to backend
            const response = await authApi.googleLogin(credentialResponse.credential);

            // Store token and user data
            setAuth(response.user, response.access_token);

            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            const errorMessage = error.message || 'Google sign-in failed. Please try again.';
            if (onError) {
                onError(errorMessage);
            } else {
                alert(errorMessage);
            }
        }
    };

    const handleError = () => {
        const errorMessage = 'Google sign-in was cancelled or failed';
        console.error(errorMessage);
        if (onError) {
            onError(errorMessage);
        }
    };

    // Check if Google Client ID is configured
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
        return (
            <div className={`w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-center ${className}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Google Sign-In not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.
                </p>
            </div>
        );
    }

    return (
        <div className={`flex justify-center ${className}`}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
            />
        </div>
    );
}
