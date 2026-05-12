import apiClient from './client';
import { ChatRequest, ChatResponse, ChatHistory } from '@/types';

export const chatApi = {
    // Send message to AI advisor
    sendMessage: async (message: string): Promise<ChatResponse> => {
        const response = await apiClient.post<ChatResponse>('/chat/assistant', {
            message,
        });
        return response.data;
    },

    // Get chat history
    getHistory: async (): Promise<ChatHistory> => {
        const response = await apiClient.get<ChatHistory>('/chat/history');
        return response.data;
    },
};
