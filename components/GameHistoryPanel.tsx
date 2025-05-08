import React from 'react';
import { GameMove } from '@/sanity.types';
import { ExpandedMember } from '@/types/groqResults';

interface GameHistoryPanelProps {
  moves: Array<GameMove & { _key: string }>;
  currentPlayerId: string;
  boardMembers: ExpandedMember[];
}

export default function GameHistoryPanel({ 
  moves, 
  currentPlayerId}: GameHistoryPanelProps) {
  // Sort moves by timestamp (newest first)
  const sortedMoves = [...moves].sort((a, b) => {
    const dateA = new Date(a.timestamp || '');
    const dateB = new Date(b.timestamp || '');
    return dateB.getTime() - dateA.getTime();
  });
  
  // Format date for better readability
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  // No moves yet
  if (sortedMoves.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Game History</h3>
        <div className="text-center py-6 text-gray-500">
          <p>No questions have been asked yet</p>
          <p className="text-sm mt-2">The history of all moves will appear here</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Game History</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {sortedMoves.map((move) => {
          const isCurrentPlayer = move.playerId === currentPlayerId;
          
          return (
            <div 
              key={move._key} 
              className={`rounded-lg border ${
                isCurrentPlayer 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isCurrentPlayer ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="font-medium">
                    {isCurrentPlayer ? 'You' : (move.playerName || 'Opponent')}
                  </span>
                </div>
                <time className="text-xs text-gray-500">
                  {formatDate(move.timestamp)}
                </time>
              </div>
              
              <div className="p-3">
                <div className="flex items-start mb-2">
                  <span className="text-gray-700 font-medium mr-1">Q:</span>
                  <span className="text-gray-700">{move.questionText}</span>
                </div>
                
                <div className="flex items-center mt-3">
                  <span className="text-gray-700 font-medium mr-1">A:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    move.answer 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {move.answer ? 'Yes' : 'No'}
                  </span>
                  
                  {move.eliminatedCount !== undefined && (
                    <span className="ml-auto text-sm text-gray-500">
                      {move.eliminatedCount} eliminated
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedMoves.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-blue-500 text-sm hover:underline">
            View All History
          </button>
        </div>
      )}
    </div>
  );
}