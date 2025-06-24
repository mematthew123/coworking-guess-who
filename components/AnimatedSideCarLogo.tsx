'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedSideCarLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'watermark' | 'solid' | 'outline';
    animated?: boolean;
    className?: string;
}

export const AnimatedSideCarLogo = ({ 
    size = 'lg', 
    variant = 'watermark',
    animated = true,
    className = ''
}: AnimatedSideCarLogoProps) => {
    const logoRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const sizes = {
        sm: { container: 'w-32 h-32', theText: 'text-sm', sidecarText: 'text-2xl' },
        md: { container: 'w-64 h-64', theText: 'text-2xl', sidecarText: 'text-4xl' },
        lg: { container: 'w-96 h-96', theText: 'text-4xl', sidecarText: 'text-6xl' },
        xl: { container: 'w-[600px] h-[600px]', theText: 'text-6xl', sidecarText: 'text-8xl' },
    };

    const variants = {
        watermark: {
            borderColor: 'border-[var(--color-gold-300)]',
            textColor: 'text-[var(--color-gold-400)]',
            opacity: 'opacity-15',
            borderWidth: 'border-4',
        },
        solid: {
            borderColor: 'border-[var(--color-sidecar-gold)]',
            textColor: 'text-[var(--color-sidecar-gold)]',
            opacity: 'opacity-100',
            borderWidth: 'border-8',
        },
        outline: {
            borderColor: 'border-[var(--color-gold-500)]',
            textColor: 'text-[var(--color-gold-600)]',
            opacity: 'opacity-50',
            borderWidth: 'border-2',
        },
    };

    useEffect(() => {
        if (!animated || !logoRef.current) return;

        const tl = gsap.timeline({ delay: 0.3 });

        // Initial entrance animation
        tl.fromTo(
            logoRef.current,
            {
                scale: 0,
                rotate: -360,
                opacity: 0,
            },
            {
                scale: 1,
                rotate: 0,
                opacity: 1,
                duration: 1.5,
                ease: 'back.out(1.2)',
            }
        );

        // Animate inner circle
        if (innerRef.current) {
            tl.fromTo(
                innerRef.current,
                {
                    scale: 0,
                    opacity: 0,
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                },
                '-=0.5' // Overlap with previous animation
            );
        }

        // Animate text
        if (textRef.current) {
            tl.fromTo(
                textRef.current.children,
                {
                    y: 30,
                    opacity: 0,
                    rotateX: -90,
                },
                {
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'power3.out',
                },
                '-=0.3'
            );
        }

        // Add continuous subtle animations
        if (variant === 'watermark') {
            // Floating animation for watermark
            gsap.to(logoRef.current, {
                y: '+=30',
                duration: 6,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: 2,
            });

            // Subtle rotation
            gsap.to(logoRef.current, {
                rotate: '+=5',
                duration: 8,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: 2.5,
            });
        }

    }, [animated, variant]);

    return (
        <div 
            ref={logoRef}
            className={`relative ${sizes[size].container} ${variants[variant].opacity} ${className}`}
        >
            {/* Outer circle */}
            <div className={`w-full h-full rounded-full ${variants[variant].borderWidth} ${variants[variant].borderColor} flex items-center justify-center relative bg-[var(--color-sidecar-cream)]/5`}>
                
                {/* Inner decorative circle */}
                <div 
                    ref={innerRef}
                    className={`absolute inset-6 rounded-full border-2 ${variants[variant].borderColor} opacity-50`} 
                />
                
                {/* Second inner circle for depth */}
                {size === 'xl' && (
                    <div className={`absolute inset-12 rounded-full border ${variants[variant].borderColor} opacity-30`} />
                )}
                
                {/* Logo text */}
                <div ref={textRef} className='text-center z-10'>
                    <div className={`font-script ${sizes[size].theText} ${variants[variant].textColor} mb-2 italic`}>
                        The
                    </div>
                    <div className={`font-heading ${sizes[size].sidecarText} font-bold ${variants[variant].textColor} tracking-[0.3em] uppercase`}>
                        SIDECAR
                    </div>
                </div>
                
                {/* Animated ring (only for lg and xl sizes) */}
                {(size === 'lg' || size === 'xl') && animated && (
                    <svg className='absolute inset-0 w-full h-full animate-rotate pointer-events-none' style={{ animationDuration: '30s' }}>
                        <circle
                            cx='50%'
                            cy='50%'
                            r='48%'
                            fill='none'
                            stroke={variant === 'watermark' ? 'var(--color-gold-300)' : 'var(--color-sidecar-gold)'}
                            strokeWidth='1'
                            strokeDasharray='5 15'
                            opacity='0.3'
                        />
                        <circle
                            cx='50%'
                            cy='50%'
                            r='46%'
                            fill='none'
                            stroke={variant === 'watermark' ? 'var(--color-gold-400)' : 'var(--color-gold-600)'}
                            strokeWidth='0.5'
                            strokeDasharray='2 8'
                            opacity='0.2'
                            style={{ animationDirection: 'reverse' }}
                        />
                    </svg>
                )}
                
                {/* Corner accents for solid variant */}
                {variant === 'solid' && (
                    <>
                        <div className='absolute top-4 right-4 w-2 h-2 bg-[var(--color-sidecar-gold)] rounded-full' />
                        <div className='absolute bottom-4 left-4 w-2 h-2 bg-[var(--color-sidecar-gold)] rounded-full' />
                        <div className='absolute top-4 left-4 w-2 h-2 bg-[var(--color-sidecar-gold)] rounded-full' />
                        <div className='absolute bottom-4 right-4 w-2 h-2 bg-[var(--color-sidecar-gold)] rounded-full' />
                    </>
                )}
            </div>
        </div>
    );
};