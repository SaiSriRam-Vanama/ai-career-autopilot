'use client';

import { Job } from '@/types';
import { MapPin, Briefcase, Calendar, Building2, ExternalLink, Bookmark, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface JobCardProps {
    job: Job;
    onSave?: (jobId: string) => void;
}

export default function JobCard({ job, onSave }: JobCardProps) {
    return (
        <Dialog>
            <div className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all relative overflow-hidden flex flex-col h-full">
                {/* Hover Gradient Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/10 rounded-xl pointer-events-none transition-all" />

                <div className="flex items-start gap-4 mb-4">
                    {/* Company Logo / Placeholder */}
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-2xl font-bold text-muted-foreground overflow-hidden">
                        {job.employer_logo ? (
                            <img src={job.employer_logo} alt={job.employer_name} className="w-full h-full object-contain" />
                        ) : (
                            (job.employer_name || 'C').charAt(0)
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {job.job_title}
                                </h3>
                                <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {job.employer_name}
                                </p>
                            </div>
                            {onSave && (
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => onSave(job.job_id)}>
                                    <Bookmark className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground">
                        {job.job_city && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.job_city}, {job.job_country}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {job.job_employment_type || 'Full-time'}
                        </div>
                        {job.job_salary && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                                <DollarSign className="w-3.5 h-3.5" />
                                {job.job_salary}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Posted {new Date(job.job_posted_at_datetime_utc || Date.now()).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Skills (from description highlighting usually, but we'll show required skills if API returns) */}
                    {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {job.required_skills.slice(0, 4).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20">
                                    {skill}
                                </Badge>
                            ))}
                            {job.required_skills.length > 4 && (
                                <span className="text-xs text-muted-foreground self-center">
                                    +{job.required_skills.length - 4} more
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                            View Details
                        </Button>
                    </DialogTrigger>

                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white group-hover:translate-y-[-2px] transition-all" asChild>
                        <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                            Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                    </Button>
                </div>
            </div>

            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
                <div className="p-6 pb-2 flex-shrink-0 border-b border-border/40 bg-card z-10">
                    <DialogHeader>
                        <div className="flex items-start gap-5">
                            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-3xl font-bold text-muted-foreground overflow-hidden border border-border/50 shadow-sm">
                                {job.employer_logo ? (
                                    <img src={job.employer_logo} alt={job.employer_name} className="w-full h-full object-contain" />
                                ) : (
                                    (job.employer_name || 'C').charAt(0)
                                )}
                            </div>
                            <div className="space-y-1.5 flex-1 min-w-0 pr-8">
                                <DialogTitle className="text-2xl font-bold leading-tight decoration-clone">{job.job_title}</DialogTitle>
                                <DialogDescription className="text-lg font-medium text-primary flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {job.employer_name}
                                </DialogDescription>
                                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground pt-1">
                                    {job.job_city && (
                                        <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                                            {job.job_city}, {job.job_country}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground/70" />
                                        {job.job_employment_type || 'Full-time'}
                                    </div>
                                    {job.job_salary && (
                                        <div className="flex items-center gap-1.5 bg-green-500/10 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md font-medium border border-green-500/20">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            {job.job_salary}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="h-[60vh] overflow-y-auto px-6 py-6 scroll-smooth scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
                    <div className="space-y-8 max-w-3xl mx-auto">
                        {job.required_skills && job.required_skills.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground/80 text-sm uppercase tracking-wider">
                                    <span className="w-8 h-[2px] bg-primary/50 rounded-full"></span>
                                    Required Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.required_skills.map((skill, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm bg-secondary/10 hover:bg-secondary/20 border-secondary/20 text-secondary transition-colors">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground/80 text-sm uppercase tracking-wider">
                                <span className="w-8 h-[2px] bg-primary/50 rounded-full"></span>
                                Job Description
                            </h4>

                            <div className="text-foreground/90 text-[15px] leading-7 tracking-wide whitespace-pre-wrap font-sans">
                                {job.job_description}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-card z-50 flex justify-end gap-3 flex-shrink-0">
                    {job.job_apply_link ? (
                        <Button variant="outline" size="lg" asChild>
                            <a
                                href={job.job_apply_link.startsWith('http') ? job.job_apply_link : `https://${job.job_apply_link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open Link
                            </a>
                        </Button>
                    ) : (
                        <Button variant="outline" size="lg" disabled>
                            Open Link
                        </Button>
                    )}

                    {job.job_apply_link ? (
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25 min-w-[200px]"
                            size="lg"
                            asChild
                        >
                            <a
                                href={job.job_apply_link.startsWith('http') ? job.job_apply_link : `https://${job.job_apply_link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Apply for this Role <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                        </Button>
                    ) : (
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25 min-w-[200px]"
                            size="lg"
                            disabled
                        >
                            Apply for this Role <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
