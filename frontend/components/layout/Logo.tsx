'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    href?: string;
    animated?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-3xl' },
    lg: { icon: 'w-16 h-16', text: 'text-5xl' },
};

export function Logo({
    size = 'md',
    showText = true,
    href,
    animated = true,
    className = ''
}: LogoProps) {
    const sizes = sizeClasses[size];

    const logoContent = (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Animated Icon */}
            <motion.div
                className="relative"
                animate={animated ? {
                    y: [0, -8, 0],
                } : {}}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {/* Glow effect */}
                <motion.div
                    className={`absolute inset-0 ${sizes.icon} blur-xl opacity-50`}
                    animate={animated ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    } : {}}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent rounded-full" />
                </motion.div>

                {/* Rocket Icon */}
                <motion.div
                    className={`relative ${sizes.icon} text-primary`}
                    whileHover={animated ? {
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1
                    } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <Rocket className="w-full h-full" />
                </motion.div>

                {/* Orbiting particles */}
                {animated && (
                    <>
                        <motion.div
                            className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"
                            animate={{
                                x: [0, 10, 0, -10, 0],
                                y: [0, -10, 0, 10, 0],
                                opacity: [0, 1, 1, 1, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 w-2 h-2 bg-accent rounded-full"
                            animate={{
                                x: [0, -10, 0, 10, 0],
                                y: [0, 10, 0, -10, 0],
                                opacity: [0, 1, 1, 1, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 1.5
                            }}
                        />
                    </>
                )}
            </motion.div>

            {/* Text */}
            {showText && (
                <motion.span
                    className={`${sizes.text} font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    AI Career Autopilot
                </motion.span>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="inline-block">
                {logoContent}
            </Link>
        );
    }

    return logoContent;
}
