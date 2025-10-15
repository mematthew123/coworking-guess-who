// app/games/waiting/[invitationId]/page.tsx
import WaitingClient from '@/components/WaitingClient';
import { SanityLive } from '@/sanity/lib/live';

interface WaitingPageProps {
  params: Promise<{
    invitationId: string;
  }>;
}

export default async function WaitingPage({ params }: WaitingPageProps) {
  // Await the params object to access its properties
  const { invitationId } = await params;
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <SanityLive />
      <WaitingClient invitationId={invitationId} />
    </div>
  );
}