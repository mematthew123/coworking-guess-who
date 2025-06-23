import { useEffect, useRef } from 'react';

const AnimatedWave = () => {
    const waveRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!waveRef.current) return;

        // Subtle wave animation
        const paths = waveRef.current.querySelectorAll('path');
        let animationId: number;

        const animateWave = (timestamp: number) => {
            paths.forEach((path, index) => {
                const offset = timestamp * 0.0001 + index * 0.5;
                const d = path.getAttribute('d');
                if (d) {
                    // Create subtle undulation effect
                    const modifiedD = d.replace(/M(\d+),(\d+)/, (match, x, y) => {
                        const newY = parseInt(y) + Math.sin(offset) * 2;
                        return `M${x},${newY}`;
                    });
                    path.setAttribute('d', modifiedD);
                }
            });
            animationId = requestAnimationFrame(animateWave);
        };

        animationId = requestAnimationFrame(animateWave);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
            <svg
                ref={waveRef}
                className="relative block w-full h-24 md:h-32"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
            >
                {/* Multiple wave layers for depth */}
                <path
                    fill="var(--color-gold-100)"
                    fillOpacity="0.3"
                    d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,128C672,117,768,139,864,165.3C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    className="animate-wave-slow"
                />
                <path
                    fill="var(--color-gold-200)"
                    fillOpacity="0.4"
                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    className="animate-wave-medium"
                />
                <path
                    fill="var(--color-sidecar-cream)"
                    fillOpacity="1"
                    d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    className="animate-wave-fast"
                />
            </svg>

            <style jsx>{`
                @keyframes wave-slow {
                    0% {
                        d: path("M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,128C672,117,768,139,864,165.3C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
                    }
                    50% {
                        d: path("M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,224C672,235,768,213,864,186.7C960,160,1056,128,1152,133.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
                    }
                    100% {
                        d: path("M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,128C672,117,768,139,864,165.3C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
                    }
                }

                .animate-wave-slow {
                    animation: wave-slow 20s ease-in-out infinite;
                }

                .animate-wave-medium {
                    animation: wave-slow 15s ease-in-out infinite reverse;
                }

                .animate-wave-fast {
                    animation: wave-slow 10s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default AnimatedWave;