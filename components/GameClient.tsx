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
                    audio.play().catch(e => console.log('Audio play error:', e));
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
    async function takeTurn() {
        if (!game || !sanityUserId) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/debug/take-turn/${game._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: sanityUserId }),
            });

            if (!response.ok) throw new Error('Failed to take turn');

            alert('Turn updated!');
            // Instead of reloading, fetch fresh data
            await fetchGameData();
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error taking turn:', error);
            alert('Error updating turn');
        } finally {
            setIsSubmitting(false);
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
                    <li>Last Update: {lastUpdate?.toLocaleTimeString() || 'Never'}</li>
                </ul>
            </div>
        );
    };

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

    const handleAskQuestion = async (categoryId: string, questionIndex: number) => {
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            await askQuestion(categoryId, questionIndex);
            
            // Let the SanityLive/fetchGameData handle the update
            // No need for page reload
        } catch (error) {
            console.error('Error asking question:', error);
            alert('There was an error asking the question. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Manually refresh game data periodically when it's not your turn
    // This serves as a backup in case the live updates miss something
    useEffect(() => {
        if (!gameId || !game || isMyTurn) return;
        
        const refreshInterval = setInterval(() => {
            fetchGameData();
        }, 30000); // Check every 30 seconds as a backup
        
        return () => clearInterval(refreshInterval);
    }, [gameId, game, isMyTurn, fetchGameData]);

    // Enhanced TurnIndicator component
    const TurnIndicator = () => {
        if (!game) return null;
        
        const opponentName = game.playerOne._id === sanityUserId 
            ? game.playerTwo.name 
            : game.playerOne.name;
            
        return (
            <div className={`p-4 rounded-lg mb-4 ${
                isMyTurn 
                    ? 'bg-blue-100 border-l-4 border-blue-500' 
                    : 'bg-gray-100 border-l-4 border-gray-500'
            }`}>
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                        isMyTurn ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
                    }`}></div>
                    
                    <h3 className="font-medium text-lg">
                        {isMyTurn ? "It's Your Turn!" : `Waiting for ${opponentName}`}
                    </h3>
                </div>
                
                {isMyTurn && (
                    <p className="mt-2 text-blue-700 text-sm">
                        Choose a question or make a guess to continue the game
                    </p>
                )}
            </div>
        );
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

    return (
        <>
            {/* Include SanityLive to enable real-time updates */}
            {/* <SanityLive /> */}
            
            <div className='container mx-auto p-4'>
                <div className='mb-6'>
                    {process.env.NODE_ENV !== 'production' && <TurnDebugInfo />}
                    <h1 className='text-2xl font-bold text-gray-900'>
                        {game.playerOne.name} vs {game.playerTwo.name}
                    </h1>
                    
                    {process.env.NODE_ENV !== 'production' && (
                        <button
                            onClick={takeTurn}
                            disabled={isSubmitting}
                            className='fixed bottom-4 left-4 z-50 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50'
                        >
                            {isSubmitting ? 'Updating...' : 'Take Turn'}
                        </button>
                    )}

                    <RealtimeIndicator
                        lastUpdated={lastUpdate || game._updatedAt}
                        isMyTurn={isMyTurn}
                        isRealTimeActive={true} // Always true with SanityLive
                    />
                    
                    {/* New Turn Indicator */}
                    <TurnIndicator />
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
                                disabled={!isMyTurn || guessMode || isSubmitting}
                                recentlyAskedIds={game.moves?.slice(-5).map(move => move.questionId).filter(Boolean) as string[]}
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
                                        The game will update automatically when it&apos;s your turn.
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
        </>
    );
}