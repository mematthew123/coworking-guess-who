'use client';

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    fadeDirection: number;
    color: string;
    type: 'circle' | 'coffee' | 'sparkle';
}

export const useEnhancedParticleSystem = (particleCount: number = 30) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationIdRef = useRef<number | undefined>(undefined);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Gold color palette for particles
        const goldColors = [
            'rgba(152, 118, 84, 0.3)',  // --color-sidecar-gold
            'rgba(184, 153, 104, 0.3)', // --color-sidecar-gold-light
            'rgba(217, 201, 177, 0.2)', // --color-gold-300
            'rgba(197, 168, 130, 0.2)', // --color-gold-400
        ];

        // Initialize particles
        const initParticles = () => {
            particlesRef.current = Array.from({ length: particleCount }, () => {
                const type = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'coffee' : 'sparkle') : 'circle';
                return {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: type === 'circle' ? Math.random() * 3 + 1 : Math.random() * 4 + 2,
                    opacity: Math.random() * 0.5 + 0.2,
                    fadeDirection: Math.random() > 0.5 ? 0.005 : -0.005,
                    color: goldColors[Math.floor(Math.random() * goldColors.length)],
                    type,
                };
            });
        };
        initParticles();

        // Mouse interaction
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Draw coffee bean shape
        const drawCoffeeBean = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4);
            
            // Coffee bean shape
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Center line
            ctx.strokeStyle = 'rgba(122, 93, 58, 0.3)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(-size * 0.7, 0);
            ctx.lineTo(size * 0.7, 0);
            ctx.stroke();
            
            ctx.restore();
        };

        // Draw sparkle
        const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            const spikes = 4;
            const outerRadius = size;
            const innerRadius = size * 0.5;

            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const angle = (i * Math.PI) / spikes;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Mouse interaction - particles move away from cursor
                const dx = particle.x - mouseRef.current.x;
                const dy = particle.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.x += (dx / distance) * force * 2;
                    particle.y += (dy / distance) * force * 2;
                }

                // Boundary check with wrap around
                if (particle.x < -10) particle.x = canvas.width + 10;
                if (particle.x > canvas.width + 10) particle.x = -10;
                if (particle.y < -10) particle.y = canvas.height + 10;
                if (particle.y > canvas.height + 10) particle.y = -10;

                // Update opacity for pulsing effect
                particle.opacity += particle.fadeDirection;
                if (particle.opacity > 0.7 || particle.opacity < 0.1) {
                    particle.fadeDirection = -particle.fadeDirection;
                }

                // Draw particle based on type
                ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
                
                switch (particle.type) {
                    case 'coffee':
                        drawCoffeeBean(ctx, particle.x, particle.y, particle.radius);
                        break;
                    case 'sparkle':
                        drawSparkle(ctx, particle.x, particle.y, particle.radius);
                        break;
                    default:
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                        ctx.fill();
                }
            });

            // Draw connections between nearby particles
            particlesRef.current.forEach((particle, i) => {
                particlesRef.current.slice(i + 1).forEach((otherParticle) => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.strokeStyle = `rgba(152, 118, 84, ${0.1 * (1 - distance / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });
            });

            animationIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [particleCount]);

    return canvasRef;
};

// Export the component
export const ParticleField = () => {
    const canvasRef = useEnhancedParticleSystem(40);
    return (
        <canvas
            ref={canvasRef}
            className='absolute inset-0 pointer-events-none opacity-50'
        />
    );
};