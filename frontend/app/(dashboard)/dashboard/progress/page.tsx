'use client';

import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Target, Briefcase, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
    { name: 'Week 1', progress: 100 },
    { name: 'Week 2', progress: 80 },
    { name: 'Week 3', progress: 45 },
    { name: 'Week 4', progress: 0 },
    { name: 'Week 5', progress: 0 },
];

const skillsData = [
    { name: 'Python', value: 80, color: '#8b5cf6' }, // Primary
    { name: 'React', value: 65, color: '#10b981' }, // Secondary
    { name: 'FastAPI', value: 50, color: '#f97316' }, // Accent
    { name: 'System Design', value: 30, color: '#3b82f6' },
];

const COLORS = ['#8b5cf6', '#10b981', '#f97316', '#3b82f6'];

export default function ProgressPage() {
    const { user } = useAuth();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Progress Overview</h1>
                <p className="text-muted-foreground">
                    Track your skill acquisition and roadmap completion.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Total Skills</h3>
                        <Award className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        +3 this week
                    </p>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Weeks Completed</h3>
                        <TrendingUp className="w-5 h-5 text-secondary" />
                    </div>
                    <p className="text-3xl font-bold">2/12</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        16% of roadmap
                    </p>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Current Streak</h3>
                        <Target className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-3xl font-bold">5 Days</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Keep it up!
                    </p>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Jobs Applied</h3>
                        <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Start applying now
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Weekly Progress */}
                <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="text-lg font-bold mb-6">Weekly Activity</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skills Distribution */}
                <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="text-lg font-bold mb-6">Skill Proficiency</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={skillsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {skillsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 flex-wrap">
                        {skillsData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
