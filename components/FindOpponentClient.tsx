'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { client } from '@/sanity/lib/client';

export default function FindOpponentClient() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [, setSanityUserId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('');
  const [inviting, setInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update the current user's presence
  const updateUserPresence = useCallback(async () => {
    if (!user) return;
    
    try {
      await fetch('/api/presence/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user]);

  // Fetch user ID and online members
  useEffect(() => {
    async function fetchData() {
      if (!isLoaded || !user) return;
      
      try {
        setLoading(true);
        
        // Get the Sanity member ID for the current Clerk user
        const memberDoc = await client.fetch(
          `*[_type == "member" && clerkId == $clerkId][0]`,
          { clerkId: user.id }
        );
        
        if (memberDoc) {
          setSanityUserId(memberDoc._id);
          
          // Fetch members who are online or recently active
          const coworkingMembers = await client.fetch(`
            *[_type == "member" && 
              gameParticipation == true && 
              _id != $currentUserId &&
              (onlineStatus == "online" || onlineStatus == "away")
            ] {
              _id,
              name,
              profession,
              image,
              onlineStatus,
              lastActive
            } | order(onlineStatus asc, lastActive desc)
          `, { currentUserId: memberDoc._id });
          
          setOnlineMembers(coworkingMembers || []);
        } else {
          // No profile found
          setError('You need to complete your profile before creating a game');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        setError('Failed to load members');
      }
    }
    
    fetchData();
    
    // Update presence for the current user
    updateUserPresence();
    const interval = setInterval(updateUserPresence, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [isLoaded, updateUserPresence, user]);
  
  // Invite another player
  async function invitePlayer() {
    if (!selectedOpponentId) {
      setError('Please select an opponent');
      return;
    }
    
    try {
      setInviting(true);
      setError(null);
      
      const response = await fetch('/api/games/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opponentId: selectedOpponentId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }
      
      const { invitation } = await response.json();
      
      // Redirect to waiting screen
      router.push(`/games/waiting/${invitation._id}`);
    } catch (error) {
      console.error('Error inviting player:', error);
      setError(error instanceof Error ? error.message : 'Failed to send invitation');
      setInviting(false);
    }
  }
  
  // Render status badge for each member
  function renderStatusBadge(status: string) {
    switch(status) {
      case 'online':
        return (
          <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full 
            border-2 border-white shadow-sm" title="Online"></span>
        );
      case 'away':
        return (
          <span className="absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full 
            border-2 border-white shadow-sm" title="Away"></span>
        );
      default:
        return (
          <span className="absolute top-2 right-2 w-3 h-3 bg-gray-400 rounded-full 
            border-2 border-white shadow-sm" title="Offline"></span>
        );
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error && !onlineMembers.length) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
        {error === 'You need to complete your profile before creating a game' && (
          <button 
            onClick={() => router.push('/onboarding')}
            className="mt-2 text-sm text-red-700 underline"
          >
            Complete your profile
          </button>
        )}
      </div>
    );
  }
  
  // No online members
  if (onlineMembers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No members are currently online</h2>
        <p className="text-gray-600 mb-6">Try again later or invite your coworking colleagues to join!</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Choose Who To Play Against</h2>
      <p className="text-gray-600 mb-6">
        Select another coworking member to challenge to a game of Guess Who.
        You&#39;ll both choose your own characters to play as!
      </p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-6">
        {onlineMembers.map((member) => (
          <button
            key={member._id}
            onClick={() => setSelectedOpponentId(member._id)}
            className={`p-4 rounded-lg border-2 transition-all relative ${
              selectedOpponentId === member._id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {renderStatusBadge(member.onlineStatus)}
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mb-2">
                {member.image ? (
                  <Image
                    width={64}
                    height={64} 
                    src={urlFor(member.image).url()}
                    alt={member.name || 'Member Avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png';
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
              <span className="text-xs italic mt-1">
                {member.onlineStatus === 'online' ? 'Online now' : 'Recently active'}
              </span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={invitePlayer}
          disabled={inviting || !selectedOpponentId}
          className={`px-6 py-2 rounded-md text-white transition-colors ${
            inviting || !selectedOpponentId
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {inviting ? 'Sending Invitation...' : 'Invite to Play'}
        </button>
      </div>
    </div>
  );
}