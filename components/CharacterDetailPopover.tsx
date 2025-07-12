'use client';

import React, { useState } from 'react';
import { MemberQuestionHistory } from '@/types/questionHistory';
import { ExpandedMember } from '@/types/groqResults';

interface CharacterDetailPopoverProps {
  member: ExpandedMember;
  history: MemberQuestionHistory;
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export default function CharacterDetailPopover({
  member,
  history,
  isOpen,
  onClose,
  anchorEl
}: CharacterDetailPopoverProps) {
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  if (!isOpen || !anchorEl) return null;

  // Calculate position relative to anchor element
  const rect = anchorEl.getBoundingClientRect();
  const style = {
    position: 'fixed' as const,
    top: rect.bottom + 8,
    left: rect.left,
    zIndex: 50,
    minWidth: 300,
    maxWidth: 400
  };

  // Adjust position if it would go off screen
  if (style.left + style.minWidth > window.innerWidth) {
    style.left = rect.right - style.minWidth;
  }
  if (style.top + 200 > window.innerHeight) {
    style.top = rect.top - 208; // Position above instead
  }

  const questionsToShow = showAllQuestions 
    ? history.questionsApplied 
    : history.questionsApplied.slice(-5);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Popover */}
      <div 
        style={style}
        className="bg-white border-2 border-gray-800 rounded-lg shadow-xl p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <h3 className="font-bold text-lg">{member.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            history.isEliminated 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {history.isEliminated ? 'Eliminated' : 'Still Possible'}
          </span>
        </div>

        {/* Question History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-gray-700">Question History</h4>
            {history.questionsApplied.length > 5 && (
              <button
                onClick={() => setShowAllQuestions(!showAllQuestions)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showAllQuestions ? 'Show Less' : `Show All (${history.questionsApplied.length})`}
              </button>
            )}
          </div>

          {questionsToShow.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No questions asked yet</p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {questionsToShow.map((question, index) => {
                const isEliminatingQuestion = history.eliminatedBy?.questionId === question.questionId;
                
                return (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      isEliminatingQuestion 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className={`flex-1 ${isEliminatingQuestion ? 'text-red-700' : 'text-gray-700'}`}>
                        {question.questionText}
                      </p>
                      <span className={`ml-2 font-semibold ${
                        question.answer ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {question.answer ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {isEliminatingQuestion && (
                      <p className="text-xs text-red-600 mt-1">
                        ↳ This question eliminated {member.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Questions</p>
            <p className="font-semibold">{history.questionsApplied.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Yes Answers</p>
            <p className="font-semibold text-green-600">
              {history.questionsApplied.filter(q => q.answer).length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">No Answers</p>
            <p className="font-semibold text-gray-600">
              {history.questionsApplied.filter(q => !q.answer).length}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}