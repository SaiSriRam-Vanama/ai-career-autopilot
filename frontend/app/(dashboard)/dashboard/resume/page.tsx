'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/api/resume';
import { Resume } from '@/types';
import ResumeUpload from '@/components/resume/ResumeUpload';
import SkillsDisplay from '@/components/resume/SkillsDisplay';
import { FileText, ArrowRight, Loader2, Briefcase, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResumePage() {
    const { user } = useAuth();
    const [resume, setResume] = useState<Resume | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadResume();
    }, []);

    const loadResume = async () => {
        try {
            const data = await resumeApi.getMyResume();
            setResume(data);
        } catch (error) {
            // Ignore 404 if resume not found
            console.log('No resume found');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = (newResume: Resume) => {
        setResume(newResume);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Resume & Skills</h1>
                <p className="text-muted-foreground">
                    Manage your resume, view extracted skills, and get personalized role recommendations.
                </p>
            </div>

            <div className="grid gap-8">
                {/* Upload Section */}
                <div className="p-6 rounded-2xl glass bg-card">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Upload New Resume
                    </h2>
                    <ResumeUpload onUploadSuccess={handleUploadSuccess} />
                </div>

                {/* Skills Section - Only show if resume exists */}
                {resume && (
                    <div className="p-6 rounded-2xl glass bg-card animate-fade-in">
                        <SkillsDisplay skills={resume.extracted_skills || []} />

                        {resume.recommended_roles && resume.recommended_roles.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-border/50">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    AI Recommended Roles
                                </h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {resume.recommended_roles.map((role) => (
                                        <div
                                            key={role}
                                            className="group relative p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <h4 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                                {role}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Based on your skills, this role is a strong match.
                                            </p>
                                            <button
                                                onClick={() => router.push(`/dashboard/roadmap?role=${encodeURIComponent(role)}`)}
                                                className="w-full py-2 px-4 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Zap className="w-4 h-4" />
                                                Generate Roadmap
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <Link
                                href="/dashboard/roadmap"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-semibold shadow-lg"
                            >
                                Generate Career Roadmap
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
