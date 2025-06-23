/* eslint-disable react/no-unescaped-entities */
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    useHeroTextAnimation,
    useFloatingAnimation,
    useElasticButton,
} from '@/hooks/animations';
import AnimatedWave from './AnimatedWave';
import { CommunityAvatars } from './CommunityAvatars';
import { Feature3DCard } from './Feature3DCard';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

import { ParticleField } from './ParticleField';

const HeroSection = () => {
    const { isSignedIn } = useUser();
    const { titleRef, subtitleRef } = useHeroTextAnimation();
    const ctaRef = useRef<HTMLDivElement>(null);
    const badgeRef = useFloatingAnimation({ duration: 4, y: -10 });
    const logoRef = useRef<HTMLDivElement>(null);

    // Apply elastic button animation to CTA buttons
    const primaryButtonRef = useElasticButton<HTMLAnchorElement>({ delay: 1 });
    const secondaryButtonRef = useElasticButton<HTMLAnchorElement>({
        delay: 1.15,
    });

    // Add logo animation
    useEffect(() => {
        if (logoRef.current) {
            gsap.fromTo(
                logoRef.current,
                {
                    scale: 0,
                    rotate: -180,
                    opacity: 0,
                },
                {
                    scale: 1,
                    rotate: 0,
                    opacity: 0.1,
                    duration: 2,
                    ease: 'power3.out',
                    delay: 0.5,
                }
            );
        }
    }, []);

    return (
        <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-gold-50)] via-[var(--color-sidecar-cream)] to-[var(--color-gold-100)]'>
            {/* Multi-layer background effects */}
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--color-gold-100)] via-transparent to-transparent opacity-40' />
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[var(--color-gold-200)] via-transparent to-transparent opacity-30' />
                
                {/* Side Car Logo Watermark */}
                <div 
                    ref={logoRef}
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-0'
                >
                    <div className='w-full h-full rounded-full border-8 border-[var(--color-gold-200)] flex items-center justify-center'>
                        <div className='text-center'>
                            <div className='font-script text-6xl text-[var(--color-gold-300)] mb-2'>The</div>
                            <div className='font-heading text-8xl font-bold text-[var(--color-gold-300)] tracking-[0.2em]'>SIDECAR</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Particle system */}
            <ParticleField />

            {/* Community Avatars */}
            <CommunityAvatars />

            {/* Main Content */}
            <div className='relative z-10 container mx-auto px-4 text-center'>
                <div className='max-w-5xl mx-auto'>
                    {/* Floating Badge */}
                    <div
                        ref={badgeRef}
                        className='inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[var(--color-gold-100)] to-[var(--color-gold-200)] text-[var(--color-sidecar-black)] text-sm font-medium mb-8 shadow-lg backdrop-blur-sm border border-[var(--color-gold-300)]/30'
                    >
                        <span className='mr-2 text-lg animate-pulse'>☕</span>
                        <span className='font-heading'>Where Entrepreneurs Connect & Collaborate</span>
                        <span className='ml-2 px-2 py-1 bg-[var(--color-sidecar-gold)] text-[var(--color-sidecar-cream)] text-xs rounded-full animate-pulse uppercase font-heading tracking-wider'>
                            BETA
                        </span>
                    </div>

                    {/* Main Heading with gradient background */}
                    <div className='relative mb-6'>
                        <h1
                            ref={titleRef}
                            className='text-6xl md:text-7xl lg:text-8xl font-heading font-bold text-[var(--color-sidecar-black)] relative z-10'
                        >
                            Discover Your
                            <span className='block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-sidecar-gold)] to-[var(--color-gold-700)]'>
                                Community
                            </span>
                        </h1>
                        <div className='absolute inset-0 bg-gradient-to-r from-[var(--color-gold-400)]/10 to-[var(--color-gold-300)]/10 blur-3xl' />
                    </div>

                    {/* Animated gradient text */}
                    <div className='mb-8'>
                        <span className='text-4xl md:text-5xl lg:text-6xl font-script text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-700)] via-[var(--color-sidecar-gold)] to-[var(--color-gold-600)] animate-fade-in'>
                            The Side Car's Guess Who Game
                        </span>
                    </div>

                    {/* Subheading */}
                    <p
                        ref={subtitleRef}
                        className='text-xl md:text-2xl lg:text-3xl text-[var(--color-sidecar-gray)] mb-12 max-w-3xl mx-auto leading-relaxed'
                    >
                        Break the ice with fellow innovators, entrepreneurs, and creators 
                        in a fun, strategic game designed for The Side Car community
                    </p>

                    {/* Enhanced CTA Buttons */}
                    <div
                        ref={ctaRef}
                        className='flex flex-col sm:flex-row gap-6 justify-center items-center mb-20'
                    >
                        {isSignedIn ? (
                            <>
                                <Link
                                    href='/games'
                                    ref={primaryButtonRef}
                                    className='group relative px-10 py-5 bg-gradient-to-r from-[var(--color-sidecar-gold)] to-[var(--color-gold-600)] text-[var(--color-sidecar-cream)] font-bold rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden font-heading uppercase tracking-wider'
                                >
                                    <span className='relative z-10 flex items-center gap-2'>
                                        <span className='text-xl'>☕</span>
                                        Find a Side Car Member
                                        <span className='group-hover:translate-x-1 transition-transform'>
                                            →
                                        </span>
                                    </span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-[var(--color-gold-600)] to-[var(--color-gold-700)] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                                </Link>
                                <Link
                                    href='/dashboard'
                                    ref={secondaryButtonRef}
                                    className='group px-10 py-5 bg-[var(--color-sidecar-white)]/90 backdrop-blur-sm text-[var(--color-sidecar-black)] font-bold rounded-full border-2 border-[var(--color-gold-300)] transform transition-all duration-300 hover:scale-110 hover:border-[var(--color-sidecar-gold)] hover:shadow-xl font-heading uppercase tracking-wider'
                                >
                                    <span className='flex items-center gap-2'>
                                        <span className='text-xl'>📊</span>
                                        View My Stats
                                        <span className='group-hover:translate-x-1 transition-transform'>
                                            →
                                        </span>
                                    </span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href='/sign-up'
                                    ref={primaryButtonRef}
                                    className='group relative px-10 py-5 bg-gradient-to-r from-[var(--color-sidecar-gold)] to-[var(--color-gold-600)] text-[var(--color-sidecar-cream)] font-bold rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden font-heading uppercase tracking-wider'
                                >
                                    <span className='relative z-10 flex items-center gap-2'>
                                        <span className='text-xl'>🚀</span>
                                        Join The Side Car Game
                                        <span className='group-hover:translate-x-1 transition-transform'>
                                            →
                                        </span>
                                    </span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-[var(--color-gold-600)] to-[var(--color-gold-700)] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                                </Link>
                                <Link
                                    href='/sign-in'
                                    ref={secondaryButtonRef}
                                    className='group px-10 py-5 bg-[var(--color-sidecar-white)]/90 backdrop-blur-sm text-[var(--color-sidecar-black)] font-bold rounded-full border-2 border-[var(--color-gold-300)] transform transition-all duration-300 hover:scale-110 hover:border-[var(--color-sidecar-gold)] hover:shadow-xl font-heading uppercase tracking-wider'
                                >
                                    <span className='flex items-center gap-2'>
                                        <span className='text-xl'>👤</span>
                                        Member Sign In
                                        <span className='group-hover:translate-x-1 transition-transform'>
                                            →
                                        </span>
                                    </span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Feature cards */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-20'>
                        <Feature3DCard
                            icon='☕'
                            title='Coffee Break Connections'
                            description='Perfect for quick games during your coffee break at The Side Car'
                            delay={0.2}
                        />
                        <Feature3DCard
                            icon='💼'
                            title='Network Naturally'
                            description='Learn about fellow entrepreneurs while having fun'
                            delay={0.4}
                        />
                        <Feature3DCard
                            icon='📍'
                            title='Location-Based Play'
                            description='Connect with members from your Side Car location'
                            delay={0.6}
                        />
                    </div>
                    
                    {/* Social Proof */}
                    <div className='mt-16 flex flex-col items-center'>
                        <p className='text-[var(--color-sidecar-gray)] mb-4 font-heading'>
                            Trusted by Side Car members in
                        </p>
                        <div className='flex flex-wrap justify-center gap-4 text-[var(--color-sidecar-gold)] font-heading uppercase tracking-wider text-sm'>
                            <span className='px-4 py-2 bg-[var(--color-gold-50)] rounded-full'>Downtown</span>
                            <span className='px-4 py-2 bg-[var(--color-gold-50)] rounded-full'>Uptown</span>
                            <span className='px-4 py-2 bg-[var(--color-gold-50)] rounded-full'>Innovation District</span>
                        </div>
                    </div>
                </div>
            </div>
            <AnimatedWave />
        </section>
    );
};

export default HeroSection;