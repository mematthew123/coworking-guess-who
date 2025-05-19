// app/games/setup/[invitationId]/page.tsx
import CharacterSelectionClient from '@/components/CharacterSelectionClient';
import { SanityLive } from '@/sanity/lib/live';

interface CharacterSelectionPageProps {
  params: {
    invitationId: string;
  };
}

export default async function CharacterSelectionPage({ params }: CharacterSelectionPageProps) {
  // Await the params object to access its properties
  const { invitationId } = await params;
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <SanityLive />
      <CharacterSelectionClient invitationId={invitationId} />
    </div>
  );
}