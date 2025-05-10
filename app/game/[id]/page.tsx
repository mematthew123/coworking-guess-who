'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';
import useGameState from '@/hooks/useGameState';
import GameBoard from '@/components/GameBoard';
import QuestionSelector from '@/components/QuestionSelector';
import GameHistoryPanel from '@/components/GameHistoryPanel';
import RealtimeIndicator from '@/components/RealtimeIndicator';
export default function GamePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [sanityUserId, setSanityUserId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [guessMode, setGuessMode] = useState(false);
  
  // Step 1: Get the Sanity user ID that corresponds to the Clerk ID
  useEffect(() => {
    async function fetchSanityUserId() {
      if (!user) return;
      
      try {
        const member = await client.fetch(
          `*[_type == "member" && clerkId == $clerkId][0]._id`,
          { clerkId: user.id }
        );
        
        if (member) {
          setSanityUserId(member);
        }
        setInitialLoading(false);
      } catch (error) {
        console.error('Error fetching Sanity user ID:', error);
        setInitialLoading(false);
      }
    }
    
    if (isLoaded) {
      fetchSanityUserId();
    }
  }, [isLoaded, user]);
  
  // Step 2: Use our game state hook once we have the Sanity user ID
const {
  game,
  boardMembers,
  eliminatedIds,
  setEliminatedIds,  // Add this line
  questionCategories,
  isMyTurn,
  loading: gameLoading,
  error,
  askQuestion,
  makeGuess
} = useGameState(id as string);
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
    // Toggle elimination locally using the setter from the hook
    if (eliminatedIds.includes(memberId)) {
      setEliminatedIds(eliminatedIds.filter(id => id !== memberId));
    } else {
      setEliminatedIds([...eliminatedIds, memberId]);
    }
  }
};
  
  const handleAskQuestion = (categoryId: string, questionIndex: number) => {
    askQuestion(categoryId, questionIndex);
  };
  
  // Handle loading states
  const loading = initialLoading || gameLoading || !isLoaded;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Handle authentication check
  if (isLoaded && !user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Sign In Required</h2>
        <p className="mb-6">You need to sign in to access this game.</p>
        <button
          onClick={() => router.push('/sign-in')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    );
  }
  
  // Handle case where user doesn't have a Sanity profile
  if (!sanityUserId) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Profile Required</h2>
        <p className="mb-6">You need to complete your profile to play games.</p>
        <button
          onClick={() => router.push('/onboarding')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Complete Profile
        </button>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-red-700 font-bold">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <h3 className="text-yellow-700 font-bold">Game Not Found</h3>
          <p className="text-yellow-700">The requested game could not be found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {game.playerOne.name} vs {game.playerTwo.name}
        </h1>
        
        {/* Add real-time indicator */}
        <RealtimeIndicator 
          lastUpdated={game._updatedAt} 
          isMyTurn={isMyTurn} 
        />
      </div>
      
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
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
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
              members={boardMembers}
              eliminatedIds={eliminatedIds}
              onToggleMember={handleToggleMember}
              readonly={!isMyTurn && !guessMode}
            />
          </div>
        </div>
        
        {/* Game Controls */}
        <div className="space-y-6">
          {/* Question Selector - Only show if it's player's turn and not in guess mode */}
          {isMyTurn && !guessMode && (
            <QuestionSelector 
              categories={questionCategories}
              onSelectQuestion={handleAskQuestion}
              disabled={!isMyTurn || guessMode}
            />
          )}
          
          {/* Game History */}
          <GameHistoryPanel 
            moves={game.moves || []}
            currentPlayerId={sanityUserId}
            boardMembers={boardMembers}
          />
          
          {/* Game Status */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Game Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  game.status === 'active' ? 'text-green-600' : 
                  game.status === 'completed' ? 'text-blue-600' : 'text-yellow-600'
                }`}>
                  {game.status === 'active' ? 'In Progress' : 
                   game.status === 'completed' ? 'Completed' : 'Abandoned'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">
                  {game.startedAt ? new Date(game.startedAt).toLocaleString() : 'Unknown'}
                </span>
              </div>
              
              {game.endedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ended:</span>
                  <span className="font-medium">
                    {new Date(game.endedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}