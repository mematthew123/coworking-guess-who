'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { ExpandedGame } from '@/types/groqResults';

export default function Dashboard() {
  const router = useRouter();
  const [games, setGames] = useState<ExpandedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = "current-user-id"; // Replace with your auth logic
  
  useEffect(() => {
    async function fetchUserGames() {
      try {
        setLoading(true);
        const userGames = await client.fetch<ExpandedGame[]>(`
          *[_type == "game" && (playerOne._ref == $userId || playerTwo._ref == $userId)] {
            _id,
            startedAt,
            status,
            playerOne->{_id, name},
            playerTwo->{_id, name},
            currentTurn
          } | order(startedAt desc)
        `, { userId });
        
        setGames(userGames || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching games:', error);
        setLoading(false);
      }
    }
    
    fetchUserGames();
  }, [userId]);
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Games</h1>
        <Link 
          href="/games/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Start New Game
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : games.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No active games</h2>
          <p className="text-gray-600 mb-6">Start a new game to begin playing with your coworking colleagues!</p>
          <Link 
            href="/games/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors inline-block"
          >
            Start Your First Game
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div key={game._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">
                    {game.playerOne.name} vs {game.playerTwo.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    game.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : game.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {game.status === 'active' ? 'Active' : 
                     game.status === 'completed' ? 'Completed' : 'Abandoned'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Started: {new Date(game.startedAt || '').toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50">
                <div className="mb-3">
                  <span className="text-sm text-gray-600 block mb-1">Current turn:</span>
                  <span className="font-medium">
                    {game.currentTurn === userId 
                      ? 'Your Turn' 
                      : `${game.currentTurn === game.playerOne._id ? game.playerOne.name : game.playerTwo.name}'s Turn`}
                  </span>
                </div>
                
                <button
                  onClick={() => router.push(`/game/${game._id}`)}
                  className={`w-full py-2 rounded text-center transition-colors ${
                    game.status === 'active'
                      ? game.currentTurn === userId
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={game.status !== 'active'}
                >
                  {game.status === 'active'
                    ? game.currentTurn === userId
                      ? 'Play Now'
                      : 'View Game'
                    : 'Game Ended'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}