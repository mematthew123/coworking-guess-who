'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ExpandedGame } from '@/types/groqResults';
import { client } from '@/sanity/lib/client';

export default function GamesListPage() {
  const router = useRouter();
  const [games, setGames] = useState<ExpandedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  
  const userId = "current-user-id"; // Replace with your auth logic
  
  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        
        const query = filter === 'active' 
          ? `*[_type == "game" && status == "active"]`
          : `*[_type == "game"]`;
          
        const communityGames = await client.fetch<ExpandedGame[]>(`
          ${query} {
            _id,
            startedAt,
            status,
            playerOne->{_id, name},
            playerTwo->{_id, name},
            currentTurn
          } | order(startedAt desc)
        `);
        
        setGames(communityGames || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching games:', error);
        setLoading(false);
      }
    }
    
    fetchGames();
  }, [filter]);
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Community Games</h1>
        
        <div className="flex space-x-4 items-center">
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm ${
                filter === 'active' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Active Games
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Games
            </button>
          </div>
          
          <Link 
            href="/games/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Start New Game
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : games.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No games found</h2>
          <p className="text-gray-600 mb-6">
            {filter === 'active' 
              ? 'There are no active games in the community right now.'
              : 'No games have been played yet in the community.'}
          </p>
          <Link 
            href="/games/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors inline-block"
          >
            Start a New Game
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {games.map((game) => (
            <div key={game._id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col md:flex-row">
              <div className="p-4 md:p-6 flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
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
                <p className="text-sm text-gray-500 mb-3">
                  Started: {new Date(game.startedAt || '').toLocaleDateString()}
                </p>
                
                <p className="text-sm text-gray-600">
                  Current turn: <span className="font-medium">
                    {game.currentTurn === game.playerOne._id ? game.playerOne.name : game.playerTwo.name}
                  </span>
                </p>
              </div>
              
              <div className="p-4 md:p-6 bg-gray-50 md:w-48 flex md:flex-col justify-between items-center">
                <div className="text-center mb-0 md:mb-4">
                  {game.playerOne._id === userId || game.playerTwo._id === userId ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Your Game</span>
                  ) : (
                    <span className="text-sm text-gray-500">Community Game</span>
                  )}
                </div>
                
                <button
                  onClick={() => router.push(`/games/${game._id}`)}
                  className={`px-4 py-2 rounded text-center transition-colors ${
                    game.playerOne._id === userId || game.playerTwo._id === userId
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {game.playerOne._id === userId || game.playerTwo._id === userId
                    ? 'Play Game'
                    : 'View Game'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}