'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MapPin, Building, DollarSign, Calendar, Globe, ExternalLink } from 'lucide-react';

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            if (!params.id || !token) return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/jobs/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    if (res.status === 404) throw new Error('Job not found');
                    throw new Error('Failed to load job details');
                }

                const data = await res.json();
                setJob(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [params.id, token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Jobs
                </button>
                <div className="bg-red-50 text-red-600 p-8 rounded-xl text-center">
                    <h2 className="text-xl font-bold mb-2">Error Loading Job</h2>
                    <p>{error || "Job unavailable"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Results
            </button>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {/* Header */}
                <div className="p-8 border-b border-border bg-slate-50/50">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex gap-6">
                            <div className="w-20 h-20 bg-white rounded-xl border border-border flex items-center justify-center shadow-sm">
                                <Building className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                                <div className="text-xl text-muted-foreground font-medium flex items-center gap-2">
                                    {job.company}
                                    {job.source === 'jsearch' && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <a
                            href={job.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden md:flex bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all items-center gap-2 shadow-lg shadow-primary/25"
                        >
                            Apply Now <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-8">
                        {job.location && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="font-medium">{job.location}</span>
                            </div>
                        )}
                        {(job.salary_min || job.salary_max) && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <span className="font-medium">
                                    {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''}
                                    {job.salary_min && job.salary_max && ' - '}
                                    {job.salary_max ? `$${job.salary_max.toLocaleString()}` : ''}
                                    {' '}{job.salary_currency}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">Posted {new Date(job.fetched_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Skills */}
                    {job.required_skills && job.required_skills.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-500 text-sm">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.required_skills.map((skill: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm border border-slate-200">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Description */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-500 text-sm">Job Description</h3>
                        <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {job.description || "No detailed description provided for this position."}
                        </div>
                    </section>
                </div>

                {/* Mobile Apply Button (Sticky) */}
                <div className="md:hidden sticky bottom-0 p-4 bg-white border-t border-border">
                    <a
                        href={job.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex justify-center w-full bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all items-center gap-2"
                    >
                        Apply Now <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
