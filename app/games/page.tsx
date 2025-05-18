import FindOpponentClient from '@/components/FindOpponentClient';
import { SanityLive } from '@/sanity/lib/live';

export default function page() {
  return (
    <>
      <SanityLive />
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Find an Opponent</h1>
        <FindOpponentClient />
      </div>
    </>
  );
}