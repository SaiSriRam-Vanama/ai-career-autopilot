'use client';

import { useState, useEffect } from 'react';
import { careerApi } from '@/lib/api/career';
import { CareerRoadmap } from '@/types';
import RoadmapTimeline from '@/components/roadmap/RoadmapTimeline';
import { Loader2, Map, Search, ArrowRight, Zap, History, Clock, Trash2, Plus, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

export default function RoadmapPage() {
    const { user } = useAuth();
    const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(null);
    const [selectedRoadmap, setSelectedRoadmap] = useState<CareerRoadmap | null>(null);
    const [history, setHistory] = useState<CareerRoadmap[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [targetRole, setTargetRole] = useState('');

    const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
    const [weeks, setWeeks] = useState(12);
    const searchParams = useSearchParams();

    useEffect(() => {
        loadData();

        // Check for role param
        const roleParam = searchParams.get('role');
        if (roleParam) {
            setTargetRole(roleParam);
            // Optional: Auto-scroll to form
            const form = document.querySelector('form');
            if (form) form.scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchParams]);

    const loadData = async () => {
        try {
            const [current, past] = await Promise.all([
                careerApi.getMyRoadmap().catch(() => null),
                careerApi.getHistory().catch(() => [])
            ]);

            if (current) {
                setActiveRoadmap(current);
            }
            if (past) setHistory(past);
        } catch (error) {
            console.log('Error loading roadmap data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetRole.trim()) return;

        setGenerating(true);
        try {
            const data = await careerApi.generate(targetRole, weeks);
            setActiveRoadmap(data);
            setSelectedRoadmap(data);
            setViewMode('detail');
            setTargetRole(''); // Clear input
            setWeeks(12); // Reset weeks

            // Refresh history (old active might have moved to history)
            const past = await careerApi.getHistory();
            setHistory(past);
        } catch (error) {
            console.error('Failed to generate roadmap:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleTaskToggle = async (taskId: string, completed: boolean) => {
        if (!selectedRoadmap) return;

        // Optimistic update
        const updatedWeeks = selectedRoadmap.roadmap.map(week => ({
            ...week,
            tasks: week.tasks.map(t =>
                t.id === taskId ? { ...t, completed } : t
            )
        }));

        // Recalculate percentage
        const totalTasks = updatedWeeks.reduce((acc, week) => acc + (week.tasks?.length || 0), 0) || 0;
        const completedTasksCount = updatedWeeks.reduce((acc, week) => acc + (week.tasks?.filter(t => t.completed).length || 0), 0) || 0;
        const newPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

        const updatedRoadmap = {
            ...selectedRoadmap,
            roadmap: updatedWeeks,
            progress: { ...selectedRoadmap.progress, percentage: newPercentage }
        };

        setSelectedRoadmap(updatedRoadmap);

        // Update Active if current
        if (activeRoadmap?.id === selectedRoadmap.id) {
            setActiveRoadmap(updatedRoadmap);
        }

        // Update History list if present (for consistency when going back)
        setHistory(prev => prev.map(h =>
            h.id === selectedRoadmap.id
                ? { ...h, progress: { percentage: newPercentage } }
                : h
        ));

        try {
            await careerApi.updateTaskStatus(taskId, completed);
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const handleDelete = async (roadmapId: string) => {
        try {
            await careerApi.deleteRoadmap(roadmapId);
            setHistory(history.filter(h => h.id !== roadmapId));

            if (activeRoadmap?.id === roadmapId) {
                setActiveRoadmap(null);
            }

            // If deleting the one we are viewing, go back
            if (selectedRoadmap?.id === roadmapId) {
                setSelectedRoadmap(null);
                setViewMode('overview');
            }
        } catch (error) {
            console.error('Failed to delete roadmap:', error);
        }
    };

    const handleViewRoadmap = (item: CareerRoadmap) => {
        setSelectedRoadmap(item);
        setViewMode('detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // --- OVERVIEW MODE ---
    if (viewMode === 'overview' && !generating) {
        return (
            <div className="flex flex-col items-center min-h-[70vh] max-w-4xl mx-auto px-4 relative space-y-12">

                {/* Generation Section */}
                <div className="text-center w-full max-w-2xl mx-auto pt-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-xl mx-auto">
                        <Map className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Design Your Career Path</h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Tell us your dream role, and our AI will build a personalized 12-week roadmap.
                    </p>

                    <form onSubmit={handleGenerate} className="w-full relative group space-y-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Senior Python Developer, Data Scientist..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg"
                            />
                        </div>

                        {/* Duration Slider */}
                        <div className="bg-card/50 p-6 rounded-xl border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    Roadmap Duration
                                </label>
                                <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">
                                    {weeks} Weeks
                                </span>
                            </div>
                            <input
                                type="range"
                                min="4"
                                max="24"
                                step="1"
                                value={weeks}
                                onChange={(e) => setWeeks(parseInt(e.target.value))}
                                className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>Specific Touchup (4 weeks)</span>
                                <span>Career Pivot (12 weeks)</span>
                                <span>Mastery (24 weeks)</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!targetRole.trim()}
                            className="w-full py-4 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/25"
                        >
                            Generate Roadmap
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                {/* Active Roadmap Section */}
                {activeRoadmap && (
                    <div className="w-full space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                            <Zap className="w-5 h-5" />
                            Current Roadmap
                        </h3>
                        <div
                            className="p-5 rounded-xl border-2 border-primary/20 bg-primary/5 cursor-pointer hover:border-primary/40 transition-all group relative"
                            onClick={() => handleViewRoadmap(activeRoadmap)}
                        >
                            <div className="absolute top-4 right-4 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">
                                Active
                            </div>
                            <h4 className="font-bold text-xl mb-2 text-foreground">{activeRoadmap.target_role}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Created {new Date(activeRoadmap.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="w-full bg-background/50 rounded-full h-2 mb-2 overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${activeRoadmap.progress?.percentage || 0}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span>Progress</span>
                                <span>{activeRoadmap.progress?.percentage || 0}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Section */}
                {(history.length > 0 || activeRoadmap) && (
                    <div className="w-full space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-muted-foreground border-b border-border pb-2 mt-8">
                            <History className="w-5 h-5" />
                            All Roadmaps
                        </h3>
                        <div className="grid gap-4">
                            {(activeRoadmap ? [activeRoadmap, ...history] : history).map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all cursor-pointer group flex items-center justify-between ${activeRoadmap?.id === item.id ? 'border-primary/30 bg-primary/5' : ''}`}
                                    onClick={() => handleViewRoadmap(item)}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-lg text-foreground">{item.target_role}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-muted-foreground mb-1">Done</span>
                                            <span className="font-bold text-sm bg-secondary/10 text-secondary px-2 py-0.5 rounded-md">
                                                {item.progress?.percentage || 0}%
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- LOADING STATE FOR GENERATION ---
    if (generating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <Zap className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Generating Your Roadmap...</h2>
                <p className="text-muted-foreground max-w-md">
                    Analyzing job market data, identifying skill gaps, and curating the perfect curriculum for <span className="text-primary font-semibold">{targetRole}</span>.
                </p>
            </div>
        );
    }

    // --- DETAIL VIEW ---
    const percentage = selectedRoadmap?.progress?.percentage || 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header Navigation */}
            <div>
                <Button
                    variant="ghost"
                    onClick={() => {
                        setViewMode('overview');
                        setSelectedRoadmap(null);
                    }}
                    className="flex items-center gap-2 pl-0 hover:bg-transparent hover:text-primary mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Dashboard
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Your Career Roadmap</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>Target Role:</span>
                            <span className="text-primary font-semibold px-2 py-0.5 rounded-md bg-primary/10">
                                {selectedRoadmap?.target_role}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Auto-Save Indicator */}
                        <span className="text-xs text-emerald-500 font-medium px-2 py-1 bg-emerald-500/10 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Auto-Saved
                        </span>

                        <div className="text-right">
                            <p className="text-sm font-medium">Progress</p>
                            <p className="text-xs text-muted-foreground">{percentage}% Completed</p>
                        </div>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-muted/20"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="text-primary transition-all duration-1000 ease-out"
                                    strokeDasharray={`${percentage}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                            </svg>
                            <span className="text-xs font-bold">{percentage}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="py-2">
                <RoadmapTimeline
                    weeks={selectedRoadmap?.roadmap || []}
                    onTaskToggle={handleTaskToggle}
                />
            </div>
        </div>
    );
}

function Sparkles({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}
