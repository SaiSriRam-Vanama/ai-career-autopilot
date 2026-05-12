'use client';

import { useState, useEffect } from 'react';
import { jobsApi } from '@/lib/api/jobs';
import { Job } from '@/types';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import { Loader2, Briefcase } from 'lucide-react';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        // Initial load: Try to get user's target role from roadmap, otherwise default
        const loadInitialJobs = async () => {
            setLoading(true);
            try {
                let initialQuery = 'Software Engineer';
                try {
                    const roadmap = await careerApi.getMyRoadmap();
                    if (roadmap && roadmap.target_role) {
                        initialQuery = roadmap.target_role;
                    }
                } catch (e) {
                    // No active roadmap, stick to default
                }

                const results = await jobsApi.search({ query: initialQuery });
                setJobs(results);
            } catch (error) {
                console.error('Initial job load failed:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialJobs();
    }, []);

    const handleSearch = async (query: string, location: string) => {
        setLoading(true);
        setSearched(true);
        try {
            // If query is empty but location is provided, default query to "Developer"
            // If both empty, don't search
            const searchQuery = query.trim() || (location.trim() ? 'Developer' : '');

            if (!searchQuery) return;

            const results = await jobsApi.search({ query: searchQuery, location });
            setJobs(results);
        } catch (error) {
            console.error('Job search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Job Market</h1>
                <p className="text-muted-foreground">
                    Find opportunities that match your skill set and career goals.
                </p>
            </div>

            <JobFilters onSearch={handleSearch} loading={loading} />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Scanning job market...</p>
                </div>
            ) : (
                <>
                    {searched && jobs.length === 0 ? (
                        <div className="text-center py-20 opacity-70">
                            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                            <p className="text-muted-foreground">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {jobs.map((job) => (
                                <JobCard key={job.job_id} job={job} />
                            ))}
                        </div>
                    )}

                    {!searched && (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Briefcase className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Start Your Job Search</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Enter your target role and location to see available positions from top job boards.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
