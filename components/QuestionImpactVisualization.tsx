'use client';

import React from 'react';
import { QuestionImpact } from '@/types/questionHistory';
import { ExpandedMember } from '@/types/groqResults';

interface QuestionImpactVisualizationProps {
  impacts: QuestionImpact[];
  boardMembers: ExpandedMember[];
  currentQuestionIndex?: number;
}

export default function QuestionImpactVisualization({
  impacts,
  boardMembers,
  currentQuestionIndex = impacts.length - 1
}: QuestionImpactVisualizationProps) {
  if (impacts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No questions asked yet
      </div>
    );
  }

  const currentImpact = impacts[currentQuestionIndex];
  const totalMembers = boardMembers.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Question Impact Timeline</h3>
      
      {/* Timeline Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {/* Navigate to previous question */}}
          disabled={currentQuestionIndex === 0}
          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          ← Previous
        </button>
        
        <span className="text-sm font-medium">
          Question {currentQuestionIndex + 1} of {impacts.length}
        </span>
        
        <button
          onClick={() => {/* Navigate to next question */}}
          disabled={currentQuestionIndex === impacts.length - 1}
          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* Impact Visualization */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Eliminated</p>
            <p className="text-2xl font-bold text-red-600">
              {currentImpact.membersEliminated.length}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-green-600">
              {currentImpact.membersRemaining.length}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Efficiency</p>
            <p className="text-2xl font-bold text-blue-600">
              {currentImpact.eliminationPercentage.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Visual Grid */}
        <div className="border-2 border-gray-200 rounded p-4">
          <p className="text-sm font-medium mb-2">Board State After Question {currentQuestionIndex + 1}</p>
          <div className="grid grid-cols-8 gap-1">
            {boardMembers.map(member => {
              const isEliminated = currentImpact.membersEliminated.includes(member._id);
              const wasEliminatedBefore = currentQuestionIndex > 0 && 
                !impacts[currentQuestionIndex - 1].membersRemaining.includes(member._id);
              
              return (
                <div
                  key={member._id}
                  className={`
                    aspect-square rounded-sm transition-all
                    ${isEliminated ? 'bg-red-500' : 
                      wasEliminatedBefore ? 'bg-gray-300' : 'bg-green-500'}
                  `}
                  title={member.name}
                />
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Start: {totalMembers} members</span>
            <span>Current: {currentImpact.membersRemaining.length} members</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ 
                width: `${(currentImpact.membersRemaining.length / totalMembers) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}