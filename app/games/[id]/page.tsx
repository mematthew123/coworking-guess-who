// app/games/[id]/page.tsx
import GameClient from '@/components/GameClient';
import { SanityLive } from '@/sanity/lib/live'; // Import SanityLive here

// Make the function async to properly handle params
export default async function GamePage({ params }: { params: { id: string } }) {
  // This is now properly handled
  const gameId = params.id;
  
  return (
    <main>
      {/* SanityLive must be used in the server component */}
      <SanityLive />
      <GameClient gameId={gameId} />
    </main>
  );
}

// Optionally add metadata
export const metadata = {
  title: 'Game in Progress | Coworking Guess Who',
  description: 'Play a round of Guess Who with your coworking colleagues',
};