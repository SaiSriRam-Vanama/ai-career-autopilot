import apiClient from './client';
import { Resume } from '@/types';

export const resumeApi = {
    // Upload resume
    // Upload resume
    upload: async (file: File): Promise<Resume> => {
        const formData = new FormData();
        formData.append('file', file);
        return (await apiClient.post<Resume>('/resume/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })).data;
    },

    // Get user's resume
    getMyResume: async (): Promise<Resume> => {
        const response = await apiClient.get<Resume>('/resume/me');
        return response.data;
    },
};
