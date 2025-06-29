/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    const [gameCreationInProgress, setGameCreationInProgress] = useState(false);
    const router = useRouter();
    const { user } = useUser();
    const subscriptionRef = useRef<any>(null);
    const isFromUserRef = useRef<boolean>(false);

    // Create the game when both players have selected characters
    const createGame = useCallback(
        async (invitationId: string) => {
            // Prevent multiple game creation attempts
            if (gameCreationInProgress) {
                console.log('Game creation already in progress, skipping...');
                return;
            }

            try {
                setGameCreationInProgress(true);
                setSubmitting(true);
                console.log('Creating game from invitation:', invitationId);

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
                console.log('Game created successfully:', gameId);

                // Unsubscribe before redirecting
                if (subscriptionRef.current) {
                    subscriptionRef.current.unsubscribe();
                }

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
                setGameCreationInProgress(false);
            }
        },
        [router, gameCreationInProgress],
    );
    // Check if both players are ready and create game if needed
    const checkAndCreateGame = useCallback(
        async (invitationData: any, isFromUser: boolean) => {
            console.log('Checking if both players are ready...', {
                fromCharacterId: invitationData.fromCharacterId,
                toCharacterId: invitationData.toCharacterId,
                gameCreationInProgress,
                submitting,
            });

            if (
                invitationData.fromCharacterId &&
                invitationData.toCharacterId &&
                !gameCreationInProgress &&
                !submitting
            ) {
                console.log('Both players ready! Creating game...');
                // Only the "from" player creates the game to avoid race conditions
                if (isFromUser) {
                    await createGame(invitationData._id);
                } else {
                    // If we're the "to" player, wait a moment then check if game was created
                    setTimeout(async () => {
                        const updatedInvitation = await client.fetch(
                            `*[_type == "gameInvitation" && _id == $invitationId][0]{ gameId }`,
                            { invitationId: invitationData._id },
                        );

                        if (updatedInvitation?.gameId) {
                            console.log(
                                'Game was created by other player, redirecting...',
                            );
                            router.push(`/games/${updatedInvitation.gameId}`);
                        } else {
                            // If no game was created after waiting, we create it
                            console.log(
                                'No game created by other player, creating now...',
                            );
                            await createGame(invitationData._id);
                        }
                    }, 2000); // Wait 2 seconds
                }
            }
        },
        [createGame, gameCreationInProgress, submitting, router],
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
                        to->{_id, name},
                        gameId
                    }
                    `,
                    { invitationId },
                );

                // If game already exists, redirect
                if (invitationData?.gameId) {
                    console.log('Game already exists, redirecting...');
                    router.push(`/games/${invitationData.gameId}`);
                    return;
                }

                setInvitation(invitationData);

                // Determine if we're the "from" or "to" user
                const isFromUser = invitationData.from._id === currentUser._id;
                isFromUserRef.current = isFromUser;

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

                // Check if we should create the game immediately
                await checkAndCreateGame(invitationData, isFromUser);

                // Set up subscription to listen for opponent's character selection
                const subscription = client
                    .listen(
                        `*[_type == "gameInvitation" && _id == $invitationId]`,
                        { invitationId },
                    )
                    .subscribe({
                        next: async (update) => {
                            console.log('Invitation update received:', update);
                            if (update.result) {
                                const updatedInvitation = update.result;

                                // If game was created, redirect
                                if (updatedInvitation.gameId) {
                                    console.log('Game created, redirecting...');
                                    router.push(
                                        `/games/${updatedInvitation.gameId}`,
                                    );
                                    return;
                                }

                                // Check if opponent has selected their character
                                const updatedOpponentCharacterId =
                                    isFromUserRef.current
                                        ? updatedInvitation.toCharacterId
                                        : updatedInvitation.fromCharacterId;

                                setOpponentReady(!!updatedOpponentCharacterId);

                                // Check if we should create the game
                                await checkAndCreateGame(
                                    updatedInvitation,
                                    isFromUserRef.current,
                                );
                            }
                        },
                        error: (err) => {
                            console.error(
                                'Error listening to invitation updates:',
                                err,
                            );
                        },
                    });

                subscriptionRef.current = subscription;
                return () => subscription.unsubscribe();
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load characters');
                setLoading(false);
            }
        }

        fetchData();
    }, [user?.id, invitationId, router, checkAndCreateGame]);

    // Confirm character selection
    async function confirmSelection() {
        if (!selectedCharacter || !invitation) return;

        try {
            setSubmitting(true);
            setError(null);

            console.log('Confirming character selection:', selectedCharacter);

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
            console.log('Character selection response:', data);

            // If both players have selected characters, check if we should create the game
            if (data.bothPlayersReady) {
                // Re-fetch the invitation to get the latest state
                const latestInvitation = await client.fetch(
                    `*[_type == "gameInvitation" && _id == $invitationId][0]{
                        _id,
                        fromCharacterId,
                        toCharacterId,
                        gameId
                    }`,
                    { invitationId },
                );

                if (!latestInvitation.gameId) {
                    await checkAndCreateGame(
                        latestInvitation,
                        isFromUserRef.current,
                    );
                }
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
        <div className='flex justify-center items-center min-h-[50vh] bg-cream'>
            <div className='bg-pink border-8 border-black p-8 shadow-brutal-xl animate-pulse'>
                <div className='text-6xl font-black uppercase'>LOADING...</div>
            </div>
        </div>
    );
}

// Error state
if (error) {
    return (
        <div className='bg-red border-8 border-black p-6 shadow-brutal-xl'>
            <p className='text-white font-black uppercase text-xl'>{error}</p>
            <button
                onClick={() => router.push('/dashboard')}
                className='mt-4 bg-black text-red font-black uppercase px-6 py-3 border-4 border-red shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100'
            >
                BACK TO DASHBOARD
            </button>
        </div>
    );
}

if (!invitation) {
    return (
        <div className='bg-yellow border-8 border-black p-6 shadow-brutal-xl'>
            <p className='text-black font-black uppercase text-xl'>INVITATION NOT FOUND!</p>
            <button
                onClick={() => router.push('/dashboard')}
                className='mt-4 bg-black text-yellow font-black uppercase px-6 py-3 border-4 border-yellow shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100'
            >
                BACK TO DASHBOARD
            </button>
        </div>
    );
}

return (
    <div className='min-h-screen bg-cream relative overflow-hidden'>
        {/* Geometric Background */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div className='absolute top-10 left-20 w-48 h-48 bg-pink border-8 border-black rotate-12' />
            <div className='absolute bottom-20 right-10 w-64 h-32 bg-blue border-8 border-black -rotate-6' />
            <div className='absolute top-1/2 right-1/3 w-32 h-64 bg-green border-8 border-black rotate-45' />
        </div>

        <div className='relative z-10 max-w-6xl mx-auto p-6'>
            <div className='bg-white border-8 border-black p-8 shadow-brutal-xl'>
                <h2 className='text-5xl font-black uppercase mb-6'>
                    <span className='inline-block bg-black text-yellow px-6 py-3 shadow-brutal-lg transform -rotate-2'>
                        Choose Your Character
                    </span>
                </h2>

                <div className='mb-8 bg-blue text-white border-6 border-black p-6 shadow-brutal-md'>
                    <p className='font-black uppercase text-xl'>
                        Select a character for your opponent to guess
                    </p>

                    {opponentReady && (
                        <p className='mt-4 bg-green text-black font-black uppercase px-4 py-2 inline-block shadow-brutal-sm'>
                            ✓ Your opponent is ready
                        </p>
                    )}
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8'>
                    {availableCharacters.map((character, index) => {
                        const colors = ['bg-yellow', 'bg-pink', 'bg-green', 'bg-orange', 'bg-purple', 'bg-mint'];
                        const bgColor = colors[index % colors.length];
                        
                        return (
                            <button
                                key={character._id}
                                onClick={() => setSelectedCharacter(character._id)}
                                disabled={submitting}
                                className={`relative border-6 border-black p-4 transition-all transform hover:translate-x-[-4px] hover:translate-y-[-4px] ${
                                    selectedCharacter === character._id
                                        ? 'bg-black text-white shadow-brutal-xl scale-105'
                                        : `${bgColor} shadow-brutal-md hover:shadow-brutal-lg`
                                } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={{
                                    transform: `rotate(${Math.random() * 4 - 2}deg)`,
                                }}
                            >
                                <div className='flex flex-col items-center'>
                                    <div className='w-20 h-20 border-4 border-black overflow-hidden mb-3 bg-white'>
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
                                            <div className='w-full h-full flex items-center justify-center bg-black text-white'>
                                                <span className='text-3xl font-black'>
                                                    {character.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`font-black uppercase text-center ${
                                        selectedCharacter === character._id ? 'text-white' : 'text-black'
                                    }`}>
                                        {character.name}
                                    </span>
                                    <span className={`text-xs font-bold uppercase text-center ${
                                        selectedCharacter === character._id ? 'text-yellow' : 'text-black/80'
                                    }`}>
                                        {character.profession}
                                    </span>
                                </div>
                                {selectedCharacter === character._id && (
                                    <div className='absolute -top-3 -right-3 bg-red text-white border-4 border-black w-10 h-10 flex items-center justify-center font-black text-xl shadow-brutal-sm'>
                                        ✓
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className='flex justify-between gap-6'>
                    <button
                        onClick={() => router.push('/dashboard')}
                        disabled={submitting}
                        className={`bg-white text-black font-black uppercase px-8 py-4 border-6 border-black shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100 ${
                            submitting
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={confirmSelection}
                        disabled={!selectedCharacter || submitting}
                        className={`font-black uppercase px-8 py-4 border-6 border-black transition-all duration-100 ${
                            !selectedCharacter || submitting
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed shadow-brutal-sm'
                                : 'bg-pink text-white shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px]'
                        }`}
                    >
                        {submitting
                            ? 'Processing...'
                            : opponentReady
                              ? 'Confirm & Start'
                              : 'Confirm Selection'}
                    </button>
                </div>
            </div>
        </div>
    </div>
)
}
