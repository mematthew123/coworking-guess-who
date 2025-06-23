/* eslint-disable react/no-unescaped-entities */

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    useHeroTextAnimation,
    useFloatingAnimation,
    useElasticButton,
    useParticleSystem,
} from '@/hooks/animations';
import AnimatedWave from './AnimatedWave';
import { CommunityAvatars } from './CommunityAvatars';
import { Feature3DCard } from './Feature3DCard';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Particle Field Component using hook
const ParticleField = () => {
    const canvasRef = useParticleSystem(50);
    return (
        <canvas
            ref={canvasRef}
            className='absolute inset-0 pointer-events-none'
        />
    );
};

const HeroSection = () => {
    const { isSignedIn } = useUser();
    const { titleRef, subtitleRef } = useHeroTextAnimation();
    const ctaRef = useRef<HTMLDivElement>(null);
    const badgeRef = useFloatingAnimation({ duration: 4, y: -10 });

    // Apply elastic button animation to CTA buttons
    const primaryButtonRef = useElasticButton<HTMLAnchorElement>({ delay: 1 });
    const secondaryButtonRef = useElasticButton<HTMLAnchorElement>({
        delay: 1.15,
    });

    return (
        <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-gold-50)] via-[var(--color-sidecar-cream)] to-[var(--color-gold-100)]'>
            {/* Multi-layer background effects */}
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--color-gold-100)] via-transparent to-transparent opacity-40' />
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[var(--color-gold-200)] via-transparent to-transparent opacity-30' />
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
                        <span className='mr-2 text-lg animate-pulse'>🎯</span>
                        <span className='font-heading'>The Ultimate Coworking Community Game</span>
                        <span className='ml-2 px-2 py-1 bg-[var(--color-sidecar-gold)] text-[var(--color-sidecar-cream)] text-xs rounded-full animate-pulse'>
                            NEW
                        </span>
                    </div>

                    {/* Main Heading with gradient background */}
                    <div className='relative mb-6'>
                        <h1
                            ref={titleRef}
                            className='text-6xl md:text-7xl lg:text-8xl font-heading font-bold text-[var(--color-sidecar-black)] relative z-10'
                        >
                            Guess Who? Coworking Edition
                        </h1>
                        <div className='absolute inset-0 bg-gradient-to-r from-[var(--color-gold-400)]/10 to-[var(--color-gold-300)]/10 blur-3xl' />
                    </div>

                    {/* Animated gradient text */}
                    <div className='mb-8'>
                        <span className='text-5xl md:text-6xl lg:text-7xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-700)] via-[var(--color-sidecar-gold)] to-[var(--color-gold-600)] animate-fade-in'>
                            Connect • Play • Discover
                        </span>
                    </div>

                    {/* Subheading */}
                    <p
                        ref={subtitleRef}
                        className='text-xl md:text-2xl lg:text-3xl text-[var(--color-sidecar-gray)] mb-12 max-w-3xl mx-auto leading-relaxed font-heading'
                    >
                        Transform your coworking space into a vibrant community
                        through interactive gameplay
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
                                    className='group relative px-10 py-5 bg-gradient-to-r from-[var(--color-sidecar-gold)] to-[var(--color-gold-600)] text-[var(--color-sidecar-cream)] font-bold rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden font-heading'
                                >
                                    <span className='relative z-10 flex items-center gap-2'>
                                        Find an Opponent
                                        <span className='group-hover:translate-x-1 transition-transform'>
                                            →
                                        </span>
                                    </span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-[var(--color-gold-600)] to-[var(--color-gold-700)] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                                </Link>
                                <Link
                                    href='/dashboard'
                                    ref={secondaryButtonRef}
                                    className='group px-10 py-5 bg-[var(--color-sidecar-cream)]/90 backdrop-blur-sm text-[var(--color-sidecar-black)] font-bold rounded-full border-2 border-[var(--color-gold-300)] transform transition-all duration-300 hover:scale-110 hover:border-[var(--color-sidecar-gold)] hover:shadow-xl font-heading'
                                >
                                    <span className='flex items-center gap-2'>
                                        Go to Dashboard
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
                                    className='group relative px-10 py-5 bg-gradient-to-r from-[var(--color-sidecar-gold)] to-[var(--color-gold-600)] text-[var(--color-sidecar-cream)] font-bold rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden font-heading'
                                >
                                    <span className='relative z-10 flex items-center gap-2'>
                                        Start Playing Now
                                        <span className='group-hover:translate-x-1 transition-transform'>
                                            →
                                        </span>
                                    </span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-[var(--color-gold-600)] to-[var(--color-gold-700)] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                                </Link>
                                <Link
                                    href='/sign-in'
                                    ref={secondaryButtonRef}
                                    className='group px-10 py-5 bg-[var(--color-sidecar-cream)]/90 backdrop-blur-sm text-[var(--color-sidecar-black)] font-bold rounded-full border-2 border-[var(--color-gold-300)] transform transition-all duration-300 hover:scale-110 hover:border-[var(--color-sidecar-gold)] hover:shadow-xl font-heading'
                                >
                                    <span className='flex items-center gap-2'>
                                        Sign In
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
                            icon='🎮'
                            title='Interactive Gameplay'
                            description='Engage with your community through fun, strategic gameplay'
                            delay={0.2}
                        />
                        <Feature3DCard
                            icon='🤝'
                            title='Build Connections'
                            description='Discover new colleagues and strengthen existing relationships'
                            delay={0.4}
                        />
                        <Feature3DCard
                            icon='🏆'
                            title='Compete & Win'
                            description='Track your progress and compete for the top spot'
                            delay={0.6}
                        />
                    </div>
                </div>
            </div>
            <AnimatedWave />
        </section>
    );
};

export default HeroSection;
