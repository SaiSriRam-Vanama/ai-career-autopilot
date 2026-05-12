'use client';

import { useState, useRef, useEffect } from 'react';
import { chatApi } from '@/lib/api/chat';
import { ChatMessage } from '@/types';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load chat history if needed, or start fresh
        // For now we start fresh or could load from API
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const history = await chatApi.getHistory();
            if (history.messages) {
                setMessages(history.messages);
            }
        } catch (error) {
            console.log('No chat history');
        }
    };

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (content: string) => {
        // Add user message immediately
        const userMessage: ChatMessage = {
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            // Get AI response
            const response = await chatApi.sendMessage(content);

            const aiMessage: ChatMessage = {
                role: 'assistant',
                content: response.response,
                timestamp: response.timestamp
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Ideally show error toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-70">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <span className="text-4xl">👋</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Hello, {user?.full_name?.split(' ')[0]}!</h2>
                        <p className="text-muted-foreground max-w-sm">
                            I'm your AI Career Advisor. Ask me anything about your career path, skills, or job market trends.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-lg">
                            {['How can I become a Data Scientist?', 'Review my resume skills', 'What are high-paying Python jobs?', 'Draft a cover letter'].map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSend(prompt)}
                                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-sm text-left"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <MessageBubble key={i} message={msg} />
                    ))
                )}

                {loading && (
                    <div className="flex items-center gap-3 text-muted-foreground ml-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                    </div>
                )}
            </div>

            <div className="p-4 bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
                <ChatInput onSend={handleSend} disabled={loading} />
            </div>
        </div>
    );
}
