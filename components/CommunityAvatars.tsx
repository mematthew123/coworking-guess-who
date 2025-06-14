import { usePhaseAnimation, useMagneticHover, useContinuousRotation, useRevealAnimation } from "@/hooks/animations";
import { useRef, useState, useEffect } from "react";

export const CommunityAvatars = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);
    const connectionRefs = useRef<(SVGElement | null)[]>([]);
    const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);
    
    // Use phase animation hook
    const { currentPhase } = usePhaseAnimation(['scattered', 'searching', 'connecting', 'community'], 3000);
    
    // Use magnetic hover hook
    const { setElementRef } = useMagneticHover(20, 200);
    
    // Use continuous rotation hook for the ring
    const ringRef = useContinuousRotation<HTMLDivElement>(60);
    
    // Use reveal animation for the center
    const centerRef = useRevealAnimation<HTMLDivElement>({ delay: 0.5 });

    const avatars = [
        { id: 1, emoji: '👨‍💻', role: 'Developer', gradient: 'from-blue-400 to-blue-600', skills: ['React', 'Node.js'] },
        { id: 2, emoji: '👩‍🎨', role: 'Designer', gradient: 'from-pink-400 to-pink-600', skills: ['UI/UX', 'Figma'] },
        { id: 3, emoji: '👨‍💼', role: 'Manager', gradient: 'from-purple-400 to-purple-600', skills: ['Agile', 'Leadership'] },
        { id: 4, emoji: '👩‍🏫', role: 'Teacher', gradient: 'from-green-400 to-green-600', skills: ['Mentoring', 'EdTech'] },
        { id: 5, emoji: '👨‍🔬', role: 'Researcher', gradient: 'from-yellow-400 to-yellow-600', skills: ['ML', 'Data'] },
        { id: 6, emoji: '👩‍💻', role: 'Engineer', gradient: 'from-indigo-400 to-indigo-600', skills: ['Python', 'AWS'] },
        { id: 7, emoji: '👨‍🎤', role: 'Creative', gradient: 'from-red-400 to-red-600', skills: ['Content', 'Video'] },
        { id: 8, emoji: '👩‍⚕️', role: 'Consultant', gradient: 'from-teal-400 to-teal-600', skills: ['Strategy', 'Analysis'] },
    ];

    // Set up avatar refs for magnetic hover
    useEffect(() => {
        avatarRefs.current.forEach((ref, index) => {
            if (ref) setElementRef(index)(ref);
        });
    }, [setElementRef]);

    // Main animation timeline
    useEffect(() => {
        if (!containerRef.current) return;

        const storyTimeline = gsap.timeline({ repeat: -1 });

        // Animation based on current phase
        const updateAnimation = () => {
            switch (currentPhase) {
                case 'scattered':
                    gsap.to(avatarRefs.current, {
                        x: () => gsap.utils.random(-400, 400),
                        y: () => gsap.utils.random(-300, 300),
                        rotation: () => gsap.utils.random(-180, 180),
                        opacity: 0.3,
                        scale: 1,
                        duration: 2,
                        ease: 'power1.inOut',
                    });
                    break;
                    
                case 'searching':
                    gsap.to(avatarRefs.current, {
                        x: (index) => Math.cos(index * 0.8) * 200,
                        y: (index) => Math.sin(index * 0.8) * 200,
                        rotation: 0,
                        opacity: 0.5,
                        scale: 1.1,
                        duration: 2,
                        ease: 'power2.inOut',
                    });
                    gsap.to('.avatar-pulse', {
                        scale: 2,
                        opacity: 0,
                        duration: 1,
                        stagger: 0.1,
                        repeat: 2,
                    });
                    break;
                    
                case 'connecting':
                    gsap.to(avatarRefs.current, {
                        x: (index) => {
                            const angle = (index / avatars.length) * Math.PI * 2;
                            return Math.cos(angle) * 150;
                        },
                        y: (index) => {
                            const angle = (index / avatars.length) * Math.PI * 2;
                            return Math.sin(angle) * 150;
                        },
                        scale: 1.1,
                        opacity: 0.7,
                        duration: 2,
                        ease: 'elastic.out(1, 0.5)',
                    });
                    gsap.to(connectionRefs.current, {
                        opacity: 0.5,
                        scale: 1,
                        duration: 0.5,
                        stagger: 0.05,
                    });
                    break;
                    
                case 'community':
                    gsap.to('.community-center', {
                        scale: 1,
                        opacity: 0.8,
                        rotation: 360,
                        duration: 1,
                        ease: 'back.out(1.7)',
                    });
                    gsap.to(avatarRefs.current, {
                        scale: 1.2,
                        duration: 0.3,
                        yoyo: true,
                        repeat: 1,
                        stagger: { each: 0.05, from: 'center' },
                    });
                    break;
            }
        };

        updateAnimation();

        return () => {
            storyTimeline.kill();
        };
    }, [currentPhase, avatars.length]);

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Enhanced community center */}
            <div ref={centerRef} className="community-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 scale-0 opacity-0">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400/20 via-pink-400/20 to-purple-400/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="relative">
                        <span className="text-5xl animate-pulse">🤝</span>
                        <div className="absolute inset-0 animate-ping">
                            <span className="text-5xl opacity-30">🤝</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic connection lines */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.5">
                            <animate attributeName="stopColor" values="#60A5FA;#F472B6;#818CF8;#60A5FA" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#F472B6" stopOpacity="0.5">
                            <animate attributeName="stopColor" values="#F472B6;#818CF8;#60A5FA;#F472B6" dur="4s" repeatCount="indefinite" />
                        </stop>
                    </linearGradient>
                </defs>
                {avatars.map((_, index) => (
                    <g key={`connection-${index}`} ref={el => { connectionRefs.current[index] = el; }} className="opacity-0 scale-0">
                        {avatars.slice(index + 1).map((_, j) => {
                            const actualJ = index + j + 1;
                            const angle1 = (index / avatars.length) * Math.PI * 2;
                            const angle2 = (actualJ / avatars.length) * Math.PI * 2;
                            const x1 = window.innerWidth / 2 + Math.cos(angle1) * 150;
                            const y1 = window.innerHeight / 2 + Math.sin(angle1) * 150;
                            const x2 = window.innerWidth / 2 + Math.cos(angle2) * 150;
                            const y2 = window.innerHeight / 2 + Math.sin(angle2) * 150;

                            return (
                                <line
                                    key={`line-${index}-${actualJ}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="url(#connection-gradient)"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    className="animate-pulse"
                                />
                            );
                        })}
                    </g>
                ))}
            </svg>

            {/* Avatar ring with enhanced interactions */}
            <div ref={ringRef} className="community-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {avatars.map((avatar, index) => (
                    <div
                        key={avatar.id}
                        ref={(el) => { avatarRefs.current[index] = el; }}
                        className="community-avatar absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                        onMouseEnter={() => setHoveredAvatar(index)}
                        onMouseLeave={() => setHoveredAvatar(null)}
                    >
                        <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${avatar.gradient} shadow-2xl transform transition-all duration-300 ${hoveredAvatar === index ? 'scale-125 z-10' : ''}`}>
                            {/* Avatar emoji */}
                            <div className="avatar-emoji absolute inset-0 flex items-center justify-center text-4xl">
                                {avatar.emoji}
                            </div>

                            {/* Pulse effect for searching */}
                            <div className="avatar-pulse absolute inset-0 rounded-full bg-white/30" />

                            {/* Role and skills tooltip */}
                            <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl transition-all duration-300 ${hoveredAvatar === index ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                                <div className="text-sm font-bold text-gray-800">{avatar.role}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {avatar.skills.join(' • ')}
                                </div>
                            </div>

                            {/* Glow effect */}
                            {currentPhase === 'community' && (
                                <div className="absolute inset-0 rounded-full animate-pulse">
                                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${avatar.gradient} opacity-30 blur-xl`} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Enhanced phase indicator */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-xl animate-pulse" />
                    <div className="relative text-sm font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-100">
                        {currentPhase === 'scattered' && <span className="flex items-center gap-2"><span className="animate-spin">🔍</span> Looking for community...</span>}
                        {currentPhase === 'searching' && <span className="flex items-center gap-2"><span className="animate-bounce">👀</span> Discovering others...</span>}
                        {currentPhase === 'connecting' && <span className="flex items-center gap-2"><span className="animate-pulse">🤝</span> Making connections...</span>}
                        {currentPhase === 'community' && <span className="flex items-center gap-2"><span className="animate-bounce">🎉</span> Community formed!</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};