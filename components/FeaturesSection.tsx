'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FeatureCard } from './FeatureCard';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const FeaturesSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    // Simple count-up effect
    const animateNumber = (
        element: HTMLElement,
        target: number,
        duration: number,
    ) => {
        const start = 0;
        const increment = target / (duration * 60); // 60fps
        let current = start;

        const update = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toString();
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toString();
            }
        };

        update();
    };

    useEffect(() => {
        // Harsh title animation
        if (titleRef.current) {
            gsap.fromTo(
                titleRef.current,
                {
                    y: -50,
                    opacity: 0,
                    skewY: -5,
                },
                {
                    y: 0,
                    opacity: 1,
                    skewY: 0,
                    duration: 0.3,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: 'top 80%',
                    },
                },
            );
        }

        // Subtitle slam effect
        if (subtitleRef.current) {
            gsap.fromTo(
                subtitleRef.current,
                {
                    scale: 1.5,
                    opacity: 0,
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.2,
                    delay: 0.2,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: subtitleRef.current,
                        start: 'top 85%',
                    },
                },
            );
        }

        // Stats boxes slam in
        if (statsRef.current) {
            const statsElements =
                statsRef.current.querySelectorAll('.stat-box');
            statsElements.forEach((el, index) => {
                gsap.fromTo(
                    el,
                    {
                        x: index % 2 === 0 ? -100 : 100,
                        opacity: 0,
                        rotate: index % 2 === 0 ? -10 : 10,
                    },
                    {
                        x: 0,
                        opacity: 1,
                        rotate: 0,
                        duration: 0.3,
                        delay: index * 0.1,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: statsRef.current,
                            start: 'top 85%',
                        },
                        onComplete: () => {
                            // Animate numbers
                            const numberEl = el.querySelector('.stat-number');
                            if (numberEl) {
                                const target = parseInt(
                                    numberEl.getAttribute('data-target') || '0',
                                );
                                animateNumber(
                                    numberEl as HTMLElement,
                                    target,
                                    1.5,
                                );
                            }
                        },
                    },
                );
            });
        }

        // Feature cards harsh entrance
        if (containerRef.current) {
            const cards = containerRef.current.querySelectorAll(
                '.brutalist-feature-card',
            );
            cards.forEach((card, index) => {
                gsap.fromTo(
                    card,
                    {
                        scale: 0,
                        rotate: index % 2 === 0 ? -15 : 15,
                    },
                    {
                        scale: 1,
                        rotate: index % 2 === 0 ? -2 : 2,
                        duration: 0.2,
                        delay: index * 0.05,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top 75%',
                        },
                    },
                );
            });
        }
    }, []);

    const features = [
        {
            icon: '🎮',
            title: 'INSTANT GAMES',
            description:
                'REAL-TIME WEBSOCKET ACTION. NO LAG. NO WAITING. JUST PURE GAMING.',
            color: 'bg-yellow',
            highlight: 'HOT!',
        },
        {
            icon: '💬',
            title: 'TRASH TALK',
            description:
                'BUILT-IN CHAT FOR MAXIMUM BANTER AND STRATEGIC WARFARE.',
            color: 'bg-pink',
        },
        {
            icon: '👥',
            title: 'REAL PEOPLE',
            description:
                'PLAY WITH ACTUAL COWORKERS. NO BOTS. NO FAKE PROFILES.',
            color: 'bg-blue',
        },
        {
            icon: '⚡',
            title: 'LIVE STATUS',
            description:
                "SEE WHO'S ONLINE. SEE WHO'S PLAYING. SEE WHO'S SCARED.",
            color: 'bg-green',
        },
        {
            icon: '📊',
            title: 'TRACK WINS',
            description: 'DETAILED STATS. MOVE HISTORY. BECOME A LEGEND.',
            color: 'bg-orange',
        },
        {
            icon: '🔐',
            title: 'YOUR DATA',
            description: 'CONTROL YOUR PROFILE. HIDE YOUR SECRETS. PLAY SAFE.',
            color: 'bg-purple',
        },
        {
            icon: '🎯',
            title: 'BIG BRAIN',
            description:
                'BOOLEAN LOGIC. DEDUCTION. STRATEGY. OUTSMART EVERYONE.',
            color: 'bg-red',
        },
        {
            icon: '🌐',
            title: 'ANYWHERE',
            description: 'DESKTOP. MOBILE. TABLET. PLAY FROM YOUR COUCH.',
            color: 'bg-mint',
        },
    ];

    return (
        <section className='py-24 bg-cream relative overflow-hidden'>
            {/* Brutalist geometric background */}
            <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute top-20 left-10 w-64 h-64 bg-yellow border-8 border-black rotate-12' />
                <div className='absolute bottom-10 right-20 w-48 h-48 bg-pink border-8 border-black -rotate-6' />
                <div className='absolute top-1/2 left-1/4 w-32 h-96 bg-blue border-8 border-black rotate-45' />
                <div className='absolute bottom-1/3 right-1/3 w-56 h-56 bg-green border-8 border-black -rotate-12' />
            </div>

            <div className='container mx-auto px-4 relative z-10'>
                {/* Stats Bar */}
                <div
                    ref={statsRef}
                    className='grid grid-cols-3 gap-8 max-w-4xl mx-auto mb-20'
                >
                    <div className='stat-box relative'>
                        <div className='bg-pink border-8 border-black p-8 shadow-brutal-lg transform -rotate-2 hover:rotate-0 transition-transform duration-100'>
                            <div className='text-6xl font-black text-black'>
                                <span className='stat-number' data-target='250'>
                                    0
                                </span>
                                +
                            </div>
                            <p className='text-black font-black uppercase mt-2'>
                                MEMBERS
                            </p>
                            <p className='text-xs font-bold uppercase'>
                                READY TO PLAY
                            </p>
                        </div>
                    </div>
                    <div className='stat-box relative'>
                        <div className='bg-yellow border-8 border-black p-8 shadow-brutal-lg transform rotate-1 hover:rotate-0 transition-transform duration-100'>
                            <div className='text-6xl font-black text-black'>
                                <span className='stat-number' data-target='800'>
                                    0
                                </span>
                                +
                            </div>
                            <p className='text-black font-black uppercase mt-2'>
                                GAMES
                            </p>
                            <p className='text-xs font-bold uppercase'>
                                COMPLETED
                            </p>
                        </div>
                    </div>
                    <div className='stat-box relative'>
                        <div className='bg-green border-8 border-black p-8 shadow-brutal-lg transform -rotate-1 hover:rotate-0 transition-transform duration-100'>
                            <div className='text-6xl font-black text-black'>
                                <span
                                    className='stat-number'
                                    data-target='1200'
                                >
                                    0
                                </span>
                                +
                            </div>
                            <p className='text-black font-black uppercase mt-2'>
                                CONNECTIONS
                            </p>
                            <p className='text-xs font-bold uppercase'>MADE</p>
                        </div>
                    </div>
                </div>

                <div className='text-center mb-20'>
                    <h2
                        ref={titleRef}
                        className='text-6xl md:text-8xl font-black uppercase mb-6 transform -rotate-1'
                    >
                        <span className='inline-block bg-blue text-white px-4 py-2 border-8 border-black shadow-brutal-xl'>
                            FEATURES
                        </span>
                    </h2>
                    <p
                        ref={subtitleRef}
                        className='text-2xl font-black uppercase bg-white border-6 border-black p-6 inline-block transform rotate-1 shadow-brutal-md max-w-3xl'
                    >
                        NOT YOUR AVERAGE OFFICE GAME. THIS IS{' '}
                        <span className='text-pink'>WAR.</span>
                    </p>
                </div>

                <div
                    ref={containerRef}
                    className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'
                >
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>

                {/* Brutalist CTA */}
                <div className='text-center mt-20'>
                    <div className='inline-block'>
                        <div className='bg-black text-yellow border-8 border-yellow px-12 py-8 font-black uppercase text-2xl shadow-brutal-xl transform -rotate-2 hover:rotate-0 transition-transform duration-100 cursor-pointer'>
                            <span className='flex items-center gap-4'>
                                🚀 JOIN THE REVOLUTION
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
