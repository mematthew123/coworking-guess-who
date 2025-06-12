/* eslint-disable react/no-unescaped-entities */
'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Community Formation Animation Component
const CommunityAvatars = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [phase, setPhase] = useState<
        'scattered' | 'searching' | 'connecting' | 'community'
    >('scattered');
    const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 }); // Default values for SSR
    const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);
    const connectionRefs = useRef<(SVGElement | null)[]>([]);

    // Avatar data with personality traits
    const avatars = [
        {
            id: 1,
            emoji: '👨‍💻',
            role: 'Developer',
            gradient: 'from-primary-400 to-primary-600',
        },
        {
            id: 2,
            emoji: '👩‍🎨',
            role: 'Designer',
            gradient: 'from-secondary-400 to-secondary-600',
        },
        {
            id: 3,
            emoji: '👨‍💼',
            role: 'Manager',
            gradient: 'from-accent-400 to-accent-600',
        },
        {
            id: 4,
            emoji: '👩‍🏫',
            role: 'Teacher',
            gradient: 'from-primary-300 to-primary-500',
        },
        {
            id: 5,
            emoji: '👨‍🔬',
            role: 'Researcher',
            gradient: 'from-secondary-300 to-secondary-500',
        },
        {
            id: 6,
            emoji: '👩‍💻',
            role: 'Engineer',
            gradient: 'from-accent-300 to-accent-500',
        },
        {
            id: 7,
            emoji: '👨‍🎤',
            role: 'Creative',
            gradient: 'from-secondary-400 to-primary-400',
        },
        {
            id: 8,
            emoji: '👩‍⚕️',
            role: 'Consultant',
            gradient: 'from-primary-400 to-accent-400',
        },
    ];

    const setAvatarRef = (index: number) => (el: HTMLDivElement | null) => {
        avatarRefs.current[index] = el;
    };

    const setConnectionRef = (index: number) => (el: SVGElement | null) => {
        connectionRefs.current[index] = el;
    };

    // Update window size on mount and resize
    useEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Set initial size
        updateWindowSize();

        // Add resize listener
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create a story-based animation timeline
        const storyTimeline = gsap.timeline({
            repeat: -1,
            onRepeat: () => setPhase('scattered'),
        });

        // Phase 1: Scattered & Alone (0-3s)
        storyTimeline
            .set(avatarRefs.current, {
                scale: 0,
                opacity: 0,
            })
            .to(avatarRefs.current, {
                scale: 1,
                opacity: 0.3,
                duration: 0.5,
                stagger: {
                    each: 0.1,
                    from: 'random',
                },
                onComplete: () => setPhase('scattered'),
            })
            .to(avatarRefs.current, {
                x: () => gsap.utils.random(-400, 400),
                y: () => gsap.utils.random(-300, 300),
                rotation: () => gsap.utils.random(-180, 180),
                duration: 2,
                ease: 'power1.inOut',
            });

        // Phase 2: Searching (3-6s)
        storyTimeline
            .to('.avatar-emoji', {
                scale: 1.2,
                duration: 0.3,
                stagger: 0.1,
                yoyo: true,
                repeat: 3,
                onStart: () => setPhase('searching'),
            })
            .to(
                avatarRefs.current,
                {
                    x: (index) => Math.cos(index * 0.8) * 200,
                    y: (index) => Math.sin(index * 0.8) * 200,
                    rotation: 0,
                    opacity: 0.5,
                    duration: 2,
                    ease: 'power2.inOut',
                },
                '-=1',
            );

        // Phase 3: First Connections (6-9s)
        storyTimeline
            .to(
                avatarRefs.current.filter((_, i) => i % 2 === 0),
                {
                    x: (index) => index * 80 - 200,
                    y: -50,
                    opacity: 0.7,
                    duration: 1.5,
                    ease: 'power2.inOut',
                    onStart: () => setPhase('connecting'),
                },
            )
            .to(
                avatarRefs.current.filter((_, i) => i % 2 === 1),
                {
                    x: (index) => index * 80 - 160,
                    y: 50,
                    opacity: 0.7,
                    duration: 1.5,
                    ease: 'power2.inOut',
                },
                '-=1.5',
            )
            .to(connectionRefs.current, {
                opacity: 0.3,
                scale: 1,
                duration: 0.5,
                stagger: 0.1,
            });

        // Phase 4: Community Forms (9-12s)
        storyTimeline
            .to(avatarRefs.current, {
                x: (index) => {
                    const angle = (index / avatars.length) * Math.PI * 2;
                    return Math.cos(angle) * 150;
                },
                y: (index) => {
                    const angle = (index / avatars.length) * Math.PI * 2;
                    return Math.sin(angle) * 150;
                },
                scale: 1.1,
                opacity: 0.4,
                duration: 2,
                ease: 'back.out(1.7)',
                onStart: () => setPhase('community'),
            })
            .to(
                '.community-center',
                {
                    scale: 1,
                    opacity: 0.3,
                    duration: 1,
                },
                '-=1',
            )
            .to(avatarRefs.current, {
                scale: 1.2,
                duration: 0.5,
                yoyo: true,
                repeat: 1,
                stagger: {
                    each: 0.05,
                    from: 'center',
                },
            });

        // Add continuous rotation in community phase
        gsap.to('.community-ring', {
            rotation: 360,
            duration: 30,
            ease: 'none',
            repeat: -1,
        });

        return () => {
            storyTimeline.kill();
        };
    }, [avatars.length]);

    // Mouse interaction for avatar magnetism
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            avatarRefs.current.forEach((avatar) => {
                if (!avatar) return;

                const rect = avatar.getBoundingClientRect();
                const avatarX = rect.left + rect.width / 2;
                const avatarY = rect.top + rect.height / 2;

                const distX = e.clientX - avatarX;
                const distY = e.clientY - avatarY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < 200) {
                    const force = (1 - distance / 200) * 20;
                    const pushX = (distX / distance) * force;
                    const pushY = (distY / distance) * force;

                    gsap.to(avatar, {
                        x: `+=${pushX}`,
                        y: `+=${pushY}`,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className='absolute inset-0 pointer-events-none overflow-hidden'
        >
            {/* Community center (appears in final phase) */}
            <div className='community-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 scale-0 opacity-0'>
                <div className='w-full h-full rounded-full bg-gradient-to-br from-primary-400/20 to-secondary-400/20 flex items-center justify-center'>
                    <span className='text-4xl'>🤝</span>
                </div>
            </div>

            {/* Connection lines SVG */}
            <svg className='absolute inset-0 w-full h-full'>
                {avatars.map((_, index) => (
                    <g
                        key={`connection-${index}`}
                        ref={setConnectionRef(index)}
                        className='opacity-0 scale-0'
                    >
                        {avatars.slice(index + 1).map((_, j) => {
                            const actualJ = index + j + 1;
                            const angle1 =
                                (index / avatars.length) * Math.PI * 2;
                            const angle2 =
                                (actualJ / avatars.length) * Math.PI * 2;
                            const x1 =
                                windowSize.width / 2 + Math.cos(angle1) * 150;
                            const y1 =
                                windowSize.height / 2 + Math.sin(angle1) * 150;
                            const x2 =
                                windowSize.width / 2 + Math.cos(angle2) * 150;
                            const y2 =
                                windowSize.height / 2 + Math.sin(angle2) * 150;

                            return (
                                <line
                                    key={`line-${index}-${actualJ}`}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke='url(#gradient)'
                                    strokeWidth='1'
                                    strokeDasharray='5,5'
                                />
                            );
                        })}
                    </g>
                ))}
                <defs>
                    <linearGradient
                        id='gradient'
                        x1='0%'
                        y1='0%'
                        x2='100%'
                        y2='100%'
                    >
                        <stop
                            offset='0%'
                            stopColor='rgb(96, 165, 250)'
                            stopOpacity='0.3'
                        />
                        <stop
                            offset='50%'
                            stopColor='rgb(244, 114, 182)'
                            stopOpacity='0.3'
                        />
                        <stop
                            offset='100%'
                            stopColor='rgb(96, 165, 250)'
                            stopOpacity='0.3'
                        />
                    </linearGradient>
                </defs>
            </svg>

            {/* Avatar ring container */}
            <div className='community-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                {avatars.map((avatar, index) => (
                    <div
                        key={avatar.id}
                        ref={setAvatarRef(index)}
                        className='community-avatar absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
                    >
                        {/* Avatar bubble */}
                        <div
                            className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${avatar.gradient} shadow-lg transform transition-all duration-300`}
                        >
                            <div className='avatar-emoji absolute inset-0 flex items-center justify-center text-3xl'>
                                {avatar.emoji}
                            </div>

                            {/* Role label */}
                            <div
                                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap transition-opacity duration-300 ${
                                    phase === 'community'
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                }`}
                            >
                                {avatar.role}
                            </div>

                            {/* Pulse effect */}
                            {phase === 'searching' && (
                                <div className='absolute inset-0 rounded-full bg-white/30 animate-ping' />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Phase indicator */}
            <div className='absolute bottom-10 left-1/2 -translate-x-1/2 text-center'>
                <div className='text-sm font-medium text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full'>
                    {phase === 'scattered' && '🔍 Looking for community...'}
                    {phase === 'searching' && '👀 Discovering others...'}
                    {phase === 'connecting' && '🤝 Making connections...'}
                    {phase === 'community' && '🎉 Community formed!'}
                </div>
            </div>
        </div>
    );
};

const HeroSection = () => {
    const { isSignedIn } = useUser();
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Hero text animation
        if (titleRef.current && subtitleRef.current) {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Split text animation
            const titleWords = titleRef.current.textContent?.split(' ') || [];
            titleRef.current.innerHTML = titleWords
                .map((word) => `<span class="inline-block">${word}</span>`)
                .join(' ');

            tl.fromTo(
                titleRef.current.querySelectorAll('span'),
                { y: 100, opacity: 0, rotateX: -90 },
                { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.1 },
            );

            tl.fromTo(
                subtitleRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                '-=0.4',
            );
        }

        // CTA animation
        if (ctaRef.current) {
            gsap.fromTo(
                ctaRef.current.children,
                { y: 50, opacity: 0, scale: 0.8 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    delay: 1,
                    ease: 'back.out(1.7)',
                },
            );
        }

        // Features animation
        if (featuresRef.current) {
            gsap.fromTo(
                featuresRef.current.children,
                { y: 100, opacity: 0, rotateY: -30 },
                {
                    y: 0,
                    opacity: 1,
                    rotateY: 0,
                    duration: 1,
                    stagger: 0.2,
                    delay: 1.5,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: featuresRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                    },
                },
            );
        }
    }, []);

    return (
        <section className='relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50'>
            {/* Background Pattern */}
            <div className='absolute inset-0 bg-hero-pattern opacity-10'></div>

            {/* Community Avatars Animation */}
            <CommunityAvatars />

            {/* Main Content */}
            <div className='relative z-10 container mx-auto px-4 text-center'>
                <div className='max-w-4xl mx-auto'>
                    {/* Badge */}
                    <div className='inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8'>
                        <span className='mr-2'>🎯</span>
                        <span>The Ultimate Coworking Community Game</span>
                    </div>

                    {/* Main Heading */}
                    <h1
                        ref={titleRef}
                        className='text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6'
                    >
                        Guess Who? Coworking Edition
                    </h1>

                    {/* Gradient text */}
                    <div className='mb-6'>
                        <span className='text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600'>
                            Connect • Play • Discover
                        </span>
                    </div>

                    {/* Subheading */}
                    <p
                        ref={subtitleRef}
                        className='text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed'
                    >
                        Connect with your coworking community through a fun,
                        interactive game.
                    </p>

                    {/* CTA Buttons */}
                    <div
                        ref={ctaRef}
                        className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'
                    >
                        {isSignedIn ? (
                            <>
                                <Link
                                    href='/games'
                                    className='group relative px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden'
                                >
                                    <span className='relative z-10'>
                                        Find an Opponent
                                    </span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
                                </Link>
                                <Link
                                    href='/dashboard'
                                    className='px-8 py-4 bg-white text-primary-600 font-semibold rounded-full border-2 border-primary-600 hover:bg-primary-50 transform hover:scale-105 transition-all duration-200'
                                >
                                    Go to Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href='/sign-up'
                                    className='group relative px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden'
                                >
                                    <span className='relative z-10'>
                                        Start Playing Now
                                    </span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
                                </Link>
                                <Link
                                    href='/sign-in'
                                    className='px-8 py-4 bg-white text-primary-600 font-semibold rounded-full border-2 border-primary-600 hover:bg-primary-50 transform hover:scale-105 transition-all duration-200'
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Animated Wave SVG */}
            <div className='absolute bottom-0 left-0 w-full'>
                <svg
                    className='w-full h-24 fill-current text-white'
                    viewBox='0 0 1440 100'
                    preserveAspectRatio='none'
                >
                    <path d='M0,50 C360,0 720,100 1440,50 L1440,100 L0,100 Z'></path>
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;
