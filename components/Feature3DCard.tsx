import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface Feature3DCardProps {
    icon: string;
    title: string;
    description: string;
    delay?: number;
}

export const Feature3DCard = ({ icon, title, description, delay = 0 }: Feature3DCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cardRef.current || !innerRef.current) return;

        const card = cardRef.current;
        const inner = innerRef.current;
        const glow = glowRef.current;

        // Initial animation
        gsap.fromTo(
            card,
            {
                opacity: 0,
                y: 50,
                rotateX: -15,
            },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.8,
                delay: delay,
                ease: 'power3.out',
            }
        );

        // 3D tilt effect on mouse move
        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(inner, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: 1000,
            });

            // Move glow effect
            if (glow) {
                gsap.to(glow, {
                    x: (x - centerX) * 0.5,
                    y: (y - centerY) * 0.5,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(inner, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out',
            });

            if (glow) {
                gsap.to(glow, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                });
            }
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [delay]);

    return (
        <div 
            ref={cardRef} 
            className='relative p-1 rounded-2xl group'
            style={{ perspective: '1000px' }}
        >
            {/* Gradient border */}
            <div className='absolute inset-0 bg-gradient-to-br from-[var(--color-gold-400)] to-[var(--color-gold-600)] rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300' />
            
            {/* Card content */}
            <div
                ref={innerRef}
                className='relative bg-[var(--color-sidecar-cream)] rounded-2xl p-8 h-full transform-gpu transition-all duration-300 group-hover:bg-[var(--color-gold-50)]'
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Glow effect */}
                <div
                    ref={glowRef}
                    className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
                    style={{
                        background: 'radial-gradient(circle at center, rgba(152, 118, 84, 0.1) 0%, transparent 70%)',
                    }}
                />

                {/* Icon */}
                <div className='relative z-10 w-20 h-20 mb-6 mx-auto flex items-center justify-center text-5xl bg-[var(--color-sidecar-white)] rounded-full shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl'>
                    <span className='transform transition-transform duration-300 group-hover:scale-110'>
                        {icon}
                    </span>
                </div>

                {/* Title */}
                <h3 className='relative z-10 text-2xl font-bold text-[var(--color-sidecar-black)] mb-3 text-center font-heading'>
                    {title}
                </h3>

                {/* Description */}
                <p className='relative z-10 text-[var(--color-sidecar-gray)] text-center leading-relaxed'>
                    {description}
                </p>

                {/* Decorative elements */}
                <div className='absolute top-4 right-4 w-2 h-2 bg-[var(--color-sidecar-gold)] rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300' />
                <div className='absolute bottom-4 left-4 w-2 h-2 bg-[var(--color-sidecar-gold)] rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300' />
            </div>
        </div>
    );
};