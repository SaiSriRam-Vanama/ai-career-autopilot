import apiClient from './client';
import { Job, JobSearchParams } from '@/types';

export const jobsApi = {
    // Search jobs
    search: async (params: JobSearchParams): Promise<Job[]> => {
        const response = await apiClient.get<{ jobs: Job[] }>('/jobs/search', { params });
        return response.data.jobs;
    },

    // Get job details
    getJobById: async (jobId: string): Promise<Job> => {
        const response = await apiClient.get<Job>(`/jobs/${jobId}`);
        return response.data;
    },
};
