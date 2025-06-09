/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStaggerAnimation, useCountUp } from '@/hooks/animations';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const FeaturesSection = () => {
  const containerRef = useStaggerAnimation('.feature-card', {
    y: 0,
    rotateY: 0,
    opacity: 1,
  }, {
    amount: 0.1,
    from: 'start',
  });

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // Count-up animations for statistics
  const playersCountRef = useCountUp(500, 2);
  const gamesCountRef = useCountUp(1200, 2);
  const connectionsCountRef = useCountUp(850, 2);

  useEffect(() => {
    // Animate title
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
          },
        }
      );

      // Split text animation
      const text = titleRef.current.textContent || '';
      const words = text.split(' ');
      titleRef.current.innerHTML = words
        .map(word => `<span class="inline-block">${word}</span>`)
        .join(' ');

      gsap.from(titleRef.current.children, {
        y: 100,
        opacity: 0,
        rotationX: -90,
        stagger: 0.05,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
        },
      });
    }

    // Animate subtitle
    if (subtitleRef.current) {
      gsap.fromTo(
        subtitleRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: subtitleRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, []);

  const features = [
    {
      icon: '👥',
      title: 'Community Building',
      description: 'Strengthen bonds within your coworking space by learning about each other in a fun way',
      bgColor: 'bg-primary-100',
      borderGradient: 'from-primary-400 to-primary-600',
      delay: 0,
    },
    {
      icon: '🧠',
      title: 'Smart Questions',
      description: 'AI-powered question suggestions help you narrow down your guess efficiently',
      bgColor: 'bg-secondary-100',
      borderGradient: 'from-secondary-400 to-secondary-600',
      delay: 0.1,
    },
    {
      icon: '⚡',
      title: 'Real-time Updates',
      description: 'Get instant notifications when it\'s your turn - never miss a move',
      bgColor: 'bg-accent-100',
      borderGradient: 'from-accent-400 to-accent-600',
      delay: 0.2,
    },
    {
      icon: '🎯',
      title: 'Strategic Gameplay',
      description: 'Use deduction and strategy to guess your opponent\'s character before they guess yours',
      bgColor: 'bg-primary-100',
      borderGradient: 'from-primary-400 to-primary-600',
      delay: 0.3,
    },
    {
      icon: '📊',
      title: 'Game History',
      description: 'Track all your moves and learn from past games to improve your strategy',
      bgColor: 'bg-secondary-100',
      borderGradient: 'from-secondary-400 to-secondary-600',
      delay: 0.4,
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Control what information you share - opt-in to game participation',
      bgColor: 'bg-accent-100',
      borderGradient: 'from-accent-400 to-accent-600',
      delay: 0.5,
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16 text-center">
          <div className="p-4">
            <div className="text-4xl font-bold text-primary-600">
              <span ref={playersCountRef}>0</span>+
            </div>
            <p className="text-gray-600 mt-2">Active Players</p>
          </div>
          <div className="p-4">
            <div className="text-4xl font-bold text-secondary-600">
              <span ref={gamesCountRef}>0</span>+
            </div>
            <p className="text-gray-600 mt-2">Games Played</p>
          </div>
          <div className="p-4">
            <div className="text-4xl font-bold text-accent-600">
              <span ref={connectionsCountRef}>0</span>+
            </div>
            <p className="text-gray-600 mt-2">New Connections</p>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 ref={titleRef} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Coworkers Love Our Game
          </h2>
          <p ref={subtitleRef} className="text-xl text-gray-600 max-w-2xl mx-auto">
            More than just a game - it's a community builder that makes remote and hybrid work more connected
          </p>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Individual Feature Card with GSAP hover effects
type Feature = {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  borderGradient: string;
  delay: number;
};

const FeatureCard = ({ feature }: { feature: Feature; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !iconRef.current || !borderRef.current) return;

    // Set initial states
    gsap.set(cardRef.current, {
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
    });

    // Create hover animation timeline
    const tl = gsap.timeline({ paused: true });
    
    tl.to(cardRef.current, {
      rotateY: 5,
      rotateX: -5,
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
    .to(iconRef.current, {
      scale: 1.2,
      rotation: 360,
      duration: 0.5,
      ease: 'back.out(1.7)',
    }, 0)
    .to(borderRef.current, {
      scaleX: 1,
      duration: 0.3,
      ease: 'power2.out',
    }, 0);

    // Add hover listeners
    const handleMouseEnter = () => tl.play();
    const handleMouseLeave = () => tl.reverse();

    cardRef.current.addEventListener('mouseenter', handleMouseEnter);
    cardRef.current.addEventListener('mouseleave', handleMouseLeave);

    // Mouse move effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      gsap.to(cardRef.current, {
        rotateX: -rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    cardRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('mouseenter', handleMouseEnter);
        cardRef.current.removeEventListener('mouseleave', handleMouseLeave);
        cardRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="feature-card group relative p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer"
      style={{ opacity: 0, transform: 'translateY(50px) rotateY(-20deg)' }}
    >
      <div 
        ref={iconRef}
        className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6`}
      >
        <span className="text-3xl">{feature.icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
      <div 
        ref={borderRef}
        className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.borderGradient} transform scale-x-0 rounded-b-2xl origin-left`}
      ></div>
    </div>
  );
};