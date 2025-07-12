import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { browserClient } from '@/sanity/lib/client';

interface OnlineMember {
  _id: string;
  name: string;
  profession: string;
  image?: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
  onlineStatus: 'online' | 'away' | 'offline';
  lastActive: string;
}

export function usePresence() {
  const { user } = useUser();
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update the user's own presence
  const updatePresence = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await fetch('/api/presence/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user?.id]);

  // Call the cleanup endpoint periodically
  const cleanupStalePresence = useCallback(async () => {
    try {
      await fetch('/api/presence/update', {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error cleaning up stale presence:', error);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subscription: any;
    let presenceInterval: NodeJS.Timeout;
    let cleanupInterval: NodeJS.Timeout;

    const setupPresence = async () => {
      try {
        setLoading(true);
        
        // Get current user's Sanity ID
        const currentUserQuery = `*[_type == "member" && clerkId == $clerkId][0]._id`;
        const userId = await browserClient.fetch(currentUserQuery, { clerkId: user.id });
        
        if (!userId) {
          setError('User profile not found');
          setLoading(false);
          return;
        }
        
        setCurrentUserId(userId);
        
        // Initial fetch of online members
        const membersQuery = `
          *[_type == "member" && 
            gameParticipation == true && 
            _id != $currentUserId &&
            (onlineStatus == "online" || onlineStatus == "away")
          ] {
            _id, name, profession, image, onlineStatus, lastActive
          } | order(onlineStatus asc, lastActive desc)
        `;
        
        const initialMembers = await browserClient.fetch(membersQuery, { currentUserId: userId });
        setOnlineMembers(initialMembers);
        
        // Set up real-time subscription
        const params = { currentUserId: userId };
        subscription = browserClient
          .listen(membersQuery, params)
          .subscribe({
            next: () => {
              // Re-fetch the full list when there's an update
              browserClient.fetch(membersQuery, params).then(setOnlineMembers);
            },
            error: (err) => {
              console.error('Subscription error:', err);
              setError('Failed to subscribe to updates');
            }
          });
        
        setLoading(false);
        
        // Update own presence immediately and periodically
        updatePresence();
        presenceInterval = setInterval(updatePresence, 60000); // Every minute
        
        // Cleanup stale presence every 30 seconds
        cleanupStalePresence();
        cleanupInterval = setInterval(cleanupStalePresence, 30000);
        
      } catch (error) {
        console.error('Error setting up presence:', error);
        setError('Failed to load online members');
        setLoading(false);
      }
    };

    setupPresence();

    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (presenceInterval) {
        clearInterval(presenceInterval);
      }
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
    };
  }, [user?.id, updatePresence, cleanupStalePresence]);

  return { onlineMembers, currentUserId, loading, error };
}