'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    Rocket,
    Compass,
    Trophy,
    Target,
    Brain,
    TrendingUp,
    Sparkles,
    Zap,
    LucideIcon
} from 'lucide-react';

interface IconWrapperProps {
    children: React.ReactNode;
    className?: string;
}

// Floating animation wrapper
export function FloatingIcon({ children, className = '' }: IconWrapperProps) {
    return (
        <motion.div
            className={className}
            animate={{
                y: [0, -15, 0],
                rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {children}
        </motion.div>
    );
}

// 3D Rotating icon with perspective
export function RotatingIcon({ children, className = '' }: IconWrapperProps) {
    return (
        <motion.div
            className={className}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
            animate={{
                rotateY: [0, 360],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
            }}
        >
            {children}
        </motion.div>
    );
}

// Pulsing glow effect
export function PulseIcon({ children, className = '' }: IconWrapperProps) {
    return (
        <motion.div
            className={`relative ${className}`}
            animate={{
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {/* Glow layer */}
            <motion.div
                className="absolute inset-0 blur-xl opacity-50"
                animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scale: [0.9, 1.2, 0.9],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {children}
            </motion.div>
            {/* Main icon */}
            {children}
        </motion.div>
    );
}

// Mouse-tracking parallax effect
export function ParallaxIcon({ children, className = '' }: IconWrapperProps) {
    const [isHovered, setIsHovered] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 200 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) / rect.width);
        y.set((e.clientY - centerY) / rect.height);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={className}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                rotateX,
                rotateY,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.1 }}
        >
            {children}
        </motion.div>
    );
}

// Pre-built 3D Icon Components
interface Icon3DProps {
    size?: number;
    color?: string;
    className?: string;
    variant?: 'floating' | 'rotating' | 'pulse' | 'parallax';
}

function create3DIcon(Icon: LucideIcon, defaultColor: string) {
    return function Icon3D({
        size = 48,
        color = defaultColor,
        className = '',
        variant = 'floating'
    }: Icon3DProps) {
        const iconElement = (
            <Icon
                size={size}
                className={`drop-shadow-2xl ${className}`}
                style={{ color }}
            />
        );

        switch (variant) {
            case 'rotating':
                return <RotatingIcon>{iconElement}</RotatingIcon>;
            case 'pulse':
                return <PulseIcon>{iconElement}</PulseIcon>;
            case 'parallax':
                return <ParallaxIcon>{iconElement}</ParallaxIcon>;
            case 'floating':
            default:
                return <FloatingIcon>{iconElement}</FloatingIcon>;
        }
    };
}

// Export pre-built 3D icons
export const RocketIcon3D = create3DIcon(Rocket, '#8b5cf6');
export const CompassIcon3D = create3DIcon(Compass, '#3b82f6');
export const TrophyIcon3D = create3DIcon(Trophy, '#f59e0b');
export const TargetIcon3D = create3DIcon(Target, '#ef4444');
export const BrainIcon3D = create3DIcon(Brain, '#ec4899');
export const ChartIcon3D = create3DIcon(TrendingUp, '#10b981');
export const SparklesIcon3D = create3DIcon(Sparkles, '#06b6d4');
export const ZapIcon3D = create3DIcon(Zap, '#eab308');

// Background decoration component with multiple floating icons
export function FloatingIconsBackground() {
    const icons = [
        { Icon: RocketIcon3D, top: '10%', left: '10%', delay: 0 },
        { Icon: CompassIcon3D, top: '20%', right: '15%', delay: 1 },
        { Icon: TrophyIcon3D, bottom: '15%', left: '20%', delay: 2 },
        { Icon: TargetIcon3D, top: '60%', right: '10%', delay: 1.5 },
        { Icon: BrainIcon3D, bottom: '25%', right: '25%', delay: 0.5 },
        { Icon: SparklesIcon3D, top: '40%', left: '5%', delay: 2.5 },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
            {icons.map((item, index) => {
                const { Icon, delay, ...position } = item;
                return (
                    <motion.div
                        key={index}
                        className="absolute"
                        style={position}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.3, scale: 1 }}
                        transition={{ delay, duration: 1 }}
                    >
                        <Icon size={64} variant="floating" />
                    </motion.div>
                );
            })}
        </div>
    );
}
