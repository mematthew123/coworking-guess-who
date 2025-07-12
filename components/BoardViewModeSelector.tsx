'use client';

import React from 'react';
import { BoardViewMode } from '@/types/questionHistory';

interface BoardViewModeSelectorProps {
  currentMode: BoardViewMode;
  onModeChange: (mode: BoardViewMode) => void;
  disabled?: boolean;
}

const viewModes = [
  {
    mode: BoardViewMode.Normal,
    label: 'Normal',
    icon: '👤',
    description: 'Standard game view'
  },
  {
    mode: BoardViewMode.QuestionHistory,
    label: 'History',
    icon: '📋',
    description: 'Show question results on each character'
  },
  {
    mode: BoardViewMode.EliminationPath,
    label: 'Elimination',
    icon: '❌',
    description: 'Highlight elimination reasons'
  },
  {
    mode: BoardViewMode.HeatMap,
    label: 'Heat Map',
    icon: '🔥',
    description: 'Show question frequency'
  }
];

export default function BoardViewModeSelector({
  currentMode,
  onModeChange,
  disabled = false
}: BoardViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
      <div className="flex gap-1">
        {viewModes.map(({ mode, label, icon, description }, index) => (
          <button
            key={mode}
            onClick={() => {
              if (disabled || mode === currentMode) return;
              onModeChange(mode);
            }}
            disabled={disabled}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium
              flex items-center gap-1.5
              ${currentMode === mode 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={description}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}