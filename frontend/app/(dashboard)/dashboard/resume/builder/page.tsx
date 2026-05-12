'use client';

import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Download, Plus, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResumeBuilderPage() {
    const router = useRouter();
    const componentRef = useRef(null);

    const [resumeData, setResumeData] = useState({
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        summary: 'Experienced professional with a passion for...',
        education: [
            { school: 'University of Technology', degree: 'B.S. Computer Science', year: '2020' }
        ],
        experience: [
            { company: 'Tech Corp', role: 'Software Engineer', duration: '2020 - Present', description: 'Developed web applications...' }
        ],
        skills: ['JavaScript', 'React', 'Python']
    });

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('resume_draft');
        if (saved) {
            try {
                setResumeData(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved resume", e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem('resume_draft', JSON.stringify(resumeData));
        }, 1000); // Debounce save
        return () => clearTimeout(timeoutId);
    }, [resumeData]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'My_Resume',
    });

    const updateField = (field: string, value: any) => {
        setResumeData({ ...resumeData, [field]: value });
    };

    const addEducation = () => {
        setResumeData({
            ...resumeData,
            education: [...resumeData.education, { school: '', degree: '', year: '' }]
        });
    };

    const addExperience = () => {
        setResumeData({
            ...resumeData,
            experience: [...resumeData.experience, { company: '', role: '', duration: '', description: '' }]
        });
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold">Resume Builder</h1>
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
                >
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Editor Panel */}
                <div className="w-1/2 overflow-y-auto p-8 border-r border-border bg-white custom-scrollbar">
                    <h2 className="text-lg font-semibold mb-6">Editor</h2>

                    <div className="space-y-8">
                        {/* Personal Info */}
                        <section className="space-y-4">
                            <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-sm">Personal Info</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    className="p-3 border rounded-lg w-full"
                                    placeholder="Full Name"
                                    value={resumeData.fullName}
                                    onChange={(e) => updateField('fullName', e.target.value)}
                                />
                                <input
                                    className="p-3 border rounded-lg w-full"
                                    placeholder="Email"
                                    value={resumeData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                />
                                <input
                                    className="p-3 border rounded-lg w-full"
                                    placeholder="Phone"
                                    value={resumeData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                />
                            </div>
                            <textarea
                                className="p-3 border rounded-lg w-full h-24 resize-none"
                                placeholder="Professional Summary"
                                value={resumeData.summary}
                                onChange={(e) => updateField('summary', e.target.value)}
                            />
                        </section>

                        {/* Experience */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-sm">Experience</h3>
                                <button onClick={addExperience} className="text-sm text-primary flex items-center gap-1 hover:underline">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                            {resumeData.experience.map((exp, idx) => (
                                <div key={idx} className="p-4 border rounded-lg space-y-3 bg-slate-50">
                                    <input
                                        className="p-2 border rounded w-full"
                                        placeholder="Company"
                                        value={exp.company}
                                        onChange={(e) => {
                                            const newExp = [...resumeData.experience];
                                            newExp[idx].company = e.target.value;
                                            updateField('experience', newExp);
                                        }}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            className="p-2 border rounded w-full"
                                            placeholder="Role"
                                            value={exp.role}
                                            onChange={(e) => {
                                                const newExp = [...resumeData.experience];
                                                newExp[idx].role = e.target.value;
                                                updateField('experience', newExp);
                                            }}
                                        />
                                        <input
                                            className="p-2 border rounded w-full"
                                            placeholder="Duration"
                                            value={exp.duration}
                                            onChange={(e) => {
                                                const newExp = [...resumeData.experience];
                                                newExp[idx].duration = e.target.value;
                                                updateField('experience', newExp);
                                            }}
                                        />
                                    </div>
                                    <textarea
                                        className="p-2 border rounded w-full h-20"
                                        placeholder="Description"
                                        value={exp.description}
                                        onChange={(e) => {
                                            const newExp = [...resumeData.experience];
                                            newExp[idx].description = e.target.value;
                                            updateField('experience', newExp);
                                        }}
                                    />
                                </div>
                            ))}
                        </section>

                        {/* Education */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-sm">Education</h3>
                                <button onClick={addEducation} className="text-sm text-primary flex items-center gap-1 hover:underline">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                            {resumeData.education.map((edu, idx) => (
                                <div key={idx} className="p-4 border rounded-lg space-y-3 bg-slate-50">
                                    <input
                                        className="p-2 border rounded w-full"
                                        placeholder="School"
                                        value={edu.school}
                                        onChange={(e) => {
                                            const newEdu = [...resumeData.education];
                                            newEdu[idx].school = e.target.value;
                                            updateField('education', newEdu);
                                        }}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            className="p-2 border rounded w-full"
                                            placeholder="Degree"
                                            value={edu.degree}
                                            onChange={(e) => {
                                                const newEdu = [...resumeData.education];
                                                newEdu[idx].degree = e.target.value;
                                                updateField('education', newEdu);
                                            }}
                                        />
                                        <input
                                            className="p-2 border rounded w-full"
                                            placeholder="Year"
                                            value={edu.year}
                                            onChange={(e) => {
                                                const newEdu = [...resumeData.education];
                                                newEdu[idx].year = e.target.value;
                                                updateField('education', newEdu);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Skills */}
                        <section className="space-y-4">
                            <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-sm">Skills</h3>
                            <input
                                className="p-3 border rounded-lg w-full"
                                placeholder="Skills (comma separated)"
                                value={resumeData.skills.join(', ')}
                                onChange={(e) => updateField('skills', e.target.value.split(', '))}
                            />
                        </section>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="w-1/2 bg-slate-100 p-8 overflow-y-auto flex justify-center">
                    <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm]" ref={componentRef}>
                        {/* Resume Template: ATS Friendly Simple */}
                        <header className="border-b-2 border-slate-800 pb-4 mb-6">
                            <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-900">{resumeData.fullName}</h1>
                            <div className="text-slate-600 mt-2 flex gap-4 text-sm">
                                <span>{resumeData.email}</span>
                                <span>{resumeData.phone}</span>
                            </div>
                        </header>

                        <section className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Professional Summary</h2>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {resumeData.summary}
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Experience</h2>
                            <div className="space-y-4">
                                {resumeData.experience.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-slate-900">{exp.role}</h3>
                                            <span className="text-xs text-slate-500">{exp.duration}</span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-700 mb-1">{exp.company}</div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Education</h2>
                            <div className="space-y-4">
                                {resumeData.education.map((edu, i) => (
                                    <div key={i} className="flex justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{edu.school}</h3>
                                            <div className="text-sm text-slate-700">{edu.degree}</div>
                                        </div>
                                        <span className="text-xs text-slate-500">{edu.year}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.skills.map((skill, i) => (
                                    <span key={i} className="text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
