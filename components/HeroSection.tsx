'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

// Brutalist Geometric Background Pattern
const BrutalistPattern = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Random geometric shapes */}
            <div className="absolute top-10 left-20 w-40 h-40 bg-yellow border-8 border-black rotate-12" />
            <div className="absolute top-40 right-32 w-32 h-32 bg-pink border-8 border-black -rotate-6" />
            <div className="absolute bottom-20 left-40 w-48 h-24 bg-blue border-8 border-black rotate-45" />
            <div className="absolute bottom-40 right-20 w-36 h-36 bg-green border-8 border-black -rotate-12" />
            <div className="absolute top-1/2 left-1/3 w-28 h-56 bg-orange border-8 border-black rotate-[25deg]" />
            <div className="absolute top-20 left-1/2 w-44 h-22 bg-purple border-8 border-black -rotate-[15deg]" />
        </div>
    );
};

// Brutalist Feature Card
type BrutalistCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    delay: number;
};

const BrutalistCard = ({ icon, title, description, color, delay }: BrutalistCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        
        const handleMouseEnter = () => {
            card.style.transform = 'translate(-8px, -8px)';
            card.classList.remove('shadow-brutal-md');
            card.classList.add('shadow-brutal-xl');
        };
        
        const handleMouseLeave = () => {
            card.style.transform = 'translate(0, 0)';
            card.classList.remove('shadow-brutal-xl');
            card.classList.add('shadow-brutal-md');
        };
        
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);
    
    return (
        <div
            ref={cardRef}
            className={`relative ${color} border-8 border-black p-8 transition-all duration-100 ease-linear shadow-brutal-md`}
            style={{
                animationDelay: `${delay}s`
            }}
        >
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-2xl font-black uppercase mb-2 tracking-tight">{title}</h3>
            <p className="text-black font-bold">{description}</p>
        </div>
    );
};

const HeroSection = () => {
    const { isSignedIn } = useUser();
    
    return (
        <section className="relative min-h-screen bg-cream overflow-hidden">
            <BrutalistPattern />
            
            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 py-20">
                <div className="max-w-6xl mx-auto">
                    {/* Floating Badge */}
                    <div className="inline-block mb-8">
                        <div className="bg-yellow border-4 border-black px-6 py-3 inline-block transform -rotate-2 shadow-brutal-sm">
                            <span className="text-black font-black uppercase text-sm tracking-wider">
                                🚀 New Game Mode Available!
                            </span>
                        </div>
                    </div>
                    
                    {/* Main Title */}
                    <div className="mb-12">
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-none mb-6">
                            <span className="inline-block transform -rotate-2 bg-pink text-white px-4 py-2 border-8 border-black mb-4 shadow-brutal-lg">
                                Guess
                            </span>
                            <br />
                            <span className="inline-block transform rotate-1 bg-blue text-white px-4 py-2 border-8 border-black shadow-brutal-lg">
                                Who?
                            </span>
                        </h1>
                        
                        <div className="max-w-3xl">
                            <p className="text-2xl md:text-3xl font-bold uppercase bg-white border-6 border-black p-6 transform -rotate-1 shadow-brutal-md">
                                Connect with your coworking community through the <span className="text-pink">ultimate</span> guessing game!
                            </p>
                        </div>
                    </div>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 mb-20">
                        {isSignedIn ? (
                            <>
                                <Link
                                    href="/games"
                                    className="group relative bg-yellow text-black border-8 border-black px-10 py-6 font-black uppercase text-xl tracking-wider inline-block transition-all duration-100 ease-linear hover:translate-x-[-8px] hover:translate-y-[-8px] shadow-brutal-md hover:shadow-brutal-xl"
                                >
                                    <span className="flex items-center gap-3">
                                        Find Opponent
                                        <span className="inline-block transition-transform duration-100 group-hover:translate-x-2">→</span>
                                    </span>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="group relative bg-white text-black border-8 border-black px-10 py-6 font-black uppercase text-xl tracking-wider inline-block transition-all duration-100 ease-linear hover:translate-x-[-8px] hover:translate-y-[-8px] shadow-brutal-md hover:shadow-brutal-xl"
                                >
                                    <span className="flex items-center gap-3">
                                        Dashboard
                                        <span className="inline-block transition-transform duration-100 group-hover:translate-x-2">→</span>
                                    </span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/sign-up"
                                    className="group relative bg-pink text-white border-8 border-black px-10 py-6 font-black uppercase text-xl tracking-wider inline-block transition-all duration-100 ease-linear hover:translate-x-[-8px] hover:translate-y-[-8px] shadow-brutal-md hover:shadow-brutal-xl"
                                >
                                    <span className="flex items-center gap-3">
                                        Start Now
                                        <span className="inline-block transition-transform duration-100 group-hover:translate-x-2">→</span>
                                    </span>
                                </Link>
                                <Link
                                    href="/sign-in"
                                    className="group relative bg-white text-black border-8 border-black px-10 py-6 font-black uppercase text-xl tracking-wider inline-block transition-all duration-100 ease-linear hover:translate-x-[-8px] hover:translate-y-[-8px] shadow-brutal-md hover:shadow-brutal-xl"
                                >
                                    <span className="flex items-center gap-3">
                                        Sign In
                                        <span className="inline-block transition-transform duration-100 group-hover:translate-x-2">→</span>
                                    </span>
                                </Link>
                            </>
                        )}
                    </div>
                    
                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <BrutalistCard
                            icon="🎮"
                            title="Play Hard"
                            description="Intense gameplay that will test your knowledge"
                            color="bg-green"
                            delay={0.1}
                        />
                        <BrutalistCard
                            icon="🤝"
                            title="Connect"
                            description="Meet new people and strengthen bonds"
                            color="bg-orange"
                            delay={0.2}
                        />
                        <BrutalistCard
                            icon="🏆"
                            title="Win Big"
                            description="Compete for glory and bragging rights"
                            color="bg-purple"
                            delay={0.3}
                        />
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-black"></div>
                    <div className="absolute bottom-20 left-0 right-0 h-4 bg-yellow"></div>
                    <div className="absolute bottom-24 left-0 right-0 h-4 bg-pink"></div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
