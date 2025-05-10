// src/app/games/new/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExpandedMember } from '@/types/groqResults';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

export default function CreateGame() {
  const router = useRouter();
  const [members, setMembers] = useState<ExpandedMember[]>([]);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentUserId = "current-user-id"; // Replace with your auth logic
  
  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        const coworkingMembers = await client.fetch<ExpandedMember[]>(`
          *[_type == "member" && gameParticipation == true && _id != $currentUserId] {
            _id,
            name,
            profession,
            image
          } | order(name asc)
        `, { currentUserId });
        
        setMembers(coworkingMembers || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        setLoading(false);
        setError('Failed to load members');
      }
    }
    
    fetchMembers();
  }, [currentUserId]);
  
  async function createGame() {
    if (!selectedOpponentId) {
      setError('Please select an opponent');
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // Get all participating members for the board (including current user and opponent)
      const allParticipatingMembers = await client.fetch<string[]>(`
        *[_type == "member" && gameParticipation == true]._id
      `);
      
      // Randomly select 16-20 members for the board (must include both players)
      const numBoardMembers = Math.floor(Math.random() * 5) + 16; // 16-20 members
      const shuffledMembers = [...allParticipatingMembers].sort(() => 0.5 - Math.random());
      
      // Ensure both players are included in the board
      const boardMemberIds = shuffledMembers.slice(0, numBoardMembers);
      if (!boardMemberIds.includes(currentUserId)) {
        boardMemberIds.pop();
        boardMemberIds.push(currentUserId);
      }
      if (!boardMemberIds.includes(selectedOpponentId)) {
        boardMemberIds.pop();
        boardMemberIds.push(selectedOpponentId);
      }
      
      // Create a board with references
      const boardMembers = boardMemberIds.map(id => ({
        _key: id,
        _ref: id,
        _type: 'reference'
      }));
      
      // Create the game
      const result = await client.create({
        _type: 'game',
        startedAt: new Date().toISOString(),
        status: 'active',
        playerOne: {
          _type: 'reference',
          _ref: currentUserId
        },
        playerTwo: {
          _type: 'reference',
          _ref: selectedOpponentId
        },
        // Each player is trying to guess their opponent
        playerOneTarget: {
          _type: 'reference',
          _ref: selectedOpponentId
        },
        playerTwoTarget: {
          _type: 'reference',
          _ref: currentUserId
        },
        boardMembers: boardMembers,
        currentTurn: currentUserId, // Current user goes first
        moves: []
      });
      
      // Navigate to the new game
      router.push(`/games/${result._id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Failed to create the game. Please try again.');
      setCreating(false);
    }
  }
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Start a New Game</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Choose Your Opponent</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2">No members are available to play with</p>
            <p className="text-sm text-gray-500">Invite your coworking colleagues to join!</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-6">
            {members.map((member) => (
              <button
                key={member._id}
                onClick={() => setSelectedOpponentId(member._id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOpponentId === member._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mb-2">
                    {member.image ? (
                     <Image
                        width={64}
                        height={64} 
                        src={urlFor(member.image).url()}
                        alt={member.name || 'Member Avatar'}
                        className="w-full h-full object-cover"
                        onError={(e: { currentTarget: { src: string; }; }) => {
                          e.currentTarget.src = '/images/default-avatar.png'; // Fallback image
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100">
                        <span className="text-2xl text-blue-500 font-bold">
                          {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{member.name}</span>
                  <span className="text-xs text-gray-500">{member.profession}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={createGame}
            disabled={creating || !selectedOpponentId}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              creating || !selectedOpponentId
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {creating ? 'Creating...' : 'Start Game'}
          </button>
        </div>
      </div>
    </div>
  );
}