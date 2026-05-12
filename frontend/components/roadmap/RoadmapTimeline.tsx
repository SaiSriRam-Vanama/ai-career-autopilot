'use client';

import { WeekPlan } from '@/types';
import WeekCard from './WeekCard';

interface RoadmapTimelineProps {
    weeks: WeekPlan[];
    onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export default function RoadmapTimeline({ weeks, onTaskToggle }: RoadmapTimelineProps) {
    return (
        <div className="relative space-y-8 md:space-y-0">
            {/* Center Line (Hidden on Mobile) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

            {weeks.map((week, index) => {
                const isLeft = index % 2 === 0;
                // Calculate completion status based on tasks
                const isCompleted = week.tasks?.every(t => t.completed) && week.tasks?.length > 0;

                return (
                    <div key={week.week} className={`relative md:flex items-center justify-between ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* Card Side */}
                        <div className="md:w-[45%] mb-8 md:mb-0">
                            <WeekCard
                                week={week}
                                isCompleted={isCompleted}
                                onTaskToggle={onTaskToggle}
                            />
                        </div>

                        {/* Center Timeline Node (Hidden on Mobile) */}
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-4 border-border items-center justify-center z-10 font-bold text-xs text-muted-foreground">
                            {week.week}
                        </div>

                        {/* Empty Side */}
                        <div className="hidden md:block md:w-[45%]" />
                    </div>
                );
            })}
        </div>
    );
}
