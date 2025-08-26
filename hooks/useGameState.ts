/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useGameState.ts
import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { client, browserClient } from '@/sanity/lib/client';
import {
    ExpandedGame,
    ExpandedMember,
    ExpandedQuestionCategory,
} from '@/types/groqResults';
import { useUser } from '@clerk/nextjs';
import { calculateEliminatedFromHistory } from '@/lib/question-utils';

export default function useGameState(gameId: string) {
    const [game, setGame] = useState<ExpandedGame | null>(null);
    const [boardMembers, setBoardMembers] = useState<ExpandedMember[]>([]);
    const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
    const [questionCategories, setQuestionCategories] = useState<
        ExpandedQuestionCategory[]
    >([]);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<
        'disconnected' | 'connecting' | 'connected'
    >('disconnected');
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const { user } = useUser();
    const subscriptionRef = useRef<any>(null);
    const sanityUserIdRef = useRef<string | null>(null);
    const previousTurnRef = useRef<string | null>(null);
    const lastGameDataRef = useRef<string>('');
    const [, startTransition] = useTransition();

    const fetchGameData = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            // Get the Sanity member ID for the current user
            let sanityUserId = sanityUserIdRef.current;
            if (user?.id && !sanityUserId) {
                const memberDoc = await client.fetch(
                    `*[_type == "member" && clerkId == $clerkId][0]._id`,
                    { clerkId: user.id },
                );
                sanityUserId = memberDoc;
                sanityUserIdRef.current = sanityUserId;
            }

            // Fetch game data
            const gameData = await client.fetch<ExpandedGame>(
                `
                *[_type == "game" && _id == $gameId][0]{
                  ...,
                  _updatedAt,
                  playerOne->{_id, name},
                  playerTwo->{_id, name},
                  playerOneTarget->{_id},
                  playerTwoTarget->{_id},
                  boardMembers[]->{
                    _id, 
                    name, 
                    profession, 
                    image,
                    professionalAttributes,
                    technicalSkills,
                    personalTraits,
                    workStyle,
                    hobbies,
                    experience
                  }
                }
                `,
                { gameId },
            );

            if (!gameData) {
                setError('Game not found');
                setLoading(false);
                return;
            }

            // Only update state if the game data has actually changed
            const gameDataString = JSON.stringify({
                _updatedAt: gameData._updatedAt,
                status: gameData.status,
                currentTurn: gameData.currentTurn,
                moves: gameData.moves?.length,
                winner: gameData.winner
            });
            
            const hasChanges = gameDataString !== lastGameDataRef.current;
            
            if (hasChanges || !silent) {
                lastGameDataRef.current = gameDataString;
                
                // For silent updates, use transition to make them non-blocking
                if (silent) {
                    startTransition(() => {
                        setGame(gameData);
                        setBoardMembers(gameData.boardMembers || []);
                        setLastUpdate(new Date());
                    });
                } else {
                    setGame(gameData);
                    setBoardMembers(gameData.boardMembers || []);
                    setLastUpdate(new Date());
                }
            }

            // Check if it's our turn
            const myTurn = sanityUserId === gameData.currentTurn;
            setIsMyTurn(myTurn);

            // Play notification sound if it just became our turn
            if (
                myTurn &&
                previousTurnRef.current !== null &&
                previousTurnRef.current !== sanityUserId &&
                !silent // Don't play sound on silent updates
            ) {
                playNotificationSound();
            }
            
            // Only update turn ref if it changed
            if (gameData.currentTurn !== previousTurnRef.current) {
                previousTurnRef.current = gameData.currentTurn ?? null;
            }

            // Fetch question categories if not already loaded
            if (questionCategories.length === 0) {
                const categories = await client.fetch<
                    ExpandedQuestionCategory[]
                >(`
                    *[_type == "questionCategory"]{
                        _id, 
                        title, 
                        icon, 
                        description,
                        questions[]
                    }
                `);
                setQuestionCategories(categories);
            }

            // Calculate eliminated members based on game history
            if (gameData.moves && gameData.moves.length > 0 && sanityUserId) {
                const eliminated = calculateEliminatedFromHistory(
                    gameData.moves,
                    gameData.boardMembers,
                    questionCategories.length > 0
                        ? questionCategories
                        : await client.fetch<ExpandedQuestionCategory[]>(`
                        *[_type == "questionCategory"]{
                            _id, 
                            title, 
                            icon, 
                            description,
                            questions[]
                        }
                    `),
                    sanityUserId,
                );
                // Only update if eliminated list has changed
                const currentEliminatedStr = eliminatedIds.join(',');
                const newEliminatedStr = eliminated.join(',');
                if (currentEliminatedStr !== newEliminatedStr) {
                    if (silent) {
                        startTransition(() => {
                            setEliminatedIds(eliminated);
                        });
                    } else {
                        setEliminatedIds(eliminated);
                    }
                }
            }

            if (!silent) {
                setLoading(false);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching game data:', err);
            setError('Failed to load game data');
            if (!silent) {
                setLoading(false);
            }
        }
    }, [user?.id, gameId, questionCategories, eliminatedIds]);

    // Set up real-time subscription
    useEffect(() => {
        if (!gameId) return;

        let isSubscribed = true;

        async function setupSubscription() {
            try {
                console.log(
                    '[RT] Setting up real-time subscription for game:',
                    gameId,
                );
                setConnectionStatus('connecting');

                // Initial fetch
                await fetchGameData();

                // Create subscription
                const query = `*[_type == "game" && _id == $gameId]`;
                const params = { gameId };

                subscriptionRef.current = browserClient
                    .listen(query, params, {
                        includeResult: true,
                        includePreviousRevision: false,
                        visibility: 'query',
                        events: ['welcome', 'mutation', 'reconnect'],
                    })
                    .subscribe({
                        next: (update) => {
                            console.log(
                                '[RT] Game update received:',
                                update.type,
                                new Date().toISOString(),
                            );

                            if (update.type === 'welcome') {
                                setConnectionStatus('connected');
                                console.log(
                                    '[RT] Connected to real-time updates',
                                );
                            }

                            if (update.type === 'reconnect') {
                                console.log(
                                    '[RT] Reconnected to real-time updates',
                                );
                                // Refetch data on reconnect to ensure consistency
                                fetchGameData(true); // Silent refresh
                            }

                            if (update.type === 'mutation' && update.result) {
                                console.log('[RT] Game mutation detected');
                                // Check if this is a relevant change before refreshing
                                const mutation = update as any;
                                const documentId = mutation.documentId || mutation.result?._id;
                                
                                // Only refresh if the mutation is for our game
                                if (documentId === gameId) {
                                    fetchGameData(true); // Silent refresh
                                }
                            }
                        },
                        error: (err) => {
                            console.error('[RT] Subscription error:', err);
                            setConnectionStatus('disconnected');
                            setError('Real-time connection lost. Retrying...');

                            // Retry connection after a delay
                            setTimeout(() => {
                                if (isSubscribed) {
                                    setupSubscription();
                                }
                            }, 5000);
                        },
                    });
            } catch (error) {
                console.error('[RT] Error setting up subscription:', error);
                setConnectionStatus('disconnected');
            }
        }

        setupSubscription();

        // Cleanup
        return () => {
            isSubscribed = false;
            if (subscriptionRef.current) {
                console.log('[RT] Cleaning up subscription');
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
            setConnectionStatus('disconnected');
        };
    }, [gameId, fetchGameData]);

    const askQuestion = async (categoryId: string, questionIndex: number) => {
        if (!game || !isMyTurn) {
            console.log('Not your turn');
            return;
        }

        try {
            const response = await fetch('/api/games/ask-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    categoryId,
                    questionIndex,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error asking question:', errorData);
                throw new Error(errorData.error || 'Failed to ask question');
            }

            // Real-time subscription will handle the update
            // Just update local turn state optimistically
            setIsMyTurn(false);
        } catch (err) {
            console.error('Error in askQuestion:', err);
            throw err;
        }
    };

    const makeGuess = async (targetId: string) => {
        if (!game || !isMyTurn) {
            console.log('Not your turn');
            return;
        }

        try {
            const response = await fetch('/api/games/make-guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    memberId: targetId, // ← Changed from 'targetId' to 'memberId'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to make guess');
            }

            const data = await response.json();

            // Return the result for the caller to handle
            return data;
        } catch (err) {
            console.error('Error in makeGuess:', err);
            throw err;
        }
    };

    return {
        game,
        boardMembers,
        eliminatedIds,
        setEliminatedIds,
        questionCategories,
        isMyTurn,
        loading,
        error,
        askQuestion,
        makeGuess,
        fetchGameData,
        connectionStatus,
        lastUpdate,
    };
}

function playNotificationSound() {
    try {
        const audio = new Audio('/sounds/turn-notification.mp3');
        audio.play().catch((e) => console.log('Audio play error:', e));
    } catch (e) {
        console.log('Audio error:', e);
    }
}
