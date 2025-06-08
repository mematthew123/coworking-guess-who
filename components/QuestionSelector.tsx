'use client'

import { useState, useEffect, useMemo } from 'react';
import { ExpandedQuestionCategory, ExpandedMember } from '@/types/groqResults';
import { getQuestionStats } from '@/lib/question-utils';

interface QuestionSelectorProps {
  categories: ExpandedQuestionCategory[];
  onSelectQuestion: (categoryId: string, questionIndex: number) => void;
  disabled?: boolean;
  recentlyAskedIds?: string[];
  boardMembers: ExpandedMember[];
  eliminatedIds: string[];
}

export default function QuestionSelector({ 
  categories, 
  onSelectQuestion,
  disabled = false,
  recentlyAskedIds = [],
  boardMembers,
  eliminatedIds
}: QuestionSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  
  // Get remaining members
 const remainingMembers = useMemo(() => 
    boardMembers?.filter(m => !eliminatedIds.includes(m._id)) || [],
    [boardMembers, eliminatedIds]
  );
  
  // Set initial category
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories, selectedCategory]);
  
  // Generate a question ID for comparison
  const getQuestionId = (categoryId: string, index: number) => `${categoryId}:${index}`;
  
  // Get questions for selected category with stats
  const questionsWithStats = useMemo(() => {
    const category = categories.find(c => c._id === selectedCategory);
    if (!category?.questions) return [];
    
    return category.questions.map((question, index) => ({
      ...question,
      index,
      stats: getQuestionStats(question, remainingMembers),
      wasAsked: recentlyAskedIds.includes(getQuestionId(category._id, index))
    }));
  }, [categories, selectedCategory, remainingMembers, recentlyAskedIds]);
  
  // Sort questions by effectiveness
  const sortedQuestions = useMemo(() => {
    return [...questionsWithStats].sort((a, b) => {
      // Deprioritize already asked questions
      if (a.wasAsked && !b.wasAsked) return 1;
      if (!a.wasAsked && b.wasAsked) return -1;
      
      // Sort by effectiveness (lower is better)
      return a.stats.effectiveness - b.stats.effectiveness;
    });
  }, [questionsWithStats]);
  
  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'Professional Background': '💼',
    'Technical Skills': '💻',
    'Personal Traits': '🌟',
    'Work Style': '🏢',
    'Hobbies & Interests': '🎯',
    'Experience & Background': '🌍'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Choose a Question</h3>
        <button
          onClick={() => setShowStats(!showStats)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showStats ? 'Hide' : 'Show'} Stats
        </button>
      </div>
      
      {/* Remaining members indicator */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{remainingMembers.length}</strong> possible members remaining
          {remainingMembers.length === 1 && (
            <span className="ml-2 text-blue-600 font-bold">
              Ready to make your guess!
            </span>
          )}
        </p>
      </div>
      
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            disabled={disabled}
            className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${selectedCategory === category._id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <span>{categoryIcons[category.title as string] || '❓'}</span>
            <span>{category.title}</span>
            <span className="ml-1 text-xs opacity-75">
              ({category.questions?.length || 0})
            </span>
          </button>
        ))}
      </div>
      
      {/* Questions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedQuestions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No questions available in this category
          </p>
        ) : (
          sortedQuestions.map((question) => (
            <button
              key={question._key}
              onClick={() => onSelectQuestion(selectedCategory!, question.index)}
              disabled={disabled || question.wasAsked}
              className={`w-full text-left p-3 rounded-lg transition-all
                ${disabled || question.wasAsked
                  ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                  : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{question.text}</p>
                  {question.wasAsked && (
                    <span className="text-xs text-orange-600 mt-1 inline-block">
                      Recently asked
                    </span>
                  )}
                </div>
                
                {showStats && (
                  <div className="ml-4 text-right text-sm">
                    <div className="text-green-600">
                      Yes: {question.stats.yesCount}
                    </div>
                    <div className="text-red-600">
                      No: {question.stats.noCount}
                    </div>
                    {question.stats.isOptimal && (
                      <div className="text-xs mt-1 text-blue-600 font-bold">
                        ⭐ Optimal
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
      
      {/* Tips section */}
      {remainingMembers.length > 1 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Tip:</strong> Questions marked with ⭐ will eliminate close to half the remaining members!
          </p>
        </div>
      )}
    </div>
  );
}