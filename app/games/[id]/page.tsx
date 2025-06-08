import GameClient from "@/components/GameClient";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { id: gameId } = await params;
  
  return (
    <main>
      <GameClient gameId={gameId} />
    </main>
  );
}