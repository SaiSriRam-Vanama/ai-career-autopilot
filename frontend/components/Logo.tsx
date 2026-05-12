'use client';

import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Logo({ size = 'medium', showText = true }: { size?: 'small' | 'medium' | 'large', showText?: boolean }) {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const textClasses = {
        small: 'text-lg',
        medium: 'text-xl',
        large: 'text-3xl'
    };

    return (
        <div className="flex items-center gap-2">
            <motion.div
                initial={{ rotate: -45, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`bg-primary text-primary-foreground rounded-lg flex items-center justify-center ${size === 'large' ? 'p-3' : 'p-2'} shadow-lg shadow-primary/20`}
            >
                <Rocket className={`${sizeClasses[size]} fill-current`} />
            </motion.div>

            {showText && (
                <div className="flex flex-col">
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 ${textClasses[size]}`}
                    >
                        CareerAutoPilot
                    </motion.span>
                    {size === 'large' && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm text-muted-foreground font-medium"
                        >
                            AI-Powered Career Guidance
                        </motion.span>
                    )}
                </div>
            )}
        </div>
    );
}
