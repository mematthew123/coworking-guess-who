'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { ExpandedMember } from '@/types/groqResults';
import { gsap } from 'gsap';

interface GameBoardProps {
  members: ExpandedMember[];
  eliminatedIds: string[];
  onToggleMember: (id: string) => void;
  readonly?: boolean;
}

export default function GameBoard({ 
  members, 
  eliminatedIds, 
  onToggleMember,
  readonly = false 
}: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initial animation when board loads
  useEffect(() => {
    if (!boardRef.current || typeof window === 'undefined') return;

    // Animate cards in with stagger effect
    gsap.fromTo(
      cardRefs.current.filter(Boolean),
      {
        opacity: 0,
        scale: 0.8,
        rotationY: -90,
      },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.6,
        stagger: {
          each: 0.05,
          from: "random",
        },
        ease: "back.out(1.7)",
      }
    );
  }, [members]);

  // Animate elimination state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      
      const member = members[index];
      const isEliminated = eliminatedIds.includes(member._id);
      const crossRefs = card.querySelectorAll('.elimination-cross');
      
      if (isEliminated) {
        // Animate to eliminated state
        gsap.to(card, {
          scale: 0.95,
          duration: 0.3,
          ease: "power2.inOut",
        });
        
        // Animate the cross appearing
        gsap.fromTo(
          crossRefs,
          {
            scale: 0,
            rotation: 0,
          },
          {
            scale: 1,
            rotation: 45,
            duration: 0.4,
            stagger: 0.1,
            ease: "back.out(1.7)",
          }
        );
      } else {
        // Animate back to normal state
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: "power2.inOut",
        });
        
        // Hide the cross
        gsap.to(crossRefs, {
          scale: 0,
          duration: 0.2,
        });
      }
    });
  }, [eliminatedIds, members]);

  const handleCardClick = (memberId: string, index: number) => {
    if (readonly) return;
    
    const card = cardRefs.current[index];
    if (!card) return;

    // Bounce animation on click
    gsap.to(card, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: () => {
        onToggleMember(memberId);
      }
    });
  };

  const handleCardHover = (index: number, isHovering: boolean) => {
    if (readonly) return;
    
    const card = cardRefs.current[index];
    if (!card) return;

    gsap.to(card, {
      y: isHovering ? -8 : 0,
      boxShadow: isHovering 
        ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div 
      ref={boardRef}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4"
    >
      {members.map((member, index) => (
        <div
          key={member._id}
          ref={(el) => { cardRefs.current[index] = el; }}
          onClick={() => handleCardClick(member._id, index)}
          onMouseEnter={() => handleCardHover(index, true)}
          onMouseLeave={() => handleCardHover(index, false)}
          className={`
            relative rounded-xl overflow-hidden bg-white
            transition-all transform-gpu
            ${readonly ? '' : 'cursor-pointer'}
            ${eliminatedIds.includes(member._id) ? 'eliminated-card' : ''}
          `}
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            opacity: 1, // Ensure cards are visible by default
            transform: 'scale(1)', // Prevent layout shift
          }}
        >
          {/* Card glow effect on hover */}
          {!readonly && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
          )}
          
          {/* Member image container */}
          <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {member?.image ? (
              <Image 
                src={urlFor(member?.image).width(300).height(400).url()}
                alt={'Profile picture of ' + member.name}
                width={300}
                height={400}
                className={`
                  object-cover w-full h-full
                  transition-all duration-300
                  ${eliminatedIds.includes(member._id) ? 'grayscale brightness-50' : ''}
                `}
                priority={index < 6}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
                <span className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {member?.name?.charAt(0) ?? '?'}
                </span>
              </div>
            )}
            
            {/* Gradient overlay for eliminated cards */}
            {eliminatedIds.includes(member._id) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            )}
          </div>
          
          {/* Member info */}
          <div className="bg-white p-3 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {member.name}
            </h3>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {member.profession}
            </p>
          </div>
          
          {/* Elimination cross overlay */}
          {eliminatedIds.includes(member._id) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="elimination-cross absolute w-full h-1 bg-red-500 shadow-lg"
                style={{ transform: 'rotate(45deg)' }}
              />
              <div 
                className="elimination-cross absolute w-full h-1 bg-red-500 shadow-lg"
                style={{ transform: 'rotate(-45deg)' }}
              />
            </div>
          )}
          
          {/* Interactive hint */}
          {!readonly && !eliminatedIds.includes(member._id) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                Click to {eliminatedIds.includes(member._id) ? 'restore' : 'eliminate'}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}