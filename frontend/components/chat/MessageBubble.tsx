'use client';

import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
    message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-4 max-w-[85%]",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
        >
            {/* Avatar */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                isUser ? "bg-primary text-white" : "bg-white border border-border"
            )}>
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-primary" />}
            </div>

            {/* Message Content */}
            <div className={cn(
                "rounded-2xl px-5 py-3 shadow-sm",
                isUser
                    ? "bg-primary text-white rounded-tr-none gradient-primary"
                    : "bg-card border border-border rounded-tl-none"
            )}>
                <div className={cn("prose prose-sm max-w-none break-words", isUser ? "text-white prose-invert" : "")}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <p className={cn(
                    "text-[10px] mt-1 opacity-70",
                    isUser ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    );
}
