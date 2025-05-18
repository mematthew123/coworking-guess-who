import { useState, useEffect } from 'react';
import { sanityFetch } from '@/sanity/lib/live'; // Now actually using this
import { ExpandedGame } from '@/types/groqResults';

export function useRealTimeGame(gameId: string, sanityUserId: string | null) {
  const [game, setGame] = useState<ExpandedGame | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [previousTurn, setPreviousTurn] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameData() {
      if (!gameId) return;

      try {
        // Use sanityFetch which supports live updates
        const result = await sanityFetch({
          query: `
            *[_type == "game" && _id == "${gameId}"][0]{
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
          `
        });

        const gameData = result.data; // Extract the actual game data

        setGame(gameData);
        setLastUpdate(new Date());

        // Check if turn has changed and it's now the user's turn
        if (gameData?.currentTurn === sanityUserId && previousTurn !== null && previousTurn !== sanityUserId) {
          playNotificationSound();
        }

        // Remember current turn for next update
        setPreviousTurn(gameData?.currentTurn);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    }

    fetchGameData();
    
    // Note: No need for polling interval as sanityFetch with SanityLive
    // automatically handles real-time updates
  }, [gameId, sanityUserId, previousTurn]);

  return { game, lastUpdate };
}

function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/turn-notification.mp3');
    audio.play();
  } catch (e) {
    console.log('Audio play error:', e);
  }
}