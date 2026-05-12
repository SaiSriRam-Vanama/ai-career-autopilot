'use client';

import { Send, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || disabled) return;

        onSend(input);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-2 p-3 bg-card border border-border rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask for career advice..."
                    disabled={disabled}
                    rows={1}
                    className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 py-3 px-2 outline-none"
                />

                <button
                    type="submit"
                    disabled={!input.trim() || disabled}
                    className="p-3 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Send className="w-5 h-5 relative z-10" />
                </button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                AI Advisor can make mistakes. Verify important information.
            </p>
        </form>
    );
}
