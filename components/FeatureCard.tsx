'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface FeatureProps {
    feature: {
        icon: string;
        title: string;
        description: string;
        bgColor: string;
        borderGradient: string;
        delay: number;
        highlight?: string;
    };
    index: number;
}

export const FeatureCard = ({ feature }: FeatureProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        // Detect touch device
        setIsTouchDevice(
            'ontouchstart' in window || navigator.maxTouchPoints > 0,
        );
    }, []);

    useEffect(() => {
        if (!cardRef.current || !iconRef.current) return;

        const card = cardRef.current;
        const icon = iconRef.current;

        // Only apply hover animations on non-touch devices
        if (!isTouchDevice) {
            const handleMouseEnter = () => {
                gsap.to(card, {
                    y: -8,
                    duration: 0.3,
                    ease: 'power2.out',
                });

                gsap.to(icon, {
                    scale: 1.2,
                    rotate: 15,
                    duration: 0.3,
                    ease: 'back.out(1.7)',
                });
            };

            const handleMouseLeave = () => {
                gsap.to(card, {
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                });

                gsap.to(icon, {
                    scale: 1,
                    rotate: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            };

            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);

            // Cleanup
            return () => {
                card.removeEventListener('mouseenter', handleMouseEnter);
                card.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, [isTouchDevice]);

    useEffect(() => {
        if (!cardRef.current) return;

        const card = cardRef.current;

        // Simplified animation for mobile
        const isMobile = window.innerWidth < 768;

        gsap.fromTo(
            card,
            {
                y: isMobile ? 30 : 50,
                opacity: 0,
                rotateY: isMobile ? 0 : -45, // Disable 3D rotation on mobile
            },
            {
                y: 0,
                opacity: 1,
                rotateY: 0,
                duration: isMobile ? 0.6 : 0.8,
                delay: feature.delay,
                ease: 'power3.out',
            },
        );
    }, [feature.delay]);

    return (
        <div
            ref={cardRef}
            className={`feature-card relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl ${feature.bgColor} backdrop-blur-sm group cursor-pointer transition-all duration-300 border border-[var(--color-gold-200)] hover:border-[var(--color-sidecar-gold)] ${
                isTouchDevice ? 'active:scale-[0.98]' : ''
            }`}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
        >
            {/* Highlight Badge - Responsive */}
            {feature.highlight && (
                <div className='absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-[var(--color-sidecar-gold)] text-[var(--color-sidecar-cream)] text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md font-heading uppercase tracking-wider'>
                    {feature.highlight}
                </div>
            )}

            {/* Gradient Border Effect */}
            <div
                className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.borderGradient} opacity-0 ${
                    !isTouchDevice
                        ? 'group-hover:opacity-20'
                        : 'group-active:opacity-20'
                } transition-opacity duration-500`}
            ></div>

            {/* Icon Container - Responsive */}
            <div
                ref={iconRef}
                className='relative z-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 mx-auto flex items-center justify-center text-2xl sm:text-3xl md:text-4xl bg-[var(--color-sidecar-white)] rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300'
            >
                {feature.icon}
            </div>

            {/* Content - Responsive */}
            <h3 className='relative z-10 text-lg sm:text-xl font-bold text-[var(--color-sidecar-black)] mb-2 sm:mb-3 font-heading text-center'>
                {feature.title}
            </h3>
            <p className='relative z-10 text-sm sm:text-base text-[var(--color-sidecar-gray)] leading-relaxed text-center'>
                {feature.description}
            </p>

            {/* Hover Glow Effect */}
            {!isTouchDevice && (
                <div className='absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
                    <div className='absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--color-gold-300)]/10 to-transparent'></div>
                </div>
            )}

            {/* Bottom Accent Line */}
            <div
                className={`absolute bottom-0 left-4 right-4 sm:left-6 sm:right-6 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-sidecar-gold)] to-transparent opacity-0 ${
                    !isTouchDevice ? 'group-hover:opacity-50' : ''
                } transition-opacity duration-500`}
            ></div>
        </div>
    );
};

// Demo Component to show the responsive grid
export default function FeatureCardDemo() {
    const features = [
        {
            icon: '🚀',
            title: 'Fast Performance',
            description: 'Optimized for speed and efficiency on all devices',
            bgColor: 'bg-purple-50',
            borderGradient: 'from-purple-400 to-pink-400',
            delay: 0.1,
            highlight: 'NEW',
        },
        {
            icon: '🎨',
            title: 'Beautiful Design',
            description: 'Stunning visuals that adapt to any screen size',
            bgColor: 'bg-blue-50',
            borderGradient: 'from-blue-400 to-cyan-400',
            delay: 0.2,
        },
        {
            icon: '📱',
            title: 'Mobile First',
            description: 'Built with mobile users in mind from the ground up',
            bgColor: 'bg-green-50',
            borderGradient: 'from-green-400 to-emerald-400',
            delay: 0.3,
        },
        {
            icon: '⚡',
            title: 'Lightning Fast',
            description: 'Instant loading times for better user experience',
            bgColor: 'bg-yellow-50',
            borderGradient: 'from-yellow-400 to-orange-400',
            delay: 0.4,
            highlight: 'HOT',
        },
    ];

    return (
        <div className='min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8'>
            <div className='max-w-7xl mx-auto'>
                <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12'>
                    Responsive Feature Cards
                </h1>

                {/* Responsive Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
