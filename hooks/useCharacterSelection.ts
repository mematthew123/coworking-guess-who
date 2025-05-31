import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { sanityFetch } from '@/sanity/lib/live';
import { client } from '@/sanity/lib/client';

// Define the BoardMember type
interface BoardMember {
  _id: string;
  name: string;
  profession: string;
  image: string;
}

interface Invitation {
  _id: string;
  status: string;
  from: { _id: string; name: string };
  to: { _id: string; name: string };
  fromCharacterId?: string;
  toCharacterId?: string;
}

export function useCharacterSelection(invitationId: string) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<BoardMember | null>(null);
  const [opponentSelected, setOpponentSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  
  // Fetch initial data
  useEffect(() => {
    if (!user?.id || !invitationId) return;
    
    const fetchData = async () => {
      try {
        // Get current user's Sanity ID
        const currentUserId = await client.fetch(`
          *[_type == "member" && clerkId == $clerkId][0]._id
        `, { clerkId: user.id });
        
        // Use sanityFetch for live updates on the invitation
        const invitationData = await sanityFetch({
          query: `
            *[_type == "gameInvitation" && _id == $invitationId][0]{
              _id,
              status,
              from->{_id, name},
              to->{_id, name},
              fromCharacterId,
              toCharacterId
            }
          `,
          params: { invitationId }
        });
        
        setInvitation(invitationData.data);
        
        // Determine if we're the from or to user
        const isFromUser = invitationData.data.from._id === currentUserId;
        
        // Check if the opponent has selected their character
        setOpponentSelected(
          isFromUser ? !!invitationData.data.toCharacterId : !!invitationData.data.fromCharacterId
        );
        
        // Set our selected character if we've already chosen one
        const ourCharacterId = isFromUser ? invitationData.data.fromCharacterId : invitationData.data.toCharacterId;
        
        // Get potential board members (for character selection)
        const members = await client.fetch(`
          *[_type == "member" && gameParticipation == true]{
            _id, name, profession, image
          } | order(name asc)
        `);
        
        setBoardMembers(members);
        
        // Set our selected character if we've already chosen one
        if (ourCharacterId) {
          const ourCharacter = members.find((m: BoardMember) => m._id === ourCharacterId);
          if (ourCharacter) {
            setSelectedCharacter(ourCharacter);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id, invitationId]);
  
  // Function to save character selection
  const confirmCharacterSelection = async () => {
    if (!selectedCharacter || !invitation) return { success: false };
    
    try {
      // Get current user's Sanity ID
      if (!user?.id) {
        throw new Error('User is not defined');
      }
      const currentUser = await client.fetch(`
        *[_type == "member" && clerkId == $clerkId][0]._id
      `, { clerkId: user.id });
      
      const isInviter = invitation.from._id === currentUser;
      
      // Update invitation with character selection
      await client
        .patch(invitationId)
        .set({
          [isInviter ? 'fromCharacterId' : 'toCharacterId']: selectedCharacter._id
        })
        .commit();
      
      return { success: true };
    } catch (error) {
      console.error('Error selecting character:', error);
      return { success: false, error };
    }
  };
  
  return {
    invitation,
    boardMembers,
    selectedCharacter,
    setSelectedCharacter,
    opponentSelected,
    loading,
    confirmCharacterSelection
  };
}