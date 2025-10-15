import { auth } from '@clerk/nextjs/server';
import FindOpponentClient from '@/components/FindOpponentClient';
import Link from 'next/link';

export default async function page() {
 
  // Check if the user is authenticated
  const { userId } = await auth();
  if (!userId) {
    // If not authenticated, redirect to the sign-in page
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto p-8 max-w-3xl">
          <div className="bg-white border-8 border-black shadow-brutal-xl p-12">
            <h1 className="font-display text-6xl font-black uppercase mb-8 text-black -rotate-2">
              PLEASE<br />
              <span className="text-pink brutalist-text-shadow">SIGN IN</span>
            </h1>
            
            <div className="bg-yellow border-4 border-black p-6 mb-8 shadow-brutal-md">
              <p className="text-xl font-bold uppercase tracking-tight">
                You need to be signed in to find an opponent!
              </p>
            </div>
            
            <Link 
              href="/sign-in" 
              className="inline-block bg-blue text-white border-6 border-black px-12 py-6 font-display text-2xl font-black uppercase tracking-wide shadow-brutal-md hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-lg transition-all duration-100"
            >
              SIGN IN NOW →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mint">
      <div className="container mx-auto p-8 max-w-3xl">
        {/* Header Section */}
        <div className="bg-pink border-8 border-black shadow-brutal-xl p-8 mb-8 -rotate-1">
          <h1 className="font-display text-7xl font-black uppercase text-white tracking-tighter leading-none">
            FIND AN<br />
            <span className="text-yellow brutalist-text-outline">OPPONENT</span>
          </h1>
        </div>
        
        {/* Main Content */}
        <div className="bg-white border-8 border-black shadow-brutal-lg p-8 rotate-1">
          <div className="bg-lavender border-4 border-black p-6 mb-6 shadow-brutal-md">
            <p className="font-mono text-lg font-bold uppercase">
              Ready to test your knowledge and skills?<br />
              Click the button below to find an opponent and start playing! 
            </p>
          </div>
          
          <FindOpponentClient />
        </div>
        
        {/* Decorative Elements */}
        <div className="fixed bottom-8 right-8 bg-orange border-6 border-black p-4 shadow-brutal-md animate-shake rotate-12">
          <span className="font-display text-2xl font-black uppercase">VS</span>
        </div>
        
        <div className="fixed top-20 right-12 bg-green border-4 border-black p-3 shadow-brutal-sm -rotate-6">
          <span className="font-mono text-sm font-bold">ONLINE</span>
        </div>
      </div>
    </div>
  );
}
