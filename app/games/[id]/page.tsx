import GameClient from '@/components/GameClient';

// Temporary solution to bypass TypeScript error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function GamePage(props: any) {
  const gameId = await props.params?.id;
  
  return (
    <main>
      <GameClient gameId={gameId} />
    </main>
  );
}