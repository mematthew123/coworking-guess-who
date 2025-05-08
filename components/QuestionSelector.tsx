import { QuestionCategory } from '@/sanity.types';
import React, { useState } from 'react';

interface QuestionSelectorProps {
  categories: QuestionCategory[];
  onSelectQuestion: (categoryId: string, questionIndex: number) => void;
  disabled?: boolean;
}

export default function QuestionSelector({ 
  categories, 
  onSelectQuestion,
  disabled = false 
}: QuestionSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Choose a Question</h3>
      
      {/* Category Selection */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
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
          </button>
        ))}
      </div>
      
      {/* Questions List */}
      {selectedCategory && (
        <div className="space-y-2">
          {categories
            .find(c => c._id === selectedCategory)
            ?.questions?.map((question, index) => (
              <button
                key={`${selectedCategory}-${index}`}
                onClick={() => onSelectQuestion(selectedCategory, index)}
                disabled={disabled}
                className={`w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 
                  rounded-md transition-colors flex items-center
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-blue-500 mr-2">?</span>
                <span className="text-gray-700">{question.text}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}