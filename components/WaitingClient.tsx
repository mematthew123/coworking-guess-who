'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

export default function WaitingClient({ invitationId }: { invitationId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Setup subscription to listen for invitation changes
    const subscription = client
      .listen(`*[_type == "gameInvitation" && _id == $invitationId][0]`, { invitationId })
      .subscribe({
        next: (update) => {
          if (update.result) {
            setInvitation(update.result);
            
            // If invitation is accepted, redirect to character selection
            if (update.result.status === 'accepted') {
              router.push(`/games/setup/${invitationId}`);
            } else if (update.result.status === 'declined') {
              // If declined, go back to find opponent
              setError('Invitation was declined');
              // After a delay, go back to find opponent
              setTimeout(() => {
                router.push('/games/new');
              }, 3000);
            }
          }
          setLoading(false);
        },
        error: (err) => {
          console.error('Error listening for updates:', err);
          setError('Error monitoring invitation status');
          setLoading(false);
        }
      });
    
    // Initial fetch
    const fetchInvitation = async () => {
      try {
        const invitationData = await client.fetch(`
          *[_type == "gameInvitation" && _id == $invitationId][0]{
            _id,
            status,
            createdAt,
            from->{_id, name, image},
            to->{_id, name, image}
          }
        `, { invitationId });
        
        setInvitation(invitationData);
        setLoading(false);
        
        // Check if already accepted/declined
        if (invitationData?.status === 'accepted') {
          router.push(`/games/setup/${invitationId}`);
        } else if (invitationData?.status === 'declined') {
          setError('Invitation was declined');
          setTimeout(() => {
            router.push('/games/new');
          }, 3000);
        }
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Failed to load invitation details');
        setLoading(false);
      }
    };
    
    fetchInvitation();
    
    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [invitationId, router]);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => router.push('/games/new')}
          className="mt-2 text-sm text-red-700 underline"
        >
          Find another opponent
        </button>
      </div>
    );
  }
  
  if (!invitation) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <p className="text-yellow-700">Invitation not found</p>
        <button 
          onClick={() => router.push('/games/new')}
          className="mt-2 text-sm text-yellow-700 underline"
        >
          Go back
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Waiting for Response</h2>
      
      <div className="flex items-center justify-center mb-8">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-6">
          {invitation.from?.image ? (
            <Image
              width={64}
              height={64}
              src={urlFor(invitation.from.image).width(64).height(64).url()}
              alt={invitation.from.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl text-blue-500 font-bold">
                {invitation.from?.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 h-0.5 bg-gray-300 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
            <div className="animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="w-16 h-16 rounded-full overflow-hidden ml-6">
          {invitation.to?.image ? (
            <Image
              width={64}
              height={64}
              src={urlFor(invitation.to.image).width(64).height(64).url()}
              alt={invitation.to.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl text-purple-500 font-bold">
                {invitation.to?.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 mb-6">
        Waiting for <strong>{invitation.to?.name}</strong> to respond to your invitation.
      </p>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </button>
        
        <button
          onClick={() => router.push('/games/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Find Another Opponent
        </button>
      </div>
    </div>
  );
}