/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { ExpandedMember } from '@/types/groqResults';
import { BoardViewMode } from '@/types/questionHistory';
import { useQuestionHistory } from '@/hooks/useQuestionHistory';
import CharacterCardOverlay from './CharacterCardOverlay';
import CharacterDetailPopover from './CharacterDetailPopover';
import BoardViewModeSelector from './BoardViewModeSelector';

interface GameBoardProps {
  members: ExpandedMember[];
  eliminatedIds: string[];
  onToggleMember: (id: string) => void;
  readonly?: boolean;
  moves?: any[];
  categories?: any[];
  currentPlayerId?: string;
}

export default function GameBoard({ 
  members, 
  eliminatedIds, 
  onToggleMember,
  readonly = false,
  moves = [],
  categories = [],
  currentPlayerId = ''
}: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [viewMode, setViewMode] = useState<BoardViewMode>(BoardViewMode.Normal);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  
  // Use question history hook
  const { memberHistories, getMemberVisualState } = useQuestionHistory(
    members,
    moves,
    categories,
    currentPlayerId
  );
  
  // No animations - instant updates only

  const handleCardClick = (memberId: string, event: React.MouseEvent<HTMLDivElement>) => {
    if (readonly && viewMode === BoardViewMode.Normal) return;
    
    // If in history view modes, show popover instead
    if (viewMode !== BoardViewMode.Normal) {
      setSelectedMemberId(memberId);
      setPopoverAnchor(event.currentTarget);
      return;
    }

    // Instant toggle
    onToggleMember(memberId);
  };

  const handleCardHover = (memberId: string, isHovering: boolean) => {
    if (readonly && viewMode === BoardViewMode.Normal) return;
    setHoveredMemberId(isHovering ? memberId : null);
  };

  const getCardColor = (index: number) => {
    const colors = ['bg-yellow', 'bg-pink', 'bg-green', 'bg-blue', 'bg-orange', 'bg-purple'];
    return colors[index % colors.length];
  };

  return (
    <div>
      {/* View Mode Selector with fade animation */}
      <div className="mb-4 px-6 transition-all duration-300 ease-in-out">
        <BoardViewModeSelector
          currentMode={viewMode}
          onModeChange={setViewMode}
          disabled={false}
        />
      </div>
      
      {/* Game Board Grid */}
      <div 
        ref={boardRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-6 bg-cream"
      >
      {members.map((member, index) => (
        <div
          key={member._id}
          ref={(el) => { cardRefs.current[index] = el; }}
          onClick={(e) => handleCardClick(member._id, e)}
          onMouseEnter={() => handleCardHover(member._id, true)}
          onMouseLeave={() => handleCardHover(member._id, false)}
          className={`
            relative bg-white border-6 border-black
            transition-all transform-gpu will-change-transform
            ${readonly ? '' : 'cursor-pointer hover:shadow-brutal-xl'}
            ${eliminatedIds.includes(member._id) ? 'eliminated-card' : ''}
            shadow-brutal-md
          `}
          style={{
            transform: `rotate(${Math.random() * 6 - 3}deg)`
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
          
          {/* Question History Overlay with animation class */}
          {viewMode !== BoardViewMode.Normal && memberHistories.get(member._id) && (
            <div className="question-overlay">
              <CharacterCardOverlay
                history={memberHistories.get(member._id)!}
                visualState={getMemberVisualState(member._id)!}
                showDetails={hoveredMemberId === member._id}
              />
            </div>
          )}
          
          {/* Elimination cross overlay - only in normal mode */}
          {viewMode === BoardViewMode.Normal && eliminatedIds.includes(member._id) && (
            <div className="elimination-overlay absolute inset-0 flex items-center justify-center pointer-events-none">
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
      
      {/* Character Detail Popover */}
      {selectedMemberId && popoverAnchor && (
        <CharacterDetailPopover
          member={members.find(m => m._id === selectedMemberId)!}
          history={memberHistories.get(selectedMemberId)!}
          isOpen={true}
          onClose={() => {
            setSelectedMemberId(null);
            setPopoverAnchor(null);
          }}
          anchorEl={popoverAnchor}
        />
      )}
    </div>
  );
}
