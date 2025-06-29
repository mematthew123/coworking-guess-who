'use client';
import { useRef, useEffect } from "react";
import gsap from "gsap";

type Feature = {
  icon: string;
  title: string;
  description: string;
  color: string;
  highlight?: string;
};

export const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    // Set initial rotation
    gsap.set(cardRef.current, {
      rotation: index % 2 === 0 ? -2 : 2,
    });

    // Harsh hover effects
    const handleMouseEnter = () => {
      gsap.to(cardRef.current, {
        scale: 1.05,
        rotation: 0,
        duration: 0.1,
        ease: 'none',
      });
      
      gsap.to(iconRef.current, {
        scale: 1.2,
        rotation: 360,
        duration: 0.2,
        ease: 'none',
      });

      // Change shadow
      if (cardRef.current) {
        cardRef.current.classList.remove('shadow-brutal-md');
        cardRef.current.classList.add('shadow-brutal-xl');
      }
    };

    const handleMouseLeave = () => {
      gsap.to(cardRef.current, {
        scale: 1,
        rotation: index % 2 === 0 ? -2 : 2,
        duration: 0.1,
        ease: 'none',
      });
      
      gsap.to(iconRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.2,
        ease: 'none',
      });

      // Reset shadow
      if (cardRef.current) {
        cardRef.current.classList.remove('shadow-brutal-xl');
        cardRef.current.classList.add('shadow-brutal-md');
      }
    };

    // Click effect
    const handleClick = () => {
      gsap.to(cardRef.current, {
        scale: 0.95,
        duration: 0.05,
        ease: 'none',
        yoyo: true,
        repeat: 1,
      });
    };

    cardRef.current.addEventListener('mouseenter', handleMouseEnter);
    cardRef.current.addEventListener('mouseleave', handleMouseLeave);
    cardRef.current.addEventListener('click', handleClick);

    // Shake effect on highlight
    if (highlightRef.current) {
      gsap.to(highlightRef.current, {
        rotation: 15,
        duration: 0.1,
        ease: 'none',
        yoyo: true,
        repeat: -1,
        repeatDelay: 2,
      });
    }

    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('mouseenter', handleMouseEnter);
        cardRef.current.removeEventListener('mouseleave', handleMouseLeave);
        cardRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`brutalist-feature-card relative ${feature.color} border-8 border-black p-8 shadow-brutal-md cursor-pointer transition-all duration-100`}
    >
      {/* Highlight badge */}
      {feature.highlight && (
        <div 
          ref={highlightRef}
          className="absolute -top-4 -right-4 bg-red text-white font-black px-4 py-2 border-4 border-black transform rotate-12 shadow-brutal-sm"
        >
          {feature.highlight}
        </div>
      )}

      {/* Icon */}
      <div 
        ref={iconRef}
        className="text-6xl mb-4 inline-block"
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-black uppercase mb-3 text-black">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-black font-bold uppercase text-sm leading-tight">
        {feature.description}
      </p>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black"></div>
    </div>
  );
};