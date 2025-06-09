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
    amount: 0.15,
    from: 'start',
  });

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Count-up animations for statistics - updated to reflect actual usage
  const membersCountRef = useCountUp(250, 2.5);
  const gamesCountRef = useCountUp(800, 2.2);
  const connectionsCountRef = useCountUp(1200, 2.8);

  useEffect(() => {
    // Animate title with enhanced effects
    if (titleRef.current) {
      // Split text animation
      const text = titleRef.current.textContent || '';
      const words = text.split(' ');
      titleRef.current.innerHTML = words
        .map(word => `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`)
        .join(' ');

      const wordSpans = titleRef.current.querySelectorAll('span span');

      gsap.fromTo(wordSpans, {
        y: 100,
        opacity: 0,
        rotationX: -90,
      }, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        stagger: 0.08,
        duration: 1,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
        },
      });
    }

    // Animate subtitle with typewriter effect
    if (subtitleRef.current) {
      const text = subtitleRef.current.textContent || '';
      subtitleRef.current.textContent = '';
      
      gsap.fromTo(subtitleRef.current, {
        opacity: 0,
      }, {
        opacity: 1,
        duration: 0.5,
        delay: 0.8,
        scrollTrigger: {
          trigger: subtitleRef.current,
          start: 'top 85%',
        },
        onComplete: () => {
          // Typewriter effect
          let i = 0;
          const typewriter = () => {
            if (i < text.length && subtitleRef.current) {
              subtitleRef.current.textContent += text.charAt(i);
              i++;
              setTimeout(typewriter, 30);
            }
          };
          typewriter();
        }
      });
    }

    // Animate stats with enhanced entrance
    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children, {
        scale: 0,
        opacity: 0,
        rotateY: 180,
      }, {
        scale: 1,
        opacity: 1,
        rotateY: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 85%',
        },
      });
    }
  }, []);

  const features = [
    {
      icon: '🎮',
      title: 'Real-time Gameplay',
      description: 'Instant game invitations, live turn notifications, and seamless real-time updates using WebSocket technology',
      bgColor: 'bg-blue-100',
      borderGradient: 'from-blue-400 to-blue-600',
      delay: 0,
      highlight: 'Most Popular',
    },
    {
      icon: '🧠',
      title: 'Smart Question Engine',
      description: 'AI-powered question suggestions analyze remaining players to suggest the most strategic questions',
      bgColor: 'bg-purple-100',
      borderGradient: 'from-purple-400 to-purple-600',
      delay: 0.1,
    },
    {
      icon: '👥',
      title: 'Dynamic Character Selection',
      description: 'Choose from your actual coworking community members with rich profile attributes and preferences',
      bgColor: 'bg-green-100',
      borderGradient: 'from-green-400 to-green-600',
      delay: 0.2,
    },
    {
      icon: '⚡',
      title: 'Live Presence System',
      description: 'See who\'s online, away, or available to play with real-time presence indicators and status updates',
      bgColor: 'bg-yellow-100',
      borderGradient: 'from-yellow-400 to-yellow-600',
      delay: 0.3,
    },
    {
      icon: '📊',
      title: 'Advanced Game History',
      description: 'Detailed move tracking, elimination logic, and game analytics to improve your strategy over time',
      bgColor: 'bg-pink-100',
      borderGradient: 'from-pink-400 to-pink-600',
      delay: 0.4,
    },
    {
      icon: '🔐',
      title: 'Privacy & Control',
      description: 'Granular control over your profile visibility, game participation, and personal information sharing',
      bgColor: 'bg-indigo-100',
      borderGradient: 'from-indigo-400 to-indigo-600',
      delay: 0.5,
    },
    {
      icon: '🎯',
      title: 'Strategic Deduction',
      description: 'Use Boolean logic and elimination strategies to narrow down possibilities and make the perfect guess',
      bgColor: 'bg-red-100',
      borderGradient: 'from-red-400 to-red-600',
      delay: 0.6,
    },
    {
      icon: '🌐',
      title: 'Cross-Platform Ready',
      description: 'Fully responsive design works seamlessly on desktop, tablet, and mobile devices',
      bgColor: 'bg-teal-100',
      borderGradient: 'from-teal-400 to-teal-600',
      delay: 0.7,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Stats Bar */}
        <div ref={statsRef} className="grid grid-cols-3 gap-8 max-w-4xl mx-auto mb-20 text-center">
          <div className="group p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="text-5xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
              <span ref={membersCountRef}>0</span>+
            </div>
            <p className="text-gray-600 mt-3 font-medium">Community Members</p>
            <p className="text-xs text-gray-500 mt-1">across coworking spaces</p>
          </div>
          <div className="group p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="text-5xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">
              <span ref={gamesCountRef}>0</span>+
            </div>
            <p className="text-gray-600 mt-3 font-medium">Games Completed</p>
            <p className="text-xs text-gray-500 mt-1">with real-time updates</p>
          </div>
          <div className="group p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="text-5xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
              <span ref={connectionsCountRef}>0</span>+
            </div>
            <p className="text-gray-600 mt-3 font-medium">New Connections</p>
            <p className="text-xs text-gray-500 mt-1">made through gameplay</p>
          </div>
        </div>

        <div className="text-center mb-20">
          <h2 ref={titleRef} className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Built for Modern Coworking
          </h2>
          <p ref={subtitleRef} className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            More than just a game - it's the ultimate community builder that transforms how coworkers connect and collaborate
          </p>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <span className="mr-2">🚀</span>
            Ready to transform your coworking community?
          </div>
        </div>
      </div>
    </section>
  );
};

// Enhanced Feature Card with advanced GSAP hover effects
type Feature = {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  borderGradient: string;
  delay: number;
  highlight?: string;
};

const FeatureCard = ({ feature }: { feature: Feature; index: number }) => {
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