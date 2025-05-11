// hooks/useRealTimeGame.ts
import { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';
import { ExpandedGame } from '@/types/groqResults';
import { useUser } from '@clerk/nextjs';

export function useRealTimeGame(gameId: string) {
  const [game, setGame] = useState<ExpandedGame | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!gameId) return;

    let mounted = true;
    const POLL_INTERVAL = 5000; // 5 seconds

    async function pollGame() {
      try {
        // Get Sanity user ID
        let sanityUserId = null;
        if (user?.id) {
          const memberDoc = await client.fetch(
            `*[_type == "member" && clerkId == $clerkId][0]._id`,
            { clerkId: user.id }
          );
          sanityUserId = memberDoc;
        }

        // Fetch game data
        const gameData = await client.fetch<ExpandedGame>(`
          *[_type == "game" && _id == $gameId][0]{
            ...,
            _updatedAt,
            playerOne->{_id, name},
            playerTwo->{_id, name},
            playerOneTarget->{_id},
            playerTwoTarget->{_id},
            boardMembers[]->{
              _id, name, profession, image, skills, interests, workspacePreferences
            }
          }
        `, { gameId });
        
        if (mounted) {
          setGame(gameData);
          setLastUpdate(new Date());
          
          // Is it our turn?
          const isYourTurn = sanityUserId === gameData.currentTurn;
          
          // Did the turn change?
          if (game && game.currentTurn !== gameData.currentTurn) {
            // Turn has changed, play a sound or show notification
            if (isYourTurn) {
              try {
                // Play a sound if it's now our turn
                const audio = new Audio('/sounds/notification.mp3');
                audio.play();
              } catch (e) {
                console.log('Audio play error:', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error polling game:', err);
        if (mounted) {
          setIsActive(false);
        }
      }
    }

    // Initial fetch
    pollGame();

    // Set up polling
    const interval = setInterval(pollGame, POLL_INTERVAL);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [gameId, user?.id, game]);

  return { game, lastUpdate, isActive };
}