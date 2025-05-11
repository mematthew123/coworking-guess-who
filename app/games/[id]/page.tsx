/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';
import useGameState from '@/hooks/useGameState';
import GameBoard from '@/components/GameBoard';
import QuestionSelector from '@/components/QuestionSelector';
import GameHistoryPanel from '@/components/GameHistoryPanel';
import RealtimeIndicator from '@/components/RealtimeIndicator';
import { ExpandedGame } from '@/types/groqResults';

export default function GamePage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [sanityUserId, setSanityUserId] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [guessMode, setGuessMode] = useState(false);
    const [pollingActive, setPollingActive] = useState(true);
    
    // Step 1: Get the Sanity user ID that corresponds to the Clerk ID
    useEffect(() => {
        async function fetchSanityUserId() {
            if (!user) return;

            try {
                const member = await client.fetch(
                    `*[_type == "member" && clerkId == $clerkId][0]._id`,
                    { clerkId: user.id },
                );

                if (member) {
                    setSanityUserId(member);
                }
                setInitialLoading(false);
            } catch (error) {
                console.error('Error fetching Sanity user ID:', error);
                setInitialLoading(false);
            }
        }

        if (isLoaded) {
            fetchSanityUserId();
        }
    }, [isLoaded, user]);

    // Step 2: Use our game state hook once we have the Sanity user ID
    const {
        game,
        boardMembers,
        eliminatedIds,
        setEliminatedIds,
        questionCategories,
        isMyTurn,
        loading: gameLoading,
        error,
        askQuestion,
        makeGuess,
    } = useGameState(id as string);

    // Step 3: Set up polling for real-time updates
    useEffect(() => {
        if (!id || !game) return;

        let mounted = true;
        const POLL_INTERVAL = 5000; // 5 seconds

        async function pollForUpdates() {
            try {
                // Only poll if we're not the current player
                if (!isMyTurn) {
                    const updatedGame = await client.fetch<ExpandedGame>(`
                        *[_type == "game" && _id == $gameId][0]{
                            ...,
                            _updatedAt,
                            currentTurn,
                            status,
                            winner,
                            playerOne->{_id, name},
                            playerTwo->{_id, name},
                            moves[]
                        }
                    `, { gameId: id });

                    if (mounted && updatedGame) {
                        // Check if it's now our turn
                        if (updatedGame.currentTurn === sanityUserId && !isMyTurn) {
                            // It's now our turn! Reload the page
                            window.location.reload();
                            
                            // Try to play a notification sound
                            try {
                                const audio = new Audio('/ding.mp3');
                                audio.play();
                            } catch (e) {
                                console.log('Could not play notification sound');
                            }
                        }
                        
                        // Check if game status changed
                        if (game && updatedGame.status !== game.status) {
                            window.location.reload();
                        }
                    }
                }
            } catch (err) {
                console.error('Error polling for updates:', err);
                if (mounted) {
                    setPollingActive(false);
                }
            }
        }

        // Set up polling interval
        const interval = setInterval(pollForUpdates, POLL_INTERVAL);

        // Clean up on unmount
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [id, game, isMyTurn, sanityUserId]);

    async function takeTurn() {
        if (!game || !sanityUserId) return;

        try {
            const response = await fetch(`/api/debug/take-turn/${game._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: sanityUserId }),
            });

            if (!response.ok) throw new Error('Failed to take turn');

            alert('Turn updated! Reloading...');
            window.location.reload();
        } catch (error) {
            console.error('Error taking turn:', error);
            alert('Error updating turn');
        }
    }

    const TurnDebugInfo = () => {
        if (!game) return null;

        return (
            <div className='bg-white p-4 rounded shadow mb-4 text-sm'>
                <h3 className='font-bold mb-2'>Turn Debug Info</h3>
                <ul className='space-y-1'>
                    <li>Your Sanity ID: {sanityUserId || 'Unknown'}</li>
                    <li>Your Clerk ID: {user?.id || 'Unknown'}</li>
                    <li>Current Turn ID: {game.currentTurn || 'None'}</li>
                    <li>Is Your Turn: {isMyTurn ? 'Yes' : 'No'}</li>
                    <li>Player One ID: {game.playerOne?._id || 'Unknown'}</li>
                    <li>Player Two ID: {game.playerTwo?._id || 'Unknown'}</li>
                </ul>
            </div>
        );
    };

    const handleToggleMember = async (memberId: string) => {
        if (!isMyTurn) return;

        if (guessMode) {
            // Show confirmation dialog
            const confirmed = window.confirm(
                'Are you sure you want to guess this member?',
            );
            if (!confirmed) return;

            const isCorrect = await makeGuess(memberId);
            if (isCorrect) {
                alert('Congratulations! You guessed correctly!');
            } else {
                alert("Sorry, that's not the right person!");
            }
            setGuessMode(false);
        } else {
            // Toggle elimination locally using the setter from the hook
            if (eliminatedIds.includes(memberId)) {
                setEliminatedIds(eliminatedIds.filter((id) => id !== memberId));
            } else {
                setEliminatedIds([...eliminatedIds, memberId]);
            }
        }
    };

    const handleAskQuestion = async (categoryId: string, questionIndex: number) => {
        try {
            await askQuestion(categoryId, questionIndex);
            // If successful, wait a second and reload the page to reflect changes
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error asking question:', error);
            alert('There was an error asking the question. Please try again.');
        }
    };

    // Handle loading states
    const loading = initialLoading || gameLoading || !isLoaded;

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    // Handle authentication check
    if (isLoaded && !user) {
        return (
            <div className='max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md'>
                <h2 className='text-xl font-bold mb-4'>Sign In Required</h2>
                <p className='mb-6'>You need to sign in to access this game.</p>
                <button
                    onClick={() => router.push('/sign-in')}
                    className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700'
                >
                    Sign In
                </button>
            </div>
        );
    }

    // Handle case where user doesn't have a Sanity profile
    if (!sanityUserId) {
        return (
            <div className='max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md'>
                <h2 className='text-xl font-bold mb-4'>Profile Required</h2>
                <p className='mb-6'>
                    You need to complete your profile to play games.
                </p>
                <button
                    onClick={() => router.push('/onboarding')}
                    className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700'
                >
                    Complete Profile
                </button>
            </div>
        );
    }

    if (error) {
        return (
            <div className='p-6 max-w-4xl mx-auto'>
                <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded'>
                    <h3 className='text-red-700 font-bold'>Error</h3>
                    <p className='text-red-700'>{error}</p>
                </div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className='p-6 max-w-4xl mx-auto'>
                <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded'>
                    <h3 className='text-yellow-700 font-bold'>
                        Game Not Found
                    </h3>
                    <p className='text-yellow-700'>
                        The requested game could not be found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto p-4'>
            <div className='mb-6'>
                {process.env.NODE_ENV !== 'production' && <TurnDebugInfo />}
                <h1 className='text-2xl font-bold text-gray-900'>
                    {game.playerOne.name} vs {game.playerTwo.name}
                </h1>
                {process.env.NODE_ENV !== 'production' && (
                    <button
                        onClick={takeTurn}
                        className='fixed bottom-4 left-4 z-50 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
                    >
                        Take Turn
                    </button>
                )}

                {/* Add real-time indicator */}
                <RealtimeIndicator
                    lastUpdated={game._updatedAt}
                    isMyTurn={isMyTurn}
                    isRealTimeActive={pollingActive}
                />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Game Board */}
                <div className='lg:col-span-2'>
                    <div className='bg-white p-4 rounded-lg shadow-md mb-4'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>
                                {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
                            </h2>

                            {isMyTurn && (
                                <button
                                    onClick={() => setGuessMode(!guessMode)}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        guessMode
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                >
                                    {guessMode
                                        ? 'Cancel Guess'
                                        : 'Make a Guess'}
                                </button>
                            )}
                        </div>

                        {guessMode && (
                            <div className='bg-yellow-100 p-3 mb-4 rounded-md text-sm'>
                                <p>
                                    Click on a member card to make your final
                                    guess!
                                </p>
                            </div>
                        )}

                        <GameBoard
                            members={boardMembers}
                            eliminatedIds={eliminatedIds}
                            onToggleMember={handleToggleMember}
                            readonly={!isMyTurn || (isMyTurn && !guessMode)}
                        />
                    </div>
                </div>

                {/* Game Controls */}
                <div className='space-y-6'>
                    {/* Question Selector - Only show if it's player's turn and not in guess mode */}
                    {isMyTurn && !guessMode && (
                        <QuestionSelector
                            categories={questionCategories}
                            onSelectQuestion={handleAskQuestion}
                            disabled={!isMyTurn || guessMode}
                        />
                    )}

                    {/* Game Controls */}
                    <div className='space-y-6'>
                        {isMyTurn ? (
                            // When it's your turn
                            guessMode ? (
                                // In guess mode
                                <div className='bg-white rounded-lg shadow-md p-4'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-4'>
                                        Make Your Guess
                                    </h3>
                                    <p className='text-gray-600 mb-2'>
                                        Click on the member you think is your
                                        opponent!
                                    </p>
                                </div>
                            ) : (
                                // Normal question mode
                                <div className='bg-white rounded-lg shadow-md p-4'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-4'>
                                        Ask a Question
                                    </h3>
                                    <p className='text-gray-600 mb-2'>
                                        Select a question category above to ask your opponent.
                                    </p>
                                </div>
                            )
                        ) : (
                            // When it's NOT your turn
                            <div className='bg-white rounded-lg shadow-md p-4'>
                                <h3 className='text-xl font-bold text-gray-800 mb-4'>
                                    Opponent&apos;s Turn
                                </h3>
                                <p className='text-gray-600'>
                                    Waiting for your opponent to make their
                                    move...
                                </p>
                                <p className='text-gray-500 text-sm mt-2'>
                                    The page will automatically refresh when it&apos;s your turn.
                                </p>
                            </div>
                        )}

                        {/* Game History - always show regardless of turn */}
                        <GameHistoryPanel
                            moves={game.moves || []}
                            currentPlayerId={sanityUserId || ''}
                            boardMembers={boardMembers}
                        />

                        {/* Game Status */}
                        <div className='bg-white rounded-lg shadow-md p-4'>
                            <h3 className='text-xl font-bold text-gray-800 mb-2'>
                                Game Status
                            </h3>
                            <div className='space-y-2'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Status:</span>
                                    <span
                                        className={`font-medium ${
                                            game.status === 'active'
                                                ? 'text-green-600'
                                                : game.status === 'completed'
                                                  ? 'text-blue-600'
                                                  : 'text-yellow-600'
                                        }`}
                                    >
                                        {game.status === 'active'
                                            ? 'In Progress'
                                            : game.status === 'completed'
                                              ? 'Completed'
                                              : 'Abandoned'}
                                    </span>
                                </div>

                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Started:</span>
                                    <span className='font-medium'>
                                        {game.startedAt
                                            ? new Date(
                                                  game.startedAt,
                                              ).toLocaleString()
                                            : 'Unknown'}
                                    </span>
                                </div>

                                {game.endedAt && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                            Ended:
                                        </span>
                                        <span className='font-medium'>
                                            {new Date(
                                                game.endedAt,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                
                                {game.winner && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                            Winner:
                                        </span>
                                        <span className='font-medium text-blue-600'>
                                            {game.winner === sanityUserId 
                                                ? 'You!' 
                                                : game.winner === game.playerOne._id 
                                                    ? game.playerOne.name
                                                    : game.playerTwo.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}