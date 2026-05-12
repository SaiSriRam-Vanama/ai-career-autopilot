'use client';

import { WeekPlan } from '@/types';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';

interface WeekCardProps {
    week: WeekPlan;
    isCompleted?: boolean;
    onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export default function WeekCard({ week, isCompleted = false, onTaskToggle }: WeekCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate completion for stats if needed
    const completedTasks = week.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = week.tasks?.length || 0;

    return (
        <div className={`
      relative pl-8 md:pl-0
      before:absolute before:left-0 before:top-8 before:w-6 before:h-0.5 before:bg-border md:before:hidden
    `}>
            <motion.div
                layout
                className={`
          rounded-xl border transition-all duration-300 overflow-hidden
          ${isCompleted
                        ? 'bg-secondary/5 border-secondary/20'
                        : 'bg-card border-border hover:border-primary/50 hover:shadow-lg'
                    }
        `}
            >
                {/* Header */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-6 cursor-pointer flex items-start gap-4"
                >
                    {/* Status Icon */}
                    <div className={`
              mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 z-10
              ${isCompleted
                            ? 'bg-secondary border-secondary text-white'
                            : 'border-muted-foreground/30 hover:border-primary text-transparent hover:text-primary/20'
                        }
            `}>
                        <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-semibold uppercase tracking-wider ${isCompleted ? 'text-secondary' : 'text-primary'}`}>
                                Week {week.week}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {week.estimated_hours}h
                            </span>
                        </div>

                        <h3 className={`text-xl font-bold mb-2 ${isCompleted ? 'text-secondary/80 line-through' : ''}`}>
                            {week.topic}
                        </h3>

                        <p className="text-muted-foreground text-sm line-clamp-2">
                            {completedTasks}/{totalTasks} tasks completed
                        </p>
                    </div>

                    <button className="text-muted-foreground hover:text-foreground">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border bg-muted/30"
                        >
                            <div className="p-6 space-y-6">
                                {/* Tasks List */}
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-primary" />
                                        Tasks & Objectives
                                    </h4>
                                    <ul className="space-y-3">
                                        {week.tasks?.map((task) => (
                                            <li key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/50">
                                                <Checkbox
                                                    id={task.id}
                                                    checked={task.completed}
                                                    onCheckedChange={(checked) => onTaskToggle?.(task.id, checked as boolean)}
                                                    className="mt-1"
                                                />
                                                <label
                                                    htmlFor={task.id}
                                                    className={`text-sm leading-relaxed cursor-pointer select-none ${task.completed ? 'text-muted-foreground line-through' : ''}`}
                                                >
                                                    {task.description}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
