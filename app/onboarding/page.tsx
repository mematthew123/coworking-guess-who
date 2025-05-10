'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [gameParticipation, setGameParticipation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pre-fill form with Clerk user data
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setName(user.fullName || '');
      
      // Check if user already exists in Sanity
      async function checkUserInSanity() {
        try {
          const existingUser = await client.fetch(
            `*[_type == "member" && email == $email][0]`,
            { email: user?.primaryEmailAddress?.emailAddress }
          );
          
          if (existingUser) {
            // User already exists, update their clerk ID if needed
            if (!existingUser.clerkId) {
              await client
                .patch(existingUser._id)
                .set({ clerkId: user?.id })
                .commit();
            }
            
            // Redirect to dashboard
            router.push('/dashboard');
          }
        } catch (err) {
          console.error('Error checking user in Sanity:', err);
        }
      }
      
      checkUserInSanity();
    }
  }, [isLoaded, isSignedIn, user, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn || !user) {
      setError('You must be signed in to complete onboarding');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create a new member document in Sanity
      await client.create({
        _type: 'member',
        name,
        profession,
        email: user.primaryEmailAddress?.emailAddress,
        clerkId: user.id, // Store Clerk ID for future reference
        gameParticipation,
        joinDate: new Date().toISOString()
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating user in Sanity:', err);
      setError('Failed to complete onboarding. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Show loading state while checking authentication
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in');
    return null;
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profession">
            Profession
          </label>
          <input
            id="profession"
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g. Software Developer, Designer, Marketing Specialist"
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={gameParticipation}
              onChange={(e) => setGameParticipation(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">
              Participate in the &quot;Guess Who&quot; community game
            </span>
          </label>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-bold`}
          >
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}