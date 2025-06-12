'use client';
import { useRef, useEffect } from "react";
import gsap from "gsap";

type Feature = {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  borderGradient: string;
  delay: number;
  highlight?: string;
};

export const FeatureCard = ({ feature }: { feature: Feature; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !iconRef.current || !borderRef.current) return;

    // Set initial states with enhanced 3D transforms
    gsap.set(cardRef.current, {
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
    });

    // Create enhanced hover animation timeline
    const tl = gsap.timeline({ paused: true });
    
    tl.to(cardRef.current, {
      rotateY: 8,
      rotateX: -8,
      scale: 1.08,
      z: 50,
      duration: 0.4,
      ease: 'power2.out',
    })
    .to(iconRef.current, {
      scale: 1.3,
      rotation: 360,
      duration: 0.6,
      ease: 'back.out(1.7)',
    }, 0)
    .to(borderRef.current, {
      scaleX: 1,
      duration: 0.4,
      ease: 'power2.out',
    }, 0)
    .to(contentRef.current, {
      y: -5,
      duration: 0.4,
      ease: 'power2.out',
    }, 0);

    // Add enhanced hover listeners
    const handleMouseEnter = () => {
      tl.play();
      // Add subtle glow effect
      gsap.to(cardRef.current, {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(59, 130, 246, 0.15)',
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      tl.reverse();
      gsap.to(cardRef.current, {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        duration: 0.3,
      });
    };

    cardRef.current.addEventListener('mouseenter', handleMouseEnter);
    cardRef.current.addEventListener('mouseleave', handleMouseLeave);

    // Enhanced mouse move effect with magnetic attraction
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * 15;
      const rotateY = ((x - centerX) / centerX) * 15;
      
      gsap.to(cardRef.current, {
        rotateX: -rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Magnetic effect for icon
      gsap.to(iconRef.current, {
        x: (x - centerX) * 0.1,
        y: (y - centerY) * 0.1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeaveCard = () => {
      gsap.to(cardRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.to(iconRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    cardRef.current.addEventListener('mousemove', handleMouseMove);
    cardRef.current.addEventListener('mouseleave', handleMouseLeaveCard);

    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('mouseenter', handleMouseEnter);
        cardRef.current.removeEventListener('mouseleave', handleMouseLeave);
        cardRef.current.removeEventListener('mousemove', handleMouseMove);
        cardRef.current.removeEventListener('mouseleave', handleMouseLeaveCard);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="feature-card group relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 overflow-hidden"
      style={{ opacity: 0, transform: 'translateY(50px) rotateY(-20deg)' }}
    >
      {/* Highlight badge */}
      {feature.highlight && (
        <div 
          ref={highlightRef}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg"
        >
          {feature.highlight}
        </div>
      )}

      <div ref={contentRef}>
        <div 
          ref={iconRef}
          className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
        >
          <span className="text-2xl">{feature.icon}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm">
          {feature.description}
        </p>
      </div>

      {/* Enhanced border gradient */}
      <div 
        ref={borderRef}
        className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.borderGradient} transform scale-x-0 rounded-b-2xl origin-left`}
      ></div>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gray-900 to-transparent rounded-2xl"></div>
    </div>
  );
};