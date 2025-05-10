'use client'

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Session } from 'next-auth';
import useGameState from '@/hooks/useGameState';
import GameBoard from '@/components/GameBoard';
import QuestionSelector from '@/components/QuestionSelector';
import GameHistoryPanel from '@/components/GameHistoryPanel';


export default function GamePage() {
  const { data: session } = useSession();
  const playerId = (session?.user as Session["user"] & { id: string })?.id;
  const { id } = useParams();  
  const [guessMode, setGuessMode] = useState(false);
  
  const {
    game,
    boardMembers,
    eliminatedIds,
    questionCategories,
    isMyTurn,
    loading,
    error,
    askQuestion,
    makeGuess
  } = useGameState(id as string, playerId);
  
  const handleToggleMember = async (memberId: string) => {
    if (!isMyTurn) return;
    
    if (guessMode) {
      // Show confirmation dialog
      const confirmed = window.confirm("Are you sure you want to guess this member?");
      if (!confirmed) return;
      
      const isCorrect = await makeGuess(memberId);
      if (isCorrect) {
        alert("Congratulations! You guessed correctly!");
      } else {
        alert("Sorry, that's not the right person!");
      }
      setGuessMode(false);
    } else {
      // Just toggle elimination status for strategy purposes
      // This is local only and doesn't affect the game state
      // We don't need to sync this with other players
      if (eliminatedIds.includes(memberId)) {
        // Update the eliminatedIds state through the hook or appropriate logic
        eliminatedIds.splice(eliminatedIds.indexOf(memberId), 1);
      } else {
        eliminatedIds.push(memberId);
      }
    }
  };
  
  const handleAskQuestion = (categoryId: string, questionIndex: number) => {
    askQuestion(categoryId, questionIndex);
  };
  
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }
  
  if (!game) {
    return <div className="p-6">Game not found</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {game.playerOne.name} vs {game.playerTwo.name}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isMyTurn ? "Your Turn" : "Opponent's Turn"}
              </h2>
              
              {isMyTurn && (
                <button
                  onClick={() => setGuessMode(!guessMode)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    guessMode 
                      ? 'bg-red-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {guessMode ? 'Cancel Guess' : 'Make a Guess'}
                </button>
              )}
            </div>
            
            {guessMode && (
              <div className="bg-yellow-100 p-3 mb-4 rounded-md text-sm">
                <p>Click on a member card to make your final guess!</p>
              </div>
            )}
            
            <GameBoard 
              eliminatedIds={eliminatedIds}
              onToggleMember={handleToggleMember}
              readonly={!isMyTurn && !guessMode} members={[]}            />
          </div>
        </div>
        
        {/* Game Controls */}
        <div className="space-y-6">
          {/* Question Selector */}
          <QuestionSelector 
            categories={questionCategories}
            onSelectQuestion={handleAskQuestion}
            disabled={!isMyTurn || guessMode}
          />
          
          {/* Game History */}
          <GameHistoryPanel 
  moves={game.moves || []}
  currentPlayerId={playerId}
  boardMembers={boardMembers}
/>        </div>
      </div>
    </div>
  );
}