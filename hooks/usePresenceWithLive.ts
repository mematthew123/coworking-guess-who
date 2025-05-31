import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { sanityFetch } from '@/sanity/lib/live';
import { client } from '@/sanity/lib/client';

export function usePresenceWithLive() {
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);

  // Update the user's own presence
  useEffect(() => {
    if (!user?.id) return;
    
    const updatePresence = async () => {
      await fetch('/api/presence/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    };
    
    // Update presence on mount and periodically
    updatePresence();
    const interval = setInterval(updatePresence, 60000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // Get online members with Live updates
  useEffect(() => {
    const fetchOnlineMembers = async () => {
      if (!user?.id) return;
      
      try {
        // Get current user's Sanity ID
        const currentUserQuery = `*[_type == "member" && clerkId == $clerkId][0]._id`;
        const currentUserId = await client.fetch(currentUserQuery, { clerkId: user.id });
        
        // Use sanityFetch for live updates - this will automatically update when members' status changes
        const members = await sanityFetch({
          query: `
            *[_type == "member" && 
              gameParticipation == true && 
              _id != $currentUserId &&
              (onlineStatus == "online" || onlineStatus == "away")
            ] {
              _id, name, profession, image, onlineStatus, lastActive
            } | order(onlineStatus asc, lastActive desc)
          `,
          params: { currentUserId }
        });
        
        setOnlineMembers(members.data ?? members);
      } catch (error) {
        console.error('Error fetching online members:', error);
      }
    };
    
    fetchOnlineMembers();
  }, [user?.id]);

  return { onlineMembers };
}