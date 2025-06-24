'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStaggerAnimation, useCountUp } from '@/hooks/animations';
import { FeatureCard } from './FeatureCard';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const FeaturesSection = () => {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const containerRef = useStaggerAnimation(
        '.feature-card',
        {
            y: 0,
            rotateY: 0,
            opacity: 1,
        },
        {
            amount: isMobile ? 0.1 : 0.15,
            from: 'start',
        },
    );

    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    // Count-up animations for statistics
    const membersCountRef = useCountUp(150, 2.5);
    const connectionsCountRef = useCountUp(500, 2.2);
    const eventsCountRef = useCountUp(75, 2.8);

    useEffect(() => {
        // Animate title with responsive effects
        if (titleRef.current) {
            const text = titleRef.current.textContent || '';
            const words = text.split(' ');
            titleRef.current.innerHTML = words
                .map(
                    (word) =>
                        `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`,
                )
                .join(' ');

            const wordSpans = titleRef.current.querySelectorAll('span span');

            gsap.fromTo(
                wordSpans,
                {
                    y: isMobile ? 50 : 100,
                    opacity: 0,
                    rotationX: isMobile ? 0 : -90, // Disable 3D rotation on mobile
                },
                {
                    y: 0,
                    opacity: 1,
                    rotationX: 0,
                    stagger: isMobile ? 0.05 : 0.08,
                    duration: isMobile ? 0.8 : 1,
                    ease: 'back.out(1.2)',
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: 'top 80%',
                    },
                },
            );
        }

        // Animate subtitle - simplified for mobile
        if (subtitleRef.current) {
            const text = subtitleRef.current.textContent || '';
            
            if (isMobile) {
                // Simple fade-in on mobile
                gsap.fromTo(
                    subtitleRef.current,
                    {
                        opacity: 0,
                        y: 20,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        delay: 0.5,
                        scrollTrigger: {
                            trigger: subtitleRef.current,
                            start: 'top 85%',
                        },
                    },
                );
            } else {
                // Typewriter effect on desktop
                subtitleRef.current.textContent = '';
                gsap.fromTo(
                    subtitleRef.current,
                    {
                        opacity: 0,
                    },
                    {
                        opacity: 1,
                        duration: 0.5,
                        delay: 0.8,
                        scrollTrigger: {
                            trigger: subtitleRef.current,
                            start: 'top 85%',
                        },
                        onComplete: () => {
                            let i = 0;
                            const typewriter = () => {
                                if (i < text.length && subtitleRef.current) {
                                    subtitleRef.current.textContent += text.charAt(i);
                                    i++;
                                    setTimeout(typewriter, 30);
                                }
                            };
                            typewriter();
                        },
                    },
                );
            }
        }

        // Animate stats with responsive entrance
        if (statsRef.current) {
            gsap.fromTo(
                statsRef.current.children,
                {
                    scale: 0,
                    opacity: 0,
                    rotateY: isMobile ? 0 : 180,
                },
                {
                    scale: 1,
                    opacity: 1,
                    rotateY: 0,
                    stagger: 0.2,
                    duration: isMobile ? 0.6 : 0.8,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: 'top 85%',
                    },
                },
            );
        }
    }, [isMobile]);

    const features = [
        {
            icon: '☕',
            title: 'Coffee & Connect',
            description:
                'Break the ice over virtual coffee breaks with fellow Side Car members through casual, fun gameplay',
            bgColor: 'bg-[var(--color-gold-50)]',
            borderGradient: 'from-[var(--color-gold-400)] to-[var(--color-gold-600)]',
            delay: 0,
            highlight: 'Member Favorite',
        },
        {
            icon: '🤝',
            title: 'Community Building',
            description:
                'Strengthen bonds within The Side Car community by discovering shared interests and experiences',
            bgColor: 'bg-[var(--color-gold-100)]',
            borderGradient: 'from-[var(--color-gold-500)] to-[var(--color-gold-700)]',
            delay: 0.1,
        },
        {
            icon: '💡',
            title: 'Entrepreneur Profiles',
            description:
                'Learn about your fellow innovators, creators, and doers through interactive character discovery',
            bgColor: 'bg-[var(--color-gold-50)]',
            borderGradient: 'from-[var(--color-gold-300)] to-[var(--color-gold-500)]',
            delay: 0.2,
        },
        {
            icon: '📍',
            title: 'Location-Based Play',
            description:
                'Connect with members from your preferred Side Car location or explore the entire network',
            bgColor: 'bg-[var(--color-gold-100)]',
            borderGradient: 'from-[var(--color-gold-400)] to-[var(--color-gold-600)]',
            delay: 0.3,
        },
        {
            icon: '🎯',
            title: 'Smart Matchmaking',
            description:
                'Get paired with members who share your schedule, interests, or collaboration goals',
            bgColor: 'bg-[var(--color-gold-50)]',
            borderGradient: 'from-[var(--color-gold-500)] to-[var(--color-gold-700)]',
            delay: 0.4,
        },
        {
            icon: '🏆',
            title: 'Community Challenges',
            description:
                'Participate in weekly challenges and earn recognition as a Side Car connection champion',
            bgColor: 'bg-[var(--color-gold-100)]',
            borderGradient: 'from-[var(--color-gold-300)] to-[var(--color-gold-500)]',
            delay: 0.5,
        },
        {
            icon: '🔐',
            title: 'Member Privacy',
            description:
                'Control what information you share while still engaging meaningfully with the community',
            bgColor: 'bg-[var(--color-gold-50)]',
            borderGradient: 'from-[var(--color-gold-400)] to-[var(--color-gold-600)]',
            delay: 0.6,
        },
        {
            icon: '🌟',
            title: 'Professional Networking',
            description:
                'Transform gameplay connections into real professional relationships and collaborations',
            bgColor: 'bg-[var(--color-gold-100)]',
            borderGradient: 'from-[var(--color-gold-500)] to-[var(--color-gold-700)]',
            delay: 0.7,
        },
    ];

    return (
        <section className='py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-[var(--color-sidecar-cream)] to-[var(--color-gold-50)] relative overflow-hidden'>
            {/* Responsive animated background elements */}
            <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-br from-[var(--color-gold-100)] to-[var(--color-gold-200)] rounded-full opacity-20 blur-3xl animate-pulse'></div>
                <div
                    className='absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-br from-[var(--color-gold-200)] to-[var(--color-gold-100)] rounded-full opacity-20 blur-3xl animate-pulse'
                    style={{ animationDelay: '1s' }}
                ></div>
                <div
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-br from-[var(--color-gold-100)] to-[var(--color-gold-300)] rounded-full opacity-15 blur-2xl animate-pulse'
                    style={{ animationDelay: '2s' }}
                ></div>
            </div>

            <div className='container mx-auto px-4 sm:px-6 relative z-10'>
                {/* Responsive Stats Bar */}
                <div
                    ref={statsRef}
                    className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20 text-center'
                >
                    <div className='group p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-[var(--color-sidecar-white)]/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--color-gold-200)]'>
                        <div className='text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-sidecar-gold)] group-hover:scale-110 transition-transform duration-300 font-heading'>
                            <span ref={membersCountRef}>0</span>+
                        </div>
                        <p className='text-sm sm:text-base text-[var(--color-sidecar-black)] mt-2 sm:mt-3 font-medium font-heading'>
                            Side Car Members
                        </p>
                        <p className='text-[10px] sm:text-xs text-[var(--color-sidecar-gray)] mt-1 hidden sm:block'>
                            entrepreneurs & innovators
                        </p>
                    </div>
                    <div className='group p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-[var(--color-sidecar-white)]/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--color-gold-200)]'>
                        <div className='text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-gold-600)] group-hover:scale-110 transition-transform duration-300 font-heading'>
                            <span ref={connectionsCountRef}>0</span>+
                        </div>
                        <p className='text-sm sm:text-base text-[var(--color-sidecar-black)] mt-2 sm:mt-3 font-medium font-heading'>
                            Connections Made
                        </p>
                        <p className='text-[10px] sm:text-xs text-[var(--color-sidecar-gray)] mt-1 hidden sm:block'>
                            through community games
                        </p>
                    </div>
                    <div className='group p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-[var(--color-sidecar-white)]/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--color-gold-200)]'>
                        <div className='text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-gold-700)] group-hover:scale-110 transition-transform duration-300 font-heading'>
                            <span ref={eventsCountRef}>0</span>+
                        </div>
                        <p className='text-sm sm:text-base text-[var(--color-sidecar-black)] mt-2 sm:mt-3 font-medium font-heading'>
                            Community Events
                        </p>
                        <p className='text-[10px] sm:text-xs text-[var(--color-sidecar-gray)] mt-1 hidden sm:block'>
                            enhanced with gameplay
                        </p>
                    </div>
                </div>

                <div className='text-center mb-12 sm:mb-16 md:mb-20'>
                    <h2
                        ref={titleRef}
                        className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-sidecar-black)] mb-4 sm:mb-6 font-heading px-2'
                    >
                        Built for The Side Car Community
                    </h2>
                    <p
                        ref={subtitleRef}
                        className='text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-sidecar-gray)] max-w-3xl mx-auto leading-relaxed px-4'
                    >
                        Where entrepreneurs, creators, and innovators connect through meaningful interactions and strategic gameplay
                    </p>
                </div>

                <div
                    ref={containerRef}
                    className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6'
                >
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>

                {/* Responsive Call to Action */}
                <div className='text-center mt-12 sm:mt-16 md:mt-20'>
                    <div className='inline-flex items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-[var(--color-sidecar-gold)] to-[var(--color-gold-600)] text-[var(--color-sidecar-cream)] text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer font-heading uppercase tracking-wider'>
                        <span className='mr-2 sm:mr-3'>☕</span>
                        <span className='hidden sm:inline'>Ready to connect with The Side Car community?</span>
                        <span className='sm:hidden'>Join The Side Car</span>
                    </div>
                </div>
            </div>
        </section>
    );
};