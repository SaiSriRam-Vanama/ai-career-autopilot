'use client';

import { Target, FileText, Map, Briefcase, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="gradient-primary rounded-2xl p-8 text-white">
                    <h1 className="text-4xl font-bold mb-2">Your Career Dashboard</h1>
                    <p className="text-lg opacity-90">
                        Track your progress and take the next step in your career journey
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link
                        href="/dashboard/resume"
                        className="p-6 rounded-xl glass hover:scale-105 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Upload Resume</h3>
                        <p className="text-sm text-muted-foreground">
                            Extract skills from your resume
                        </p>
                    </Link>

                    <Link
                        href="/dashboard/roadmap"
                        className="p-6 rounded-xl glass hover:scale-105 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                            <Map className="w-6 h-6 text-secondary" />
                        </div>
                        <h3 className="font-semibold mb-2">Generate Roadmap</h3>
                        <p className="text-sm text-muted-foreground">
                            Get your personalized career plan
                        </p>
                    </Link>

                    <Link
                        href="/dashboard/jobs"
                        className="p-6 rounded-xl glass hover:scale-105 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                            <Briefcase className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="font-semibold mb-2">Search Jobs</h3>
                        <p className="text-sm text-muted-foreground">
                            Find opportunities that match your skills
                        </p>
                    </Link>

                    <Link
                        href="/dashboard/chat"
                        className="p-6 rounded-xl glass hover:scale-105 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">AI Advisor</h3>
                        <p className="text-sm text-muted-foreground">
                            Get personalized career advice
                        </p>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-muted-foreground">Skills Acquired</h3>
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground mt-1">Upload resume to start</p>
                    </div>

                    <div className="p-6 rounded-xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-muted-foreground">Roadmap Progress</h3>
                            <TrendingUp className="w-5 h-5 text-secondary" />
                        </div>
                        <p className="text-3xl font-bold">0%</p>
                        <p className="text-sm text-muted-foreground mt-1">Generate roadmap to begin</p>
                    </div>

                    <div className="p-6 rounded-xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-muted-foreground">Jobs Saved</h3>
                            <Briefcase className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-3xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground mt-1">Start searching for jobs</p>
                    </div>
                </div>

                {/* Getting Started */}
                <div className="p-8 rounded-xl glass">
                    <h2 className="text-2xl font-bold mb-4">🚀 Getting Started</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Upload Your Resume</h3>
                                <p className="text-sm text-muted-foreground">
                                    Let our AI extract your skills and experience automatically
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Generate Your Roadmap</h3>
                                <p className="text-sm text-muted-foreground">
                                    Get a personalized 12-week learning plan for your target role
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Track Your Progress</h3>
                                <p className="text-sm text-muted-foreground">
                                    Complete weekly goals and watch your skills grow
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
