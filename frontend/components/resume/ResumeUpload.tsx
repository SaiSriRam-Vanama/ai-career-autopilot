'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { resumeApi } from '@/lib/api/resume';
import { Resume } from '@/types';

interface ResumeUploadProps {
    onUploadSuccess: (resume: Resume) => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validate file type (frontend check)
        if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
            setError('Please upload a PDF, DOCX, or TXT file.');
            return;
        }

        setLoading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // Simulate progress
            const interval = setInterval(() => {
                setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
            }, 200);

            // Upload the file directly
            const resume = await resumeApi.upload(file);

            clearInterval(interval);
            setUploadProgress(100);
            onUploadSuccess(resume);

        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to upload resume');
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
          ${error ? 'border-destructive bg-destructive/5' : ''}
        `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                        <p className="text-lg font-semibold mb-1">
                            {isDragActive ? 'Drop your resume here' : 'Click or drag to upload resume'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Supports PDF, DOCX, TXT (Max 5MB)
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {loading && (
                <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uploading and analyzing...</span>
                        <span className="font-semibold">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
}
