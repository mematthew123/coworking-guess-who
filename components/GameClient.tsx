'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';
import useGameState from '@/hooks/useGameState';
import GameBoard from '@/components/GameBoard';
import QuestionSelector from '@/components/QuestionSelector';
import GameHistoryPanel from '@/components/GameHistoryPanel';
import RealtimeIndicator from '@/components/RealtimeIndicator';
import GameChat from './GameChat';

interface GameClientProps {
    gameId: string;
}

export default function GameClient({ gameId }: GameClientProps) {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [sanityUserId, setSanityUserId] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [guessMode, setGuessMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const previousTurnRef = useRef<string | null>(null);

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

    // Step 2: Use our game state hook with the fetchGameData function exposed
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
        fetchGameData,
    } = useGameState(gameId);

    const handleAbandonGame = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to end this game? This action cannot be undone.',
        );

        if (!confirmed) return;

        try {
            setIsSubmitting(true);

            const response = await fetch('/api/games/abandon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to abandon game');
            }

            // The real-time subscription will handle the update
            // No manual fetch needed
        } catch (error) {
            console.error('Error abandoning game:', error);
            alert('There was an error ending the game. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 3: Track turn changes and play notification if needed
    useEffect(() => {
        if (game?.currentTurn && previousTurnRef.current !== game.currentTurn) {
            // Turn has changed
            const wasMyTurn = previousTurnRef.current === sanityUserId;
            const isNowMyTurn = game.currentTurn === sanityUserId;

            // If it just became my turn, play notification sound
            if (!wasMyTurn && isNowMyTurn) {
                try {
                    const audio = new Audio('/ding.mp3');
                    audio
                        .play()
                        .catch((e) => console.log('Audio play error:', e));
                } catch (e) {
                    console.log('Audio play error:', e);
                }
            }

            // Update the ref for next comparison
            previousTurnRef.current = game.currentTurn;
            setLastUpdate(new Date());
        }
    }, [game?.currentTurn, sanityUserId]);

    // Debug function to manually update turn (only in dev mode)
    // async function takeTurn() {
    //     if (!game || !sanityUserId) return;

    //     try {
    //         setIsSubmitting(true);
    //         const response = await fetch(`/api/debug/take-turn/${game._id}`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ playerId: sanityUserId }),
    //         });

    //         if (!response.ok) throw new Error('Failed to take turn');

    //         alert('Turn updated!');
    //         // Instead of reloading, fetch fresh data
    //         await fetchGameData();
    //         setLastUpdate(new Date());
    //     } catch (error) {
    //         console.error('Error taking turn:', error);
    //         alert('Error updating turn');
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // }

    // const TurnDebugInfo = () => {
    //     if (!game) return null;

    //     return (
    //         <div className='bg-white p-4 rounded shadow mb-4 text-sm'>
    //             <h3 className='font-bold mb-2'>Turn Debug Info</h3>
    //             <ul className='space-y-1'>
    //                 <li>Your Sanity ID: {sanityUserId || 'Unknown'}</li>
    //                 <li>Your Clerk ID: {user?.id || 'Unknown'}</li>
    //                 <li>Current Turn ID: {game.currentTurn || 'None'}</li>
    //                 <li>Is Your Turn: {isMyTurn ? 'Yes' : 'No'}</li>
    //                 <li>Player One ID: {game.playerOne?._id || 'Unknown'}</li>
    //                 <li>Player Two ID: {game.playerTwo?._id || 'Unknown'}</li>
    //                 <li>
    //                     Last Update:{' '}
    //                     {lastUpdate?.toLocaleTimeString() || 'Never'}
    //                 </li>
    //             </ul>
    //         </div>
    //     );
    // };

    // Navigate away when game ends (optional auto-redirect)
    useEffect(() => {
        if (
            game &&
            (game.status === 'completed' || game.status === 'abandoned')
        ) {
            // Optional: Add a delay before redirecting to show the game over screen
            const timer = setTimeout(() => {
                // Uncomment the next line to enable auto-redirect after 5 seconds
                // router.push('/games');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [game, router]);

    const handleToggleMember = async (memberId: string) => {
        if (!isMyTurn || isSubmitting) return;

        if (guessMode) {
            // Show confirmation dialog
            const confirmed = window.confirm(
                'Are you sure you want to guess this member?',
            );
            if (!confirmed) return;

            // Set submitting state to prevent multiple clicks
            setIsSubmitting(true);

            try {
                const isCorrect = await makeGuess(memberId);

                if (isCorrect) {
                    alert('Congratulations! You guessed correctly!');
                } else {
                    alert("Sorry, that's not the right person!");

                    // No need to reload the page - the game state hook will handle
                    // updating the UI when the game document changes
                }
            } catch (error) {
                console.error('Error making guess:', error);
                alert('There was an error with your guess. Please try again.');
            } finally {
                setIsSubmitting(false);
                setGuessMode(false);
            }
        } else {
            // Toggle elimination locally
            if (eliminatedIds.includes(memberId)) {
                setEliminatedIds(eliminatedIds.filter((id) => id !== memberId));
            } else {
                setEliminatedIds([...eliminatedIds, memberId]);
            }
        }
    };

    const handleAskQuestion = async (
        categoryId: string,
        questionIndex: number,
    ) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            await askQuestion(categoryId, questionIndex);
            // Real-time subscription handles the update
        } catch (error) {
            console.error('Error asking question:', error);
            alert('There was an error asking the question. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle loading states
    const loading = initialLoading || gameLoading || !isLoaded;

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-[50vh]'>
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

    // Game Over Screen
    if (game.status === 'completed' || game.status === 'abandoned') {
        const isWinner = game.winner === sanityUserId;
        const opponentName =
            game.playerOne._id === sanityUserId
                ? game.playerTwo.name
                : game.playerOne.name;

        return (
            <div className='container mx-auto p-4'>
                <div className='max-w-2xl mx-auto'>
                    <div className='bg-white rounded-lg shadow-lg p-8 text-center'>
                        <h1 className='text-3xl font-bold mb-6'>
                            {game.status === 'completed'
                                ? 'Game Over!'
                                : 'Game Ended'}
                        </h1>

                        {game.status === 'completed' && (
                            <>
                                {isWinner ? (
                                    <div className='mb-6'>
                                        <div className='text-6xl mb-4'>🎉</div>
                                        <h2 className='text-2xl font-semibold text-green-600 mb-2'>
                                            Congratulations!
                                        </h2>
                                        <p className='text-gray-700'>
                                            You correctly guessed your
                                            opponent&apos;s character!
                                        </p>
                                    </div>
                                ) : (
                                    <div className='mb-6'>
                                        <div className='text-6xl mb-4'>😔</div>
                                        <h2 className='text-2xl font-semibold text-red-600 mb-2'>
                                            Better luck next time!
                                        </h2>
                                        <p className='text-gray-700'>
                                            {opponentName} guessed your
                                            character correctly.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {game.status === 'abandoned' && (
                            <div className='mb-6'>
                                <div className='text-6xl mb-4'>🚪</div>
                                <p className='text-gray-700 text-lg'>
                                    This game was ended early.
                                </p>
                            </div>
                        )}

                        <div className='bg-gray-50 rounded p-4 mb-6'>
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                                <div>
                                    <span className='text-gray-600'>
                                        Started:
                                    </span>
                                    <p className='font-medium'>
                                        {game.startedAt
                                            ? new Date(
                                                  game.startedAt,
                                              ).toLocaleString()
                                            : 'Unknown'}
                                    </p>
                                </div>
                                <div>
                                    <span className='text-gray-600'>
                                        Ended:
                                    </span>
                                    <p className='font-medium'>
                                        {game.endedAt
                                            ? new Date(
                                                  game.endedAt,
                                              ).toLocaleString()
                                            : 'Just now'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-4 justify-center'>
                            <button
                                onClick={() => router.push('/games/new')}
                                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
                            >
                                Find New Opponent
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className='bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors'
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Include SanityLive to enable real-time updates */}
            {/* <SanityLive /> */}

            <div className='container mx-auto p-4'>
                <div className='mb-6'>
                    {/* Debug info - only show in development mode  add && <TurnDebugInfo />*/}
                    {process.env.NODE_ENV !== 'production'}
                    <h1 className='text-2xl font-bold text-gray-900'>
                        {game.playerOne.name} vs {game.playerTwo.name}
                    </h1>
                    <button
                        onClick={handleAbandonGame}
                        disabled={isSubmitting}
                        className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                        End Game
                    </button>

                    {/* {process.env.NODE_ENV !== 'production' && (
                        <button
                            onClick={takeTurn}
                            disabled={isSubmitting}
                            className='fixed bottom-4 left-4 z-50 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50'
                        >
                            {isSubmitting ? 'Updating...' : 'Take Turn'}
                        </button>
                    )} */}

                    <RealtimeIndicator
                        lastUpdated={lastUpdate || game._updatedAt}
                        isMyTurn={isMyTurn}
                        isRealTimeActive={true} // Always true with SanityLive
                        onRefresh={fetchGameData}
                    />

                    {/* New Turn Indicator */}
                    {/* <TurnIndicator /> */}
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Game Board */}
                    <div className='lg:col-span-2'>
                        <div className='bg-white p-4 rounded-lg shadow-md mb-4'>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-xl font-semibold'>
                                    Game Board
                                </h2>

                                {isMyTurn && (
                                    <button
                                        onClick={() => setGuessMode(!guessMode)}
                                        disabled={isSubmitting}
                                        className={`px-4 py-2 rounded-md transition-colors ${
                                            guessMode
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                        } disabled:opacity-50`}
                                    >
                                        {isSubmitting
                                            ? 'Processing...'
                                            : guessMode
                                              ? 'Cancel Guess'
                                              : 'Make a Guess'}
                                    </button>
                                )}
                            </div>

                            {guessMode && (
                                <div className='bg-yellow-100 p-3 mb-4 rounded-md text-sm'>
                                    <p>
                                        Click on a member card to make your
                                        final guess!
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
                        {/* Question Selector - Only show if it's player's turn and not in guess mode */}
                        {isMyTurn && !guessMode && (
                            <QuestionSelector
                                categories={questionCategories}
                                onSelectQuestion={handleAskQuestion}
                                disabled={
                                    !isMyTurn || guessMode || isSubmitting
                                }
                                recentlyAskedIds={
                                    game.moves
                                        ?.slice(-5)
                                        .map((move) => move.questionId)
                                        .filter(Boolean) as string[]
                                }
                                boardMembers={boardMembers}
                                eliminatedIds={eliminatedIds}
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
                                            Click on the member you think is
                                            your opponent!
                                        </p>
                                    </div>
                                ) : (
                                    // Normal question mode
                                    <div className='bg-white rounded-lg shadow-md p-4'>
                                        <h3 className='text-xl font-bold text-gray-800 mb-4'>
                                            Ask a Question
                                        </h3>
                                        <p className='text-gray-600 mb-2'>
                                            Select a question category above to
                                            ask your opponent.
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
                                        The game will update automatically when
                                        it&apos;s your turn.
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
                                        <span className='text-gray-600'>
                                            Status:
                                        </span>
                                        <span
                                            className={`font-medium ${
                                                game.status === 'active'
                                                    ? 'text-green-600'
                                                    : game.status ===
                                                        'completed'
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
                                        <span className='text-gray-600'>
                                            Started:
                                        </span>
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
                                                    : game.winner ===
                                                        game.playerOne._id
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

            <h1 className='text-2xl font-bold text-gray-900 mb-4 mt-8'>
                Game Chat
            </h1>

            {/* Single GameChat instance - completely outside */}
            {game && sanityUserId && (
                <GameChat
                    gameId={gameId}
                    currentUserId={sanityUserId}
                    currentUserName={
                        game.playerOne._id === sanityUserId
                            ? game.playerOne.name || ''
                            : game.playerTwo.name || ''
                    }
                    opponentName={
                        game.playerOne._id === sanityUserId
                            ? game.playerTwo.name || ''
                            : game.playerOne.name || ''
                    }
                    isMyTurn={isMyTurn}
                    onSendMessage={(message) => {
                        console.log('Message sent:', message);
                    }}
                />
            )}
        </>
    );
}
