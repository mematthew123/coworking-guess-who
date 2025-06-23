import { useRef, useEffect } from 'react';
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

    useEffect(() => {
        if (!cardRef.current || !iconRef.current) return;

        // Hover animation
        const card = cardRef.current;
        const icon = iconRef.current;

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

        // Initial animation
        gsap.fromTo(
            card,
            {
                y: 50,
                opacity: 0,
                rotateY: -45,
            },
            {
                y: 0,
                opacity: 1,
                rotateY: 0,
                duration: 0.8,
                delay: feature.delay,
                ease: 'power3.out',
            }
        );

        return () => {
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [feature.delay]);

    return (
        <div
            ref={cardRef}
            className={`feature-card relative p-6 rounded-2xl ${feature.bgColor} backdrop-blur-sm group cursor-pointer transition-all duration-300 border border-[var(--color-gold-200)] hover:border-[var(--color-sidecar-gold)]`}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
        >
            {/* Highlight Badge */}
            {feature.highlight && (
                <div className='absolute -top-3 -right-3 bg-[var(--color-sidecar-gold)] text-[var(--color-sidecar-cream)] text-xs font-bold px-3 py-1 rounded-full shadow-md font-heading uppercase tracking-wider'>
                    {feature.highlight}
                </div>
            )}

            {/* Gradient Border Effect */}
            <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.borderGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
            ></div>

            {/* Icon Container */}
            <div
                ref={iconRef}
                className='relative z-10 w-16 h-16 mb-4 mx-auto flex items-center justify-center text-4xl bg-[var(--color-sidecar-white)] rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300'
            >
                {feature.icon}
            </div>

            {/* Content */}
            <h3 className='relative z-10 text-xl font-bold text-[var(--color-sidecar-black)] mb-3 font-heading'>
                {feature.title}
            </h3>
            <p className='relative z-10 text-[var(--color-sidecar-gray)] leading-relaxed'>
                {feature.description}
            </p>

            {/* Hover Glow Effect */}
            <div className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-gold-300)]/10 to-transparent'></div>
            </div>

            {/* Bottom Accent Line */}
            <div className='absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-sidecar-gold)] to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500'></div>
        </div>
    );
};