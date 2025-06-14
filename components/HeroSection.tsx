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
        <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50'>
            {/* Multi-layer background effects */}
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-50' />
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-100 via-transparent to-transparent opacity-50' />
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
                        className='inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 text-sm font-medium mb-8 shadow-lg backdrop-blur-sm border border-white/50'
                    >
                        <span className='mr-2 text-lg animate-pulse'>🎯</span>
                        <span>The Ultimate Coworking Community Game</span>
                        <span className='ml-2 px-2 py-1 bg-green-400 text-white text-xs rounded-full animate-pulse'>
                            NEW
                        </span>
                    </div>

                    {/* Main Heading with gradient background */}
                    <div className='relative mb-6'>
                        <h1
                            ref={titleRef}
                            className='text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 relative z-10'
                        >
                            Guess Who? Coworking Edition
                        </h1>
                        <div className='absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl' />
                    </div>

                    {/* Animated gradient text */}
                    <div className='mb-8'>
                        <span className='text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient'>
                            Connect • Play • Discover
                        </span>
                    </div>

                    {/* Subheading */}
                    <p
                        ref={subtitleRef}
                        className='text-xl md:text-2xl lg:text-3xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed'
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
                                    className='group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden'
                                >
                                    <span className='relative z-10 flex items-center gap-2'>
                                        Find an Opponent
                                        <span className='group-hover:translate-x-1 transition-transform'>
                                            →
                                        </span>
                                    </span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                                </Link>
                                <Link
                                    href='/dashboard'
                                    ref={secondaryButtonRef}
                                    className='group px-10 py-5 bg-white/90 backdrop-blur-sm text-gray-800 font-bold rounded-full border-2 border-gray-200 transform transition-all duration-300 hover:scale-110 hover:border-purple-400 hover:shadow-xl'
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
                                    className='group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden'
                                >
                                    <span className='relative z-10 flex items-center gap-2'>
                                        Start Playing Now
                                        <span className='group-hover:translate-x-1 transition-transform'>
                                            →
                                        </span>
                                    </span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                                </Link>
                                <Link
                                    href='/sign-in'
                                    ref={secondaryButtonRef}
                                    className='group px-10 py-5 bg-white/90 backdrop-blur-sm text-gray-800 font-bold rounded-full border-2 border-gray-200 transform transition-all duration-300 hover:scale-110 hover:border-purple-400 hover:shadow-xl'
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
