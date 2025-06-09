/* eslint-disable react/no-unescaped-entities */
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { gsap } from 'gsap';
import { useHeroTextAnimation, useFloatingAnimation, useParallax } from '@/hooks/animations';

const HeroSection = () => {
  const { isSignedIn } = useUser();
  const { titleRef, subtitleRef } = useHeroTextAnimation();
  // const badgeRef = useFloatingAnimation({ duration: 2, y: -10 });
  const backgroundRef = useParallax(0.3);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Floating avatars with GSAP
  const avatar1Ref = useFloatingAnimation({ duration: 20, y: -30 });
  const avatar2Ref = useFloatingAnimation({ duration: 25, y: -40 });
  const avatar3Ref = useFloatingAnimation({ duration: 22, y: -35 });
  const avatar4Ref = useFloatingAnimation({ duration: 28, y: -45 });
  const avatar5Ref = useFloatingAnimation({ duration: 24, y: -38 });

  useEffect(() => {
    // Animate CTA buttons
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current.children,
        {
          y: 50,
          opacity: 0,
          scale: 0.8,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          delay: 1,
          ease: 'back.out(1.7)',
        }
      );
    }

    // Animate feature cards
    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current.children,
        {
          y: 100,
          opacity: 0,
          rotateY: -30,
        },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 1,
          stagger: 0.2,
          delay: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // Animate floating avatars with random movement
    const avatars = [avatar1Ref, avatar2Ref, avatar3Ref, avatar4Ref, avatar5Ref];
    avatars.forEach((avatarRef, index) => {
      if (avatarRef.current) {
        gsap.to(avatarRef.current, {
          x: `random(-50, 50)`,
          rotation: `random(-15, 15)`,
          duration: `random(15, 25)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.5,
        });
      }
    });
  }, []);

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 2;
      const yPos = (clientY / window.innerHeight - 0.5) * 2;

      // Move avatars based on mouse position
      const avatars = [avatar1Ref, avatar2Ref, avatar3Ref, avatar4Ref, avatar5Ref];
      avatars.forEach((avatarRef, index) => {
        if (avatarRef.current) {
          gsap.to(avatarRef.current, {
            x: xPos * 20 * (index + 1),
            y: yPos * 20 * (index + 1),
            duration: 1,
            ease: 'power2.out',
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Parallax Background Pattern */}
      <div ref={backgroundRef} className="absolute inset-0 bg-hero-pattern opacity-40"></div>
      
      {/* Floating Avatar Elements with GSAP */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={avatar1Ref}
          className="absolute opacity-20"
          style={{ left: '10%', top: '20%' }}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            ?
          </div>
        </div>

        <div
          ref={avatar2Ref}
          className="absolute opacity-20"
          style={{ left: '80%', top: '60%' }}
        >
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            ?
          </div>
        </div>

        <div
          ref={avatar3Ref}
          className="absolute opacity-20"
          style={{ left: '90%', top: '10%' }}
        >
          <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            ?
          </div>
        </div>

        <div
          ref={avatar4Ref}
          className="absolute opacity-20"
          style={{ left: '20%', top: '80%' }}
        >
          <div className="w-[65px] h-[65px] rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            ?
          </div>
        </div>

        <div
          ref={avatar5Ref}
          className="absolute opacity-20"
          style={{ left: '60%', top: '40%' }}
        >
          <div className="w-[75px] h-[75px] rounded-full bg-gradient-to-br from-yellow-400 to-red-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            ?
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div  className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8">
            <span className="mr-2">🎯</span>
            <span>The Ultimate Coworking Community Game</span>
          </div>

          {/* Main Heading with GSAP animation */}
          <h1 ref={titleRef} className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Guess Who? Coworking Edition
          </h1>

          {/* Gradient text separately animated */}
          <div className="mb-6">
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Connect • Play • Discover
            </span>
          </div>

          {/* Subheading */}
          <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with your coworking community through a fun, interactive game. 
            Get to know your colleagues while playing the classic guessing game!
          </p>

          {/* CTA Buttons with GSAP animation */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {isSignedIn ? (
              <>
                <Link
                  href="/games"
                  className="group relative px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  <span className="relative z-10">Find an Opponent</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-full border-2 border-primary-600 hover:bg-primary-50 transform hover:scale-105 transition-all duration-200"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="group relative px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  <span className="relative z-10">Start Playing Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link
                  href="/sign-in"
                  className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-full border-2 border-primary-600 hover:bg-primary-50 transform hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Features Preview with GSAP stagger animation */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect & Play</h3>
              <p className="text-gray-600">Challenge your coworking colleagues to fun guessing games</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Gaming</h3>
              <p className="text-gray-600">Live updates and instant notifications when it's your turn</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Community</h3>
              <p className="text-gray-600">Learn fun facts about your coworkers while having fun</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Wave SVG */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-24 fill-current text-white" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,50 C360,0 720,100 1440,50 L1440,100 L0,100 Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;