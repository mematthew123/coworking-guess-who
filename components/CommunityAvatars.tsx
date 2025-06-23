import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const memberTypes = [
    { emoji: '💼', title: 'Entrepreneur', color: 'var(--color-gold-500)' },
    { emoji: '🎨', title: 'Creator', color: 'var(--color-gold-600)' },
    { emoji: '💡', title: 'Innovator', color: 'var(--color-gold-700)' },
    { emoji: '🚀', title: 'Founder', color: 'var(--color-gold-500)' },
    { emoji: '📱', title: 'Developer', color: 'var(--color-gold-600)' },
    { emoji: '📊', title: 'Consultant', color: 'var(--color-gold-700)' },
    { emoji: '✍️', title: 'Writer', color: 'var(--color-gold-500)' },
    { emoji: '🎯', title: 'Strategist', color: 'var(--color-gold-600)' },
];

export const CommunityAvatars = () => {
    const avatarsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!avatarsRef.current) return;

        const avatars = avatarsRef.current.children;
        
        // Initial animation for avatars
        gsap.fromTo(
            avatars,
            {
                scale: 0,
                opacity: 0,
                rotate: -180,
            },
            {
                scale: 1,
                opacity: 1,
                rotate: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'back.out(1.7)',
                delay: 0.5,
            }
        );

        // Floating animation
        Array.from(avatars).forEach((avatar, index) => {
            const delay = index * 0.2;
            
            gsap.to(avatar, {
                y: '+=10',
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: delay,
            });

            // Subtle rotation
            gsap.to(avatar, {
                rotate: '+=5',
                duration: 3 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: delay,
            });
        });

        // Interactive hover effect
        const handleMouseEnter = (e: Event) => {
            const avatar = e.currentTarget as HTMLElement;
            gsap.to(avatar, {
                scale: 1.2,
                duration: 0.3,
                ease: 'back.out(1.7)',
            });
        };

        const handleMouseLeave = (e: Event) => {
            const avatar = e.currentTarget as HTMLElement;
            gsap.to(avatar, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        Array.from(avatars).forEach((avatar) => {
            avatar.addEventListener('mouseenter', handleMouseEnter);
            avatar.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            Array.from(avatars).forEach((avatar) => {
                avatar.removeEventListener('mouseenter', handleMouseEnter);
                avatar.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);

    return (
        <div ref={avatarsRef} className='absolute inset-0 overflow-hidden pointer-events-none'>
            {/* Left side avatars */}
            <div className='absolute left-10 top-20 pointer-events-auto group'>
                <div className='relative w-16 h-16 bg-[var(--color-sidecar-white)] rounded-full shadow-lg flex items-center justify-center border-2 border-[var(--color-gold-300)] cursor-pointer'>
                    <span className='text-2xl'>{memberTypes[0].emoji}</span>
                    <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidecar-black)] text-[var(--color-sidecar-cream)] text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-heading'>
                        {memberTypes[0].title}
                    </div>
                </div>
            </div>

            <div className='absolute left-32 top-40 pointer-events-auto group'>
                <div className='relative w-20 h-20 bg-[var(--color-gold-50)] rounded-full shadow-lg flex items-center justify-center border-2 border-[var(--color-gold-400)] cursor-pointer'>
                    <span className='text-3xl'>{memberTypes[1].emoji}</span>
                    <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidecar-black)] text-[var(--color-sidecar-cream)] text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-heading'>
                        {memberTypes[1].title}
                    </div>
                </div>
            </div>

            <div className='absolute left-16 bottom-32 pointer-events-auto group'>
                <div className='relative w-14 h-14 bg-[var(--color-sidecar-white)] rounded-full shadow-lg flex items-center justify-center border-2 border-[var(--color-gold-500)] cursor-pointer'>
                    <span className='text-xl'>{memberTypes[2].emoji}</span>
                    <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidecar-black)] text-[var(--color-sidecar-cream)] text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-heading'>
                        {memberTypes[2].title}
                    </div>
                </div>
            </div>

            {/* Right side avatars */}
            <div className='absolute right-20 top-32 pointer-events-auto group'>
                <div className='relative w-18 h-18 bg-[var(--color-gold-100)] rounded-full shadow-lg flex items-center justify-center border-2 border-[var(--color-gold-600)] cursor-pointer'>
                    <span className='text-2xl'>{memberTypes[3].emoji}</span>
                    <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidecar-black)] text-[var(--color-sidecar-cream)] text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-heading'>
                        {memberTypes[3].title}
                    </div>
                </div>
            </div>

            <div className='absolute right-40 top-16 pointer-events-auto group'>
                <div className='relative w-16 h-16 bg-[var(--color-sidecar-white)] rounded-full shadow-lg flex items-center justify-center border-2 border-[var(--color-gold-300)] cursor-pointer'>
                    <span className='text-2xl'>{memberTypes[4].emoji}</span>
                    <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidecar-black)] text-[var(--color-sidecar-cream)] text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-heading'>
                        {memberTypes[4].title}
                    </div>
                </div>
            </div>

            <div className='absolute right-12 bottom-40 pointer-events-auto group'>
                <div className='relative w-20 h-20 bg-[var(--color-gold-50)] rounded-full shadow-lg flex items-center justify-center border-2 border-[var(--color-gold-400)] cursor-pointer'>
                    <span className='text-3xl'>{memberTypes[5].emoji}</span>
                    <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidecar-black)] text-[var(--color-sidecar-cream)] text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-heading'>
                        {memberTypes[5].title}
                    </div>
                </div>
            </div>

            {/* Center avatars */}
            <div className='absolute left-1/2 top-12 transform -translate-x-1/2 pointer-events-auto group'>
                <div className='relative w-14 h-14 bg-[var(--color-sidecar-white)] rounded-full shadow-lg flex items-center justify-center border-2 border-[var(--color-gold-500)] cursor-pointer'>
                    <span className='text-xl'>{memberTypes[6].emoji}</span>
                    <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidecar-black)] text-[var(--color-sidecar-cream)] text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-heading'>
                        {memberTypes[6].title}
                    </div>
                </div>
            </div>

            <div className='absolute left-1/2 bottom-20 transform -translate-x-1/2 pointer-events-auto group'>
                <div className='relative w-16 h-16 bg-[var(--color-gold-100)] rounded-full shadow-lg flex items-center justify-center border-2 border-[var(--color-gold-600)] cursor-pointer'>
                    <span className='text-2xl'>{memberTypes[7].emoji}</span>
                    <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidecar-black)] text-[var(--color-sidecar-cream)] text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-heading'>
                        {memberTypes[7].title}
                    </div>
                </div>
            </div>
        </div>
    );
};