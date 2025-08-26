'use client';

import React from 'react';
import { MemberQuestionHistory, CharacterVisualState } from '@/types/questionHistory';

interface CharacterCardOverlayProps {
  history: MemberQuestionHistory;
  visualState: CharacterVisualState;
  showDetails: boolean;
}

export default function CharacterCardOverlay({ 
  history, 
  visualState,
  showDetails 
}: CharacterCardOverlayProps) {
  // Question indicator dots
  const renderQuestionDots = () => {
    return (
      <div className="absolute top-1 right-1 flex flex-wrap gap-0.5 max-w-[60px]">
        {history.questionsApplied.map((q, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              history.eliminatedBy?.questionId === q.questionId
                ? 'bg-red-500 ring-2 ring-red-300'
                : q.answer
                ? 'bg-green-500'
                : 'bg-gray-400'
            }`}
            title={`${q.questionText}: ${q.answer ? 'Yes' : 'No'}`}
          />
        ))}
      </div>
    );
  };

  // Elimination overlay
  const renderEliminationOverlay = () => {
    if (!visualState.isEliminated) return null;

    return (
      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 pointer-events-none">
        <div className="text-white text-center">
          <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {showDetails && visualState.eliminationReason && (
            <div className="text-xs">
              <p className="font-semibold mb-1">Eliminated by:</p>
              <p className="italic">&ldquo;{visualState.eliminationReason}&rdquo;</p>
              <p className="text-red-300 mt-1">
                Answer: {history.eliminatedBy?.answer ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Visual state border
  const getBorderStyle = () => {
    if (visualState.isEliminated) return '';
    
    switch (visualState.answerPattern) {
      case 'allYes':
        return 'ring-2 ring-green-500';
      case 'allNo':
        return 'ring-2 ring-gray-500';
      case 'mixed':
        return 'ring-2 ring-yellow-500';
      default:
        return '';
    }
  };

  // Question count badge with animation
  const renderQuestionCount = () => {
    if (visualState.questionCount === 0) return null;

    return (
      <div 
        className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full font-bold"
      >
        {visualState.questionCount}Q
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {renderQuestionDots()}
      {renderEliminationOverlay()}
      {renderQuestionCount()}
      <div className={`absolute inset-0 ${getBorderStyle()}`} />
    </div>
  );
}