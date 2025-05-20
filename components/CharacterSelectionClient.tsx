/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { sanityFetch } from '@/sanity/lib/live'; // Import sanityFetch for live updates

export default function CharacterSelectionClient({
    invitationId,
}: {
    invitationId: string;
}) {
    const [invitation, setInvitation] = useState<any>(null);
    const [availableCharacters, setAvailableCharacters] = useState<any[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
        null,
    );
    const [opponentReady, setOpponentReady] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isFromUser, setIsFromUser] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useUser();

    // Create the game when both players have selected characters
    const createGame = useCallback(
        async (invitationId: string) => {
            try {
                setSubmitting(true);
                console.log("Creating game from invitation:", invitationId);

                const response = await fetch(
                    '/api/games/create-from-invitation',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invitationId }),
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error response:", errorData);
                    throw new Error(errorData.error || 'Failed to create game');
                }

                const data = await response.json();
                console.log("Game created successfully:", data);

                // Redirect to the game page
                router.push(`/games/${data.gameId}`);
            } catch (error) {
                console.error('Error creating game:', error);
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to create game',
                );
                setSubmitting(false);
            }
        },
        [router],
    );

    // Fetch current user's Sanity ID once
    useEffect(() => {
        if (!user?.id) return;

        async function fetchCurrentUserId() {
            try {
                const userDoc = await client.fetch(
                    `*[_type == "member" && clerkId == $clerkId][0]{ _id }`,
                    { clerkId: user?.id }
                );
                
                if (userDoc) {
                    setCurrentUserId(userDoc._id);
                    console.log("Current user Sanity ID:", userDoc._id);
                }
            } catch (error) {
                console.error("Error fetching user ID:", error);
            }
        }

        fetchCurrentUserId();
    }, [user?.id]);

    // Use sanityFetch for live updates on the invitation
    useEffect(() => {
        if (!invitationId || !currentUserId) return;

        async function fetchInvitationWithLive() {
            try {
                // Use sanityFetch for real-time updates
                const result = await sanityFetch({
                    query: `*[_type == "gameInvitation" && _id == $invitationId][0]{
                        _id,
                        status,
                        fromCharacterId,
                        toCharacterId,
                        gameId,
                        from->{_id, name},
                        to->{_id, name}
                    }`,
                    params: { invitationId }
                });

                const invitationData = result.data;
                console.log("Live invitation data:", invitationData);
                
                setInvitation(invitationData);
                
                // Determine if current user is the "from" user
                const fromUser = invitationData.from._id === currentUserId;
                setIsFromUser(fromUser);
                
                // Check if opponent has selected character
                const opponentCharacterId = fromUser
                    ? invitationData.toCharacterId
                    : invitationData.fromCharacterId;
                setOpponentReady(!!opponentCharacterId);
                
                // Check if we've already selected a character
                const ourCharacterId = fromUser
                    ? invitationData.fromCharacterId
                    : invitationData.toCharacterId;
                
                if (ourCharacterId) {
                    setSelectedCharacter(ourCharacterId);
                }
                
                // If both players have selected characters and the game hasn't been created yet
                if (invitationData.fromCharacterId && invitationData.toCharacterId 
                    && invitationData.status === 'accepted' && !invitationData.gameId && !submitting) {
                    console.log("Both players have selected characters, creating game...");
                    createGame(invitationId);
                }
                
                // If game was created, redirect to the game
                if (invitationData.gameId) {
                    console.log("Game already created, redirecting to:", invitationData.gameId);
                    router.push(`/games/${invitationData.gameId}`);
                }
                
                if (loading) {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error with live invitation fetch:", error);
                setError("Error loading invitation data");
                setLoading(false);
            }
        }
        
        fetchInvitationWithLive();
    }, [invitationId, currentUserId, loading, submitting, createGame, router]);

    // Fetch available characters once
    useEffect(() => {
        if (!user?.id || loading === false) return;

        async function fetchCharacters() {
            try {
                const characters = await client.fetch(`
                    *[_type == "member" && gameParticipation == true]{
                        _id, name, profession, image
                    } | order(name asc)
                `);

                setAvailableCharacters(characters || []);
            } catch (error) {
                console.error("Error fetching characters:", error);
            }
        }

        fetchCharacters();
    }, [user?.id, loading]);

    // Confirm character selection
    async function confirmSelection() {
        if (!selectedCharacter || !invitation) return;

        try {
            setSubmitting(true);
            setError(null);
            console.log("Confirming character selection:", selectedCharacter);

            // Update character selection in Sanity
            const fieldToUpdate = isFromUser ? 'fromCharacterId' : 'toCharacterId';
            
            await client
                .patch(invitationId)
                .set({ [fieldToUpdate]: selectedCharacter })
                .commit();
                
            console.log("Character selection confirmed in database");
                
            // If opponent already selected, trigger game creation
            if (opponentReady) {
                setTimeout(() => {
                    createGame(invitationId);
                }, 1000);
            } else {
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Error confirming character selection:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to select character',
            );
            setSubmitting(false);
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className='flex justify-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded'>
                <p className='text-red-700'>{error}</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className='mt-2 text-sm text-red-700 underline'
                >
                    Back to dashboard
                </button>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded'>
                <p className='text-yellow-700'>Invitation not found</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className='mt-2 text-sm text-yellow-700 underline'
                >
                    Back to dashboard
                </button>
            </div>
        );
    }

    return (
        <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-2xl font-bold mb-4'>Choose Your Character</h2>

            <div className='mb-6 bg-blue-50 p-4 rounded-lg'>
                <p className='text-blue-800'>
                    Select a character to play as. Your opponent will try to
                    guess which character you&apos;ve chosen!
                </p>

                {opponentReady && (
                    <p className='mt-2 text-green-600 font-medium'>
                        Your opponent has already selected their character!
                    </p>
                )}
                
                {/* Show current selection info for debugging */}
                {selectedCharacter && (
                    <p className='mt-2 text-blue-800 text-sm'>
                        You have selected a character. {opponentReady ? 'Both players are ready!' : 'Waiting for opponent...'}
                    </p>
                )}
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8'>
                {availableCharacters.map((character) => (
                    <button
                        key={character._id}
                        onClick={() => setSelectedCharacter(character._id)}
                        disabled={submitting}
                        className={`p-3 rounded-lg border-2 transition-all relative ${
                            selectedCharacter === character._id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className='flex flex-col items-center'>
                            <div className='w-20 h-20 rounded-full overflow-hidden mb-2'>
                                {character.image ? (
                                    <Image
                                        width={80}
                                        height={80}
                                        src={urlFor(character.image)
                                            .width(80)
                                            .height(80)
                                            .url()}
                                        alt={character.name}
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center bg-gray-200'>
                                        <span className='text-2xl text-gray-600 font-bold'>
                                            {character.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <span className='font-medium text-center'>
                                {character.name}
                            </span>
                            <span className='text-xs text-gray-500 text-center'>
                                {character.profession}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            <div className='flex justify-between'>
                <button
                    onClick={() => router.push('/dashboard')}
                    disabled={submitting}
                    className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 transition-colors ${
                        submitting
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50'
                    }`}
                >
                    Cancel
                </button>

                <button
                    onClick={confirmSelection}
                    disabled={!selectedCharacter || submitting}
                    className={`px-6 py-2 rounded-md text-white transition-colors ${
                        !selectedCharacter || submitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {submitting
                        ? 'Processing...'
                        : opponentReady
                          ? 'Confirm & Start Game'
                          : 'Confirm Character'}
                </button>
            </div>
        </div>
    );
}