'use client'

import { useState, useEffect } from 'react';
import { ExpandedQuestionCategory } from '@/types/groqResults';

interface QuestionSelectorProps {
  categories: ExpandedQuestionCategory[];
  onSelectQuestion: (categoryId: string, questionIndex: number) => void;
  disabled?: boolean;
  recentlyAskedIds?: string[];
}

export default function QuestionSelector({ 
  categories, 
  onSelectQuestion,
  disabled = false,
  recentlyAskedIds = []
}: QuestionSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  

  
  // Reset selected category when categories change
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories, selectedCategory]);
  
  // Generate a question ID for comparison with recently asked
  const getQuestionId = (categoryId: string, index: number) => `${categoryId}:${index}`;
  
  // Filter questions based on search term
  const filteredQuestions = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    if (!category || !category.questions) return [];
    
    if (!searchTerm) return category.questions;
    
    return category.questions.filter(q => 
      q.text?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Choose a Question</h3>
      
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
      </div>
      
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            disabled={disabled}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${selectedCategory === category._id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {category.title}
            <span className="ml-2 text-xs">
              ({filteredQuestions(category._id).length})
            </span>
          </button>
        ))}
      </div>
      
      {/* Questions List */}
      {selectedCategory && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredQuestions(selectedCategory).length > 0 ? (
            filteredQuestions(selectedCategory).map((question, index) => {
              const questionId = getQuestionId(selectedCategory, index);
              const wasRecentlyAsked = recentlyAskedIds.includes(questionId);
              
              return (
                <button
                  key={questionId}
                  onClick={() => onSelectQuestion(selectedCategory, index)}
                  disabled={disabled || wasRecentlyAsked}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center
                    ${disabled || wasRecentlyAsked 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <span className="text-blue-500 mr-2">?</span>
                  <span className="text-gray-700">{question.text}</span>
                  {wasRecentlyAsked && (
                    <span className="ml-auto text-xs text-gray-400">Recently asked</span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">
              {searchTerm 
                ? 'No questions match your search' 
                : 'No questions available in this category'}
            </p>
          )}
        </div>
      )}
      
      {!selectedCategory && (
        <p className="text-gray-500 text-center py-4">Select a category to see questions</p>
      )}
    </div>
  );
}