'use client';

import { Badge } from '@/components/ui/badge';
import { X, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SkillsDisplayProps {
    skills: string[];
    onSkillRemove?: (skill: string) => void;
    onSkillAdd?: (skill: string) => void;
}

export default function SkillsDisplay({ skills, onSkillRemove, onSkillAdd }: SkillsDisplayProps) {
    // Safety check for invalid data from backend
    const validSkills = Array.isArray(skills)
        ? skills.filter(s => typeof s === 'string')
        : [];

    const [newSkill, setNewSkill] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSkill.trim() && onSkillAdd) {
            onSkillAdd(newSkill.trim());
            setNewSkill('');
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Extracted Skills
                </h3>
                <span className="text-sm text-muted-foreground">
                    {skills.length} skills identify
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {validSkills.map((skill) => (
                    <Badge
                        key={skill}
                        variant="secondary"
                        className="px-3 py-1 text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20 transition-colors flex items-center gap-2"
                    >
                        {skill}
                        {onSkillRemove && (
                            <button
                                onClick={() => onSkillRemove(skill)}
                                className="hover:bg-secondary/20 rounded-full p-0.5 ml-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </Badge>
                ))}

                {isAdding ? (
                    <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add skill..."
                            className="px-3 py-1 text-sm rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none w-32"
                            autoFocus
                            onBlur={() => !newSkill && setIsAdding(false)}
                        />
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-3 py-1 text-sm rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add Skill
                    </button>
                )}
            </div>
        </div>
    );
}
