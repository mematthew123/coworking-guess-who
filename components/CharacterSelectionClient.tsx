/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

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
                    throw new Error(errorData.error || 'Failed to create game');
                }

                const { gameId } = await response.json();

                // Redirect to the game page
                router.push(`/games/${gameId}`);
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

    // Fetch invitation and characters
    useEffect(() => {
        if (!user?.id || !invitationId) return;

        async function fetchData() {
            try {
                // Get current user's Sanity ID
                const currentUser = await client.fetch(
                    `*[_type == "member" && clerkId == $clerkId][0]{ _id, name }`,
                    { clerkId: user?.id },
                );

                // Get invitation details
                const invitationData = await client.fetch(
                    `
          *[_type == "gameInvitation" && _id == $invitationId][0]{
            _id,
            status,
            fromCharacterId,
            toCharacterId,
            from->{_id, name},
            to->{_id, name}
          }
        `,
                    { invitationId },
                );

                setInvitation(invitationData);

                // Determine if we're the "from" or "to" user
                const isFromUser = invitationData.from._id === currentUser._id;

                // Check if opponent has already selected character
                const opponentCharacterId = isFromUser
                    ? invitationData.toCharacterId
                    : invitationData.fromCharacterId;
                setOpponentReady(!!opponentCharacterId);

                // Get potential characters
                const characters = await client.fetch(`
          *[_type == "member" && gameParticipation == true]{
            _id, name, profession, image
          } | order(name asc)
        `);

                setAvailableCharacters(characters || []);

                // Check if we've already selected a character
                const ourCharacterId = isFromUser
                    ? invitationData.fromCharacterId
                    : invitationData.toCharacterId;
                if (ourCharacterId) {
                    setSelectedCharacter(ourCharacterId);
                }

                setLoading(false);

                // Set up subscription to listen for opponent's character selection
                const subscription = client
                    .listen(
                        `*[_type == "gameInvitation" && _id == $invitationId][0]`,
                        { invitationId },
                    )
                    .subscribe({
                        next: (update) => {
                            if (update.result) {
                                const updatedInvitation = update.result;

                                // Check if opponent has selected their character
                                const updatedOpponentCharacterId = isFromUser
                                    ? updatedInvitation.toCharacterId
                                    : updatedInvitation.fromCharacterId;

                                setOpponentReady(!!updatedOpponentCharacterId);

                                // If we both have selected characters, create the game
                                const ourUpdatedCharacterId = isFromUser
                                    ? updatedInvitation.fromCharacterId
                                    : updatedInvitation.toCharacterId;

                                if (
                                    updatedOpponentCharacterId &&
                                    ourUpdatedCharacterId &&
                                    !submitting
                                ) {
                                    // Both players have selected characters, create the game
                                    createGame(updatedInvitation._id);
                                }
                            }
                        },
                        error: (err) => {
                            console.error(
                                'Error listening to invitation updates:',
                                err,
                            );
                        },
                    });

                return () => subscription.unsubscribe();
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load characters');
                setLoading(false);
            }
        }

        fetchData();
    }, [user?.id, invitationId, submitting, createGame]);

    // Confirm character selection
    async function confirmSelection() {
        if (!selectedCharacter || !invitation) return;

        try {
            setSubmitting(true);
            setError(null);

            // Use the new API route instead of directly updating Sanity
            const response = await fetch('/api/games/select-character', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invitationId,
                    characterId: selectedCharacter,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Failed to select character',
                );
            }

            const data = await response.json();

            // If both players have selected characters, create the game
            if (data.bothPlayersReady) {
                await createGame(invitationId);
            }
        } catch (error) {
            console.error('Error confirming character selection:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to select character',
            );
        } finally {
            if (!opponentReady) {
                setSubmitting(false);
            }
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
