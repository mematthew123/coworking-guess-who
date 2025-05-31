// hooks/useGameInvitations.ts
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { sanityFetch } from '@/sanity/lib/live';
import { client } from '@/sanity/lib/client';

export function useGameInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchInvitations = async () => {
      try {
        // Get current user's Sanity ID
        const currentUserId = await client.fetch(`
          *[_type == "member" && clerkId == $clerkId][0]._id
        `, { clerkId: user.id });
        
        // Use sanityFetch for live updates - will automatically refresh when new invitations arrive
        const invitationsList = await sanityFetch({
          query: `
            *[_type == "gameInvitation" && to._ref == $userId && status == "pending"]{
              _id,
              createdAt,
              from->{_id, name, image}
            } | order(createdAt desc)
          `,
          params: { userId: currentUserId }
        });
        
        setInvitations(invitationsList.data ?? invitationsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invitations:', error);
        setLoading(false);
      }
    };
    
    fetchInvitations();
  }, [user?.id]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const respondToInvitation = async (invitationId: string, accept: any) => {
    try {
      // Update invitation status
      await client
        .patch(invitationId)
        .set({ status: accept ? 'accepted' : 'declined' })
        .commit();
        
      return { success: true, accepted: accept, invitationId };
    } catch (error) {
      console.error('Error responding to invitation:', error);
      return { success: false, error };
    }
  };

  return { invitations, loading, respondToInvitation };
}