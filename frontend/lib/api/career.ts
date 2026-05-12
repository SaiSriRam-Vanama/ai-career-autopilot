import apiClient from './client';
import { CareerRoadmap } from '@/types';

export const careerApi = {
    // Generate career roadmap
    generate: async (targetRole: string, weeks: number = 12): Promise<CareerRoadmap> => {
        const response = await apiClient.post<{ message: string; career_path: CareerRoadmap }>(
            `/career/generate?target_role=${encodeURIComponent(targetRole)}&duration=${weeks} weeks`
        );
        return response.data.career_path;
    },

    // Get user's roadmap
    getMyRoadmap: async (): Promise<CareerRoadmap> => {
        const response = await apiClient.get<CareerRoadmap>('/career/me');
        return response.data;
    },

    // Update roadmap
    updateRoadmap: async (): Promise<CareerRoadmap> => {
        const response = await apiClient.get<CareerRoadmap>('/career/update');
        return response.data;
    },

    // Get roadmap history
    getHistory: async (): Promise<CareerRoadmap[]> => {
        const response = await apiClient.get<CareerRoadmap[]>('/career/history');
        return response.data;
    },

    // Update task status
    updateTaskStatus: async (taskId: string, completed: boolean): Promise<any> => {
        const response = await apiClient.patch(`/career/task/${taskId}`, { completed });
        return response.data;
    },

    // Delete roadmap
    deleteRoadmap: async (roadmapId: string): Promise<any> => {
        const response = await apiClient.delete(`/career/${roadmapId}`);
        return response.data;
    },
};
