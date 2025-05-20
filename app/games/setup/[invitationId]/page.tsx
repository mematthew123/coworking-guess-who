;
import CharacterSelectionClient from '@/components/CharacterSelectionClient';
import { SanityLive } from '@/sanity/lib/live';

interface CharacterSelectionPageProps {
  params: {
    invitationId: string;
  };
}

export default async function CharacterSelectionPage({ params }: CharacterSelectionPageProps) {
  // Get the invitation ID from params
  const { invitationId } = await params;
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {/* Include SanityLive to enable real-time updates */}
      <SanityLive />
      <CharacterSelectionClient invitationId={invitationId} />
    </div>
  );
}