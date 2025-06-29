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

    // Harsh card entrance
    gsap.fromTo(
      cardRefs.current.filter(Boolean),
      {
        opacity: 0,
        scale: 0,
        rotate: () => Math.random() * 30 - 15,
      },
      {
        opacity: 1,
        scale: 1,
        rotate: () => Math.random() * 6 - 3,
        duration: 0.2,
        stagger: {
          each: 0.03,
          from: "random",
        },
        ease: "none",
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
        // Harsh elimination effect
        gsap.to(card, {
          scale: 0.9,
          rotate: 0,
          duration: 0.1,
          ease: "none",
        });
        
        // Slam the cross on
        gsap.fromTo(
          crossRefs,
          {
            scale: 0,
          },
          {
            scale: 1,
            duration: 0.1,
            ease: "none",
          }
        );
      } else {
        // Snap back to normal
        gsap.to(card, {
          scale: 1,
          duration: 0.1,
          ease: "none",
        });
        
        // Hide the cross instantly
        gsap.set(crossRefs, {
          scale: 0,
        });
      }
    });
  }, [eliminatedIds, members]);

  const handleCardClick = (memberId: string, index: number) => {
    if (readonly) return;
    
    const card = cardRefs.current[index];
    if (!card) return;

    // Harsh click feedback
    gsap.to(card, {
      scale: 0.85,
      duration: 0.05,
      yoyo: true,
      repeat: 1,
      ease: "none",
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
      x: isHovering ? -4 : 0,
      y: isHovering ? -4 : 0,
      duration: 0.1,
      ease: "none",
    });
  };

  const getCardColor = (index: number) => {
    const colors = ['bg-yellow', 'bg-pink', 'bg-green', 'bg-blue', 'bg-orange', 'bg-purple'];
    return colors[index % colors.length];
  };

  return (
    <div 
      ref={boardRef}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-6 bg-cream"
    >
      {members.map((member, index) => (
        <div
          key={member._id}
          ref={(el) => { cardRefs.current[index] = el; }}
          onClick={() => handleCardClick(member._id, index)}
          onMouseEnter={() => handleCardHover(index, true)}
          onMouseLeave={() => handleCardHover(index, false)}
          className={`
            relative bg-white border-6 border-black
            transition-all transform-gpu
            ${readonly ? '' : 'cursor-pointer hover:shadow-brutal-xl'}
            ${eliminatedIds.includes(member._id) ? 'eliminated-card' : ''}
            shadow-brutal-md
          `}
          style={{
            transform: `rotate(${Math.random() * 6 - 3}deg)`,
          }}
        >
          {/* Member image container */}
          <div className={`relative aspect-[3/4] ${getCardColor(index)} border-b-6 border-black overflow-hidden`}>
            {member?.image ? (
              <Image 
                src={urlFor(member?.image).width(300).height(400).url()}
                alt={'Profile picture of ' + member.name}
                width={300}
                height={400}
                className={`
                  object-cover w-full h-full
                  transition-all duration-100
                  ${eliminatedIds.includes(member._id) ? 'grayscale brightness-50' : ''}
                `}
                priority={index < 6}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-black">
                <span className="text-8xl font-black text-white">
                  {member?.name?.charAt(0) ?? '?'}
                </span>
              </div>
            )}
            
            {/* Black overlay for eliminated cards */}
            {eliminatedIds.includes(member._id) && (
              <div className="absolute inset-0 bg-black/70 pointer-events-none" />
            )}
          </div>
          
          {/* Member info */}
          <div className="bg-white p-4">
            <h3 className="font-black text-black uppercase truncate text-base">
              {member.name}
            </h3>
            <p className="text-sm font-bold uppercase text-black/80 truncate mt-1">
              {member.profession}
            </p>
          </div>
          
          {/* Elimination cross overlay */}
          {eliminatedIds.includes(member._id) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="elimination-cross absolute w-full h-2 bg-red border-2 border-black"
                style={{ transform: 'rotate(45deg)' }}
              />
              <div 
                className="elimination-cross absolute w-full h-2 bg-red border-2 border-black"
                style={{ transform: 'rotate(-45deg)' }}
              />
            </div>
          )}
          
          {/* Interactive hint */}
          {!readonly && !eliminatedIds.includes(member._id) && (
            <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-100">
              <div className="bg-black text-yellow font-bold uppercase text-xs px-3 py-1 border-2 border-yellow">
                {eliminatedIds.includes(member._id) ? 'RESTORE' : 'ELIMINATE'}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
