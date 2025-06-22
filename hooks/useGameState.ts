/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '@/sanity/lib/client';
import { useUser } from '@clerk/nextjs';
import { ExpandedGame } from '@/types/groqResults';
import { QuestionCategory } from '@/sanity.types';

export default function useGameState(gameId: string) {
    const { user } = useUser();
    const [game, setGame] = useState<ExpandedGame | null>(null);
    const [boardMembers, setBoardMembers] = useState<ExpandedGame['boardMembers']>([]);
    const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
    const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>([]);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<any>(null);

    // Helper to get current user's Sanity ID
    const getCurrentUserId = useCallback((gameData: ExpandedGame) => {
        if (!user?.id) return null;
        
        if (gameData.playerOne.clerkId === user.id) return gameData.playerOne._id;
        if (gameData.playerTwo.clerkId === user.id) return gameData.playerTwo._id;
        return null;
    }, [user?.id]);

    // Fetch game data function
    const fetchGameData = useCallback(async () => {
        if (!gameId) return;

        try {
            const gameData = await client.fetch(
                `*[_type == "game" && _id == $gameId][0]{
                    ...,
                    playerOne->{_id, name, clerkId},
                    playerTwo->{_id, name, clerkId},
                    playerOneTarget->{...},
                    playerTwoTarget->{...},
                    boardMembers[]->{...},
                    moves[]{
                        ...,
                        categoryId,
                        questionIndex
                    }
                }`,
                { gameId }
            );

            if (!gameData) {
                setError('Game not found');
                setLoading(false);
                return;
            }

            setGame(gameData);
            setBoardMembers(gameData.boardMembers || []);
            
            // Update turn status
            const currentUserId = getCurrentUserId(gameData);
            setIsMyTurn(gameData.currentTurn === currentUserId);

            // Process eliminated members from moves
            const eliminated = new Set<string>();
            for (const move of gameData.moves || []) {
                if (move.action === 'elimination' && move.eliminatedMembers) {
                    move.eliminatedMembers.forEach((id: string) => eliminated.add(id));
                }
            }
            setEliminatedIds(Array.from(eliminated));

            // Fetch question categories
            const categories = await client.fetch(
                `*[_type == "questionCategory"]{
                    _id,
                    title,
                    questions
                }`
            );
            setQuestionCategories(categories);

            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Error fetching game data:', err);
            setError('Failed to load game');
            setLoading(false);
        }
    }, [gameId, getCurrentUserId]);

    // Set up real-time subscription
    useEffect(() => {
        if (!gameId) return;

        // Initial fetch
        fetchGameData();

        // Set up real-time listener
        const query = `*[_type == "game" && _id == $gameId]`;
        const params = { gameId };

        subscriptionRef.current = client.listen(query, params).subscribe({
            next: (update) => {
                console.log('Real-time update received:', update);
                
                // Fetch fresh data on any change
                if (update.type === 'mutation') {
                    fetchGameData();
                }
            },
            error: (err) => {
                console.error('Real-time subscription error:', err);
                setError('Real-time connection lost');
            }
        });

        // Cleanup subscription
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [gameId, fetchGameData]);

    // Ask question function with fresh data check
    const askQuestion = async (categoryId: string, questionIndex: number) => {
        if (!game) {
            console.error('No game data');
            return;
        }

        // Fetch fresh game data before making the move
        try {
            const freshGameData = await client.fetch(
                `*[_type == "game" && _id == $gameId][0]{
                    currentTurn,
                    playerOne->{_id, clerkId},
                    playerTwo->{_id, clerkId},
                    status
                }`,
                { gameId }
            );

            if (!freshGameData) {
                throw new Error('Game not found');
            }

            if (freshGameData.status !== 'active') {
                throw new Error('Game is no longer active');
            }

            const currentUserId = getCurrentUserId(freshGameData);
            const isActuallyMyTurn = freshGameData.currentTurn === currentUserId;

            if (!isActuallyMyTurn) {
                console.log('Not your turn after fresh data check');
                // Update local state to reflect the correct turn
                setIsMyTurn(false);
                throw new Error('Not your turn');
            }

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
                throw new Error(errorData.error || 'Failed to ask question');
            }

            // The real-time subscription will automatically update the UI
            // No need to manually fetch or reload
        } catch (err) {
            console.error('Error asking question:', err);
            throw err;
        }
    };

    // Make guess function with fresh data check
    const makeGuess = async (memberId: string) => {
        if (!game) {
            console.error('No game data');
            return false;
        }

        try {
            // Fetch fresh game data before making the guess
            const freshGameData = await client.fetch(
                `*[_type == "game" && _id == $gameId][0]{
                    currentTurn,
                    playerOne->{_id, clerkId},
                    playerTwo->{_id, clerkId},
                    status
                }`,
                { gameId }
            );

            if (!freshGameData) {
                throw new Error('Game not found');
            }

            if (freshGameData.status !== 'active') {
                throw new Error('Game is no longer active');
            }

            const currentUserId = getCurrentUserId(freshGameData);
            const isActuallyMyTurn = freshGameData.currentTurn === currentUserId;

            if (!isActuallyMyTurn) {
                console.log('Not your turn after fresh data check');
                // Update local state to reflect the correct turn
                setIsMyTurn(false);
                throw new Error('Not your turn');
            }

            const response = await fetch('/api/games/make-guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    memberId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to make guess');
            }

            const data = await response.json();
            // The real-time subscription will handle the update
            return data.correct;
        } catch (err) {
            console.error('Error making guess:', err);
            return false;
        }
    };

    return {
        game,
        setGame,
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
    };
}